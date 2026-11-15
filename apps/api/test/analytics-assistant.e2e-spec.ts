import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WsAdapter } from '@nestjs/platform-ws';
import { authenticator } from 'otplib';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { loadRootEnv } from '../src/config/load-env';
import { DEV_TOTP_SECRETS } from '../prisma/seed';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Phase 8 Analytics, Surveys & Smart Assistant E2E against Supabase PostgreSQL', () => {
  jest.setTimeout(45000);
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let studentId: string;
  let surveyId: string;
  let studyBlockId: string;

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
    if (!student) throw new Error('Student Rafiq not found');
    studentId = student.id;

    const survey = await prisma.survey.findFirst({
      where: { status: 'ACTIVE' },
    });
    if (survey) surveyId = survey.id;

    const block = await prisma.studyPlanBlock.findFirst({
      where: { studentId },
    });
    if (block) studyBlockId = block.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. GET /api/v1/analytics/overview - should return institutional executive KPIs', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/analytics/overview')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('retentionRatePct');
    expect(res.body).toHaveProperty('avgAttendancePct');
    expect(res.body).toHaveProperty('meanCgpa');
    expect(res.body).toHaveProperty('totalBilled');
    expect(res.body.retentionRatePct).toBeGreaterThan(90);
  });

  it('2. GET /api/v1/analytics/at-risk - should return explainable student risk scores', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/analytics/at-risk')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('riskScore');
    expect(res.body[0]).toHaveProperty('riskTier');
    expect(res.body[0]).toHaveProperty('riskFactors');
  });

  it('3. GET /api/v1/analytics/surveys - should return active course evaluations and ratings', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/analytics/surveys')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('responseCount');
    expect(res.body[0]).toHaveProperty('avgOverall');
  });

  it('4. POST /api/v1/analytics/surveys/respond - should record anonymous student survey response', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/analytics/surveys/respond')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        surveyId,
        clarityRating: 5,
        engagementRating: 4,
        fairnessRating: 5,
        overallRating: 5,
        feedbackText: 'Comprehensive practical examples and helpful TA lab sessions.',
      })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.overallRating).toBe(5);
  });

  it('5. POST /api/v1/assistant/ask - should answer exam query with strict source citations', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/assistant/ask')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: 'Where is my exam seating hall?',
      })
      .expect(201);

    expect(res.body).toHaveProperty('message');
    expect(res.body.message.senderRole).toBe('ASSISTANT');
    expect(res.body.message.content).toContain('Source:');
    expect(Array.isArray(res.body.message.citations)).toBe(true);
    expect(res.body.message.citations.length).toBeGreaterThanOrEqual(1);
  });

  it('6. POST /api/v1/assistant/ask - should answer tuition fee query with accurate ledger citation', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/assistant/ask')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        query: 'How much tuition do I owe for my second installment?',
      })
      .expect(201);

    expect(res.body.message.content).toContain('Source:');
    expect(res.body.message.content).toContain('Invoice');
  });

  it('7. GET /api/v1/assistant/study-plan - should return scheduled study blocks', async () => {
    const res = await request(app.getHttpServer())
      .get(`/api/v1/assistant/study-plan?studentId=${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('allocatedHours');
  });

  it('8. PATCH /api/v1/assistant/study-plan/:id/complete - should mark block as completed', async () => {
    if (!studyBlockId) return;

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/assistant/study-plan/${studyBlockId}/complete`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.id).toBe(studyBlockId);
    expect(res.body.isCompleted).toBe(true);
  });
});
