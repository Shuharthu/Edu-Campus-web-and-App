import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WsAdapter } from '@nestjs/platform-ws';
import { authenticator } from 'otplib';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { loadRootEnv } from '../src/config/load-env';
import { DEV_TOTP_SECRETS } from '../prisma/seed';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Phase 7 Library, Campus Operations & Career E2E against Supabase PostgreSQL', () => {
  jest.setTimeout(45000);
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let studentId: string;
  let bookId: string;
  let createdLoanId: string;
  let ticketId: string;
  let applicationId: string;

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

    const book = await prisma.book.findFirst({
      where: { availableCopies: { gt: 1 } },
    });
    if (!book) throw new Error('Available book not found');
    bookId = book.id;

    const ticket = await prisma.maintenanceTicket.findFirst();
    if (ticket) ticketId = ticket.id;

    const appRecord = await prisma.jobApplication.findFirst();
    if (appRecord) applicationId = appRecord.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. GET /api/v1/library/catalog - should retrieve library catalog items', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/library/catalog')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('availableCopies');
  });

  it('2. GET /api/v1/library/stats - should return circulation and catalog telemetry', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/library/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('totalTitles');
    expect(res.body).toHaveProperty('activeLoans');
    expect(res.body).toHaveProperty('digitalTitles');
    expect(res.body.totalTitles).toBeGreaterThanOrEqual(5);
  });

  it('3. POST /api/v1/library/issue - should issue book copy and decrement availability', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/library/issue')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        bookId,
        studentId,
        loanDurationDays: 14,
      })
      .expect(201);

    expect(res.body).toHaveProperty('loan');
    expect(res.body.loan.bookId).toBe(bookId);
    expect(res.body.loan.studentId).toBe(studentId);
    expect(res.body.loan.status).toBe('ACTIVE');
    createdLoanId = res.body.loan.id;
  });

  it('4. POST /api/v1/library/return - should mark loan as returned and restore inventory', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/library/return')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        loanId: createdLoanId,
      })
      .expect(201);

    expect(res.body.id).toBe(createdLoanId);
    expect(res.body.status).toBe('RETURNED');
  });

  it('5. GET /api/v1/operations/stats - should return campus facility and transit metrics', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/operations/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('hostelCapacity');
    expect(res.body).toHaveProperty('hostelOccupancyRate');
    expect(res.body).toHaveProperty('activeRoutes');
    expect(res.body).toHaveProperty('openTickets');
  });

  it('6. GET /api/v1/operations/transport/routes - should return transit routes and fleet status', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/operations/transport/routes')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('routeName');
    expect(res.body[0]).toHaveProperty('vehicleNumber');
  });

  it('7. POST & PATCH /api/v1/operations/maintenance/tickets - should create and resolve ticket', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/api/v1/operations/maintenance/tickets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        location: 'Software Engineering Lab 2',
        category: 'ELECTRICAL',
        description: 'Fluorescent fixture flicker near Workstation 12',
        priority: 'LOW',
      })
      .expect(201);

    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body.status).toBe('OPEN');

    const updateRes = await request(app.getHttpServer())
      .patch(`/api/v1/operations/maintenance/tickets/${createRes.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'RESOLVED',
        assignedTo: 'Electrician M. Haque',
      })
      .expect(200);

    expect(updateRes.body.status).toBe('RESOLVED');
    expect(updateRes.body.assignedTo).toBe('Electrician M. Haque');
  });

  it('8. GET /api/v1/career/postings & stats - should return placement board listings and telemetry', async () => {
    const statsRes = await request(app.getHttpServer())
      .get('/api/v1/career/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(statsRes.body).toHaveProperty('activePartners');
    expect(statsRes.body).toHaveProperty('openPositions');
    expect(statsRes.body.openPositions).toBeGreaterThanOrEqual(2);

    const listRes = await request(app.getHttpServer())
      .get('/api/v1/career/postings')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body[0]).toHaveProperty('companyName');
    expect(listRes.body[0]).toHaveProperty('roleTitle');
  });
});
