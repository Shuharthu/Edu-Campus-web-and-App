import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WsAdapter } from '@nestjs/platform-ws';
import { authenticator } from 'otplib';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { loadRootEnv } from '../src/config/load-env';
import { DEV_TOTP_SECRETS } from '../prisma/seed';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Phase 6 Communication & Realtime E2E against Supabase PostgreSQL', () => {
  jest.setTimeout(45000);
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let announcementId: string;
  let threadId: string;

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

    const ann = await prisma.announcement.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (ann) {
      announcementId = ann.id;
    }

    const thread = await prisma.communicationThread.findFirst({
      orderBy: { createdAt: 'desc' },
    });
    if (thread) {
      threadId = thread.id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/communication/announcements returns institutional announcements', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/communication/announcements')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].title).toBeDefined();
    expect(res.body[0].priority).toBeDefined();
    expect(res.body[0].author).toBeDefined();
  });

  it('POST /api/v1/communication/announcements creates announcement and dispatch logs', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/communication/announcements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Emergency Weather Advisory - Campus Operating on Online Mode',
        content: 'Due to severe weather warnings, all campus classes will transition to online sessions today.',
        priority: 'EMERGENCY',
        targetScope: 'ALL',
        sendPush: true,
        sendEmail: true,
        isPinned: true,
      })
      .expect(201);

    expect(res.body.title).toContain('Emergency Weather Advisory');
    expect(res.body.priority).toBe('EMERGENCY');
    expect(res.body.isPinned).toBe(true);
    expect(res.body.statsDeliveryCount).toBeGreaterThan(0);
  });

  it('POST /api/v1/communication/announcements/:id/read records read receipt', async () => {
    if (!announcementId) return;

    const res = await request(app.getHttpServer())
      .post(`/api/v1/communication/announcements/${announcementId}/read`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.readAt).toBeDefined();
  });

  it('GET /api/v1/communication/threads lists discussion channels', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/communication/threads')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].title).toBeDefined();
    expect(res.body[0].threadType).toBeDefined();
  });

  it('GET /api/v1/communication/threads/:id/messages returns message stream', async () => {
    if (!threadId) return;

    const res = await request(app.getHttpServer())
      .get(`/api/v1/communication/threads/${threadId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].content).toBeDefined();
    expect(res.body[0].sender).toBeDefined();
  });

  it('POST /api/v1/communication/threads/:id/messages posts a message to thread', async () => {
    if (!threadId) return;

    const res = await request(app.getHttpServer())
      .post(`/api/v1/communication/threads/${threadId}/messages`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        content: 'Assignment 2 deadline extended by 24 hours to accommodate lab maintenance.',
      })
      .expect(201);

    expect(res.body.content).toContain('Assignment 2 deadline extended');
    expect(res.body.sender).toBeDefined();
  });

  it('GET /api/v1/communication/dispatch-logs returns message dispatch records and queue health', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/communication/dispatch-logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.metrics).toBeDefined();
    expect(res.body.metrics.totalDispatches).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(res.body.logs)).toBe(true);
  });
});
