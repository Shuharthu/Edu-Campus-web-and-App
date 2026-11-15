import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WsAdapter } from '@nestjs/platform-ws';
import { authenticator } from 'otplib';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { loadRootEnv } from '../src/config/load-env';
import { DEV_TOTP_SECRETS } from '../prisma/seed';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Phase 9 Compliance, Security & OWASP Hardening E2E against Supabase PostgreSQL', () => {
  jest.setTimeout(45000);
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let studentId: string;

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

    prisma = app.get(PrismaService);

    // Authenticate as Admin
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'tariq.mahmud@university.edu', password: 'SmartEdu#2026' })
      .expect(201);

    const code = authenticator.generate(DEV_TOTP_SECRETS.admin);
    const mfaRes = await request(app.getHttpServer())
      .post('/api/v1/auth/mfa/verify')
      .send({ mfaToken: loginRes.body.mfaToken, code })
      .expect(201);

    adminToken = mfaRes.body.accessToken;

    const student = await prisma.student.findFirst({
      where: {
        OR: [
          { studentNumber: '2024-CSE-0042' },
          { user: { fullName: { contains: 'Rafiq' } } },
        ],
      },
    });
    if (student) studentId = student.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. GET /api/v1/compliance/owasp-posture - should verify OWASP Top 10 defensive controls', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/compliance/owasp-posture')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.status).toBe('HARDENED');
    expect(res.body).toHaveProperty('owaspTop10Coverage');
    expect(res.body.owaspTop10Coverage).toHaveProperty('A01_BrokenAccessControl');
    expect(res.body.owaspTop10Coverage).toHaveProperty('A03_Injection');
    expect(res.body.owaspTop10Coverage).toHaveProperty('A07_AuthFailures');
  });

  it('2. POST /api/v1/compliance/export - should export complete FERPA/GDPR student portfolio', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/compliance/export')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        studentId,
        reason: 'Student statutory annual educational data portability request',
      })
      .expect(201);

    expect(res.body).toHaveProperty('complianceStandard');
    expect(res.body.complianceStandard).toContain('FERPA & GDPR');
    expect(res.body).toHaveProperty('personalIdentity');
    expect(res.body).toHaveProperty('academicRecord');
    expect(res.body).toHaveProperty('courseEnrollments');
    expect(res.body).toHaveProperty('financialLedger');
    expect(res.body).toHaveProperty('libraryCirculation');
    expect(Array.isArray(res.body.courseEnrollments)).toBe(true);
  });

  it('3. POST /api/v1/compliance/erasure-request - should log formal erasure ticket with statutory notices', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/compliance/erasure-request')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        reason: 'Graduated alumni requesting removal of marketing telemetry and push tokens',
      })
      .expect(201);

    expect(res.body).toHaveProperty('ticketId');
    expect(res.body.ticketId).toContain('GDPR-');
    expect(res.body.status).toBe('PENDING_REGISTRAR_REVIEW');
    expect(res.body).toHaveProperty('statutoryNotice');
    expect(res.body.statutoryNotice).toContain('FERPA 34 CFR § 99.31');
  });

  it('4. GET /api/v1/compliance/audit-trail - should return immutable audit logs with actor attribution', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/compliance/audit-trail?limit=10')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('action');
    expect(res.body[0]).toHaveProperty('module');
    expect(res.body[0]).toHaveProperty('createdAt');
  });
});
