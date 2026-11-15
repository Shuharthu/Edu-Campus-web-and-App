import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WsAdapter } from '@nestjs/platform-ws';
import { authenticator } from 'otplib';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { loadRootEnv } from '../src/config/load-env';
import { DEV_TOTP_SECRETS } from '../prisma/seed';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Phase 5 Finance & University Services E2E against Supabase PostgreSQL', () => {
  jest.setTimeout(45000);
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let studentId: string;
  let installmentId: string;
  let serviceRequestId: string;

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

    // Locate seeded student Rafiq Hasan (2024-CSE-0042)
    const student = await prisma.student.findFirst({
      where: { studentNumber: '2024-CSE-0042' },
      include: {
        invoices: {
          include: { installments: true },
        },
        serviceRequests: true,
      },
    });

    if (student) {
      studentId = student.id;
      const firstInvoice = student.invoices[0];
      if (firstInvoice && firstInvoice.installments.length > 1) {
        const inst = firstInvoice.installments[1];
        if (inst) installmentId = inst.id;
      }
      const firstReq = student.serviceRequests[0];
      if (firstReq) {
        serviceRequestId = firstReq.id;
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/finance/fee-structures returns institutional fee schedules', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/finance/fee-structures')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].tuitionPerCredit).toBeDefined();
    expect(res.body[0].program).toBeDefined();
  });

  it('GET /api/v1/finance/scholarships returns active scholarship waiver schemes', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/finance/scholarships')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    const merit = res.body.find((s: { code: string }) => s.code === 'DEAN-MERIT');
    expect(merit).toBeDefined();
    expect(Number(merit.discountPct)).toBe(25);
  });

  it('GET /api/v1/finance/invoices returns institutional invoice ledgers with aging metrics', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/finance/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.metrics).toBeDefined();
    expect(res.body.metrics.totalBilled).toBeGreaterThanOrEqual(1000);
    expect(res.body.metrics.totalCollected).toBeGreaterThanOrEqual(1000);
    expect(Array.isArray(res.body.invoices)).toBe(true);
    expect(res.body.invoices.length).toBeGreaterThanOrEqual(1);

    const invoice = res.body.invoices.find((inv: { invoiceNumber: string }) => inv.invoiceNumber === 'INV-2026-0042');
    expect(invoice).toBeDefined();
    expect(invoice.installments.length).toBe(3);
  });

  it('GET /api/v1/finance/student-billing returns complete tuition summary and breakdown', async () => {
    if (!studentId) return;

    const res = await request(app.getHttpServer())
      .get(`/api/v1/finance/student-billing?studentId=${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.student).toBeDefined();
    expect(res.body.student.studentNumber).toBe('2024-CSE-0042');
    expect(res.body.scholarships).toBeDefined();
    expect(res.body.scholarships.length).toBeGreaterThanOrEqual(1);
    expect(res.body.invoices).toBeDefined();
    expect(res.body.summary).toBeDefined();
    expect(res.body.summary.totalBilled).toBeGreaterThan(0);
    expect(res.body.summary.totalPaid).toBeGreaterThan(0);
  });

  it('POST /api/v1/finance/payments/intent handles payment intent', async () => {
    if (!installmentId) return;

    const res = await request(app.getHttpServer())
      .post('/api/v1/finance/payments/intent')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        installmentId,
        amount: 1023.33,
        paymentMethod: 'STRIPE_CARD',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.paymentIntentId).toBeDefined();
    expect(res.body.status).toBe('COMPLETED');
  });

  it('GET /api/v1/services/digital-id generates valid rolling token and ID credentials', async () => {
    if (!studentId) return;

    const res = await request(app.getHttpServer())
      .get(`/api/v1/services/digital-id?studentId=${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.credentialNumber).toBe('smartedu_id_2024_cse_0042');
    expect(res.body.studentName).toContain('Rafiq');
    expect(res.body.bloodGroup).toBe('A+');
    expect(res.body.activeStatus).toBe('ACTIVE');
    expect(res.body.dynamicQrToken).toBeDefined();
    expect(res.body.dynamicQrToken.startsWith('SMARTEDU-PASS-')).toBe(true);
    expect(res.body.refreshIntervalSeconds).toBe(30);

    // Verify the rotating dynamic QR token
    const verifyRes = await request(app.getHttpServer())
      .post('/api/v1/services/digital-id/verify')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        dynamicToken: res.body.dynamicQrToken,
        checkpoint: 'MAIN_CAMPUS_TURNSTILE_01',
      })
      .expect(201);

    expect(verifyRes.body.valid).toBe(true);
    expect(verifyRes.body.studentNumber).toBe('2024-CSE-0042');
  });

  it('GET /api/v1/services/requests returns official service requests desk', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/services/requests')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);

    const requestItem = res.body.find((r: { requestNumber: string }) => r.requestNumber === 'SR-2026-8492');
    expect(requestItem).toBeDefined();
    expect(requestItem.requestType).toBe('TRANSCRIPT');
  });

  it('PATCH /api/v1/services/requests/:id/status updates status to COMPLETED with official seal', async () => {
    if (!serviceRequestId) return;

    const res = await request(app.getHttpServer())
      .patch(`/api/v1/services/requests/${serviceRequestId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'COMPLETED',
        adminRemarks: 'Digitally verified and registrar seal applied. Ready for dispatch.',
      })
      .expect(200);

    expect(res.body.status).toBe('COMPLETED');
    expect(res.body.adminRemarks).toContain('registrar seal applied');
  });
});
