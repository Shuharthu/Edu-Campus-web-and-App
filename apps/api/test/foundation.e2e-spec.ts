import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WsAdapter } from '@nestjs/platform-ws';
import { authenticator } from 'otplib';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { loadRootEnv } from '../src/config/load-env';
import { DEV_TOTP_SECRETS } from '../prisma/seed';

describe('Phase 2 Foundation E2E (Auth, MFA, RBAC, Preview, Audit)', () => {
  jest.setTimeout(45000);
  let app: INestApplication;

  beforeAll(async () => {
    loadRootEnv();
    process.env.ENABLE_LOCAL_NO_REDIS_DEV = 'true';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useWebSocketAdapter(new WsAdapter(app));
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health/ready returns database ok', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health/ready').expect(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.database).toBe('ok');
  });

  it('enforces staff MFA, multi-role switch, and refresh token reuse revocation', async () => {
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'dr.rahman@university.edu', password: 'SmartEdu#2026' })
      .expect(201);

    expect(loginRes.body.status).toBe('MFA_REQUIRED');

    const code = authenticator.generate(DEV_TOTP_SECRETS.faculty);
    const mfaRes = await request(app.getHttpServer())
      .post('/api/v1/auth/mfa/verify')
      .send({ mfaToken: loginRes.body.mfaToken, code })
      .expect(201);

    expect(mfaRes.body.status).toBe('AUTHENTICATED');
    const accessToken = mfaRes.body.accessToken as string;
    const refresh1 = mfaRes.body.refreshToken as string;

    const meRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meRes.body.assignments.length).toBeGreaterThanOrEqual(2);
    const deptHead = meRes.body.assignments.find(
      (a: { roleSlug: string }) => a.roleSlug === 'department_head',
    );
    expect(deptHead).toBeDefined();

    const switchRes = await request(app.getHttpServer())
      .post('/api/v1/auth/switch-role')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ assignmentId: deptHead.id })
      .expect(201);

    expect(switchRes.body.activeRole.slug).toBe('department_head');

    // Refresh token rotation
    const refreshRes = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: refresh1 })
      .expect(201);

    expect(refreshRes.body.refreshToken).not.toBe(refresh1);

    // Reusing already-rotated refresh1 must revoke the whole family and fail
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: refresh1 })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: refreshRes.body.refreshToken })
      .expect(401);
  });

  it('blocks mutations in Admin View-as-role preview and isolates Students from console endpoints', async () => {
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'tariq.mahmud@university.edu', password: 'SmartEdu#2026' })
      .expect(201);

    const adminCode = authenticator.generate(DEV_TOTP_SECRETS.admin);
    const adminMfa = await request(app.getHttpServer())
      .post('/api/v1/auth/mfa/verify')
      .send({ mfaToken: adminLogin.body.mfaToken, code: adminCode })
      .expect(201);

    const adminToken = adminMfa.body.accessToken as string;
    const rolesRes = await request(app.getHttpServer())
      .get('/api/v1/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const facultyRole = rolesRes.body.find((r: { slug: string }) => r.slug === 'faculty');
    const previewRes = await request(app.getHttpServer())
      .post('/api/v1/auth/preview-role')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ roleId: facultyRole.id })
      .expect(201);

    const previewToken = previewRes.body.accessToken as string;

    // Preview token must reject POST mutations with 403
    await request(app.getHttpServer())
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${previewToken}`)
      .send({ slug: 'blocked_in_preview', name: 'Blocked', permissionIds: [] })
      .expect(403);

    // Student login does not require staff MFA and is denied audit logs
    const studentLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'rafiq.hasan@university.edu', password: 'SmartEdu#2026' })
      .expect(201);

    expect(studentLogin.body.status).toBe('AUTHENTICATED');
    await request(app.getHttpServer())
      .get('/api/v1/audit-logs')
      .set('Authorization', `Bearer ${studentLogin.body.accessToken}`)
      .expect(403);
  });
});
