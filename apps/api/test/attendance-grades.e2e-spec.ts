import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WsAdapter } from '@nestjs/platform-ws';
import { authenticator } from 'otplib';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { loadRootEnv } from '../src/config/load-env';
import { DEV_TOTP_SECRETS } from '../prisma/seed';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Phase 4 Attendance & Grades E2E against Supabase PostgreSQL', () => {
  jest.setTimeout(45000);
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let sectionId: string;
  let courseId: string;
  let studentId: string;
  let examId: string;

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

    // Find seed entities: Section CSE204-A, Course CSE204, Student Rafiq Hasan, Exam
    const section = await prisma.section.findFirst({
      where: { sectionCode: 'CSE204-A' },
      include: { courseOffering: true },
    });
    if (section) {
      sectionId = section.id;
      courseId = section.courseOffering.courseId;
    }

    const student = await prisma.student.findFirst({
      where: { studentNumber: '2024-CSE-0042' },
    });
    if (student) {
      studentId = student.id;
    }

    const exam = await prisma.exam.findFirst({
      where: { courseId },
    });
    if (exam) {
      examId = exam.id;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/attendance/defaulters returns defaulters below 75% threshold', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/attendance/defaulters?threshold=75')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.threshold).toBe(75);
    expect(res.body.totalDefaulters).toBeDefined();
    expect(Array.isArray(res.body.defaulters)).toBe(true);
  });

  it('GET /api/v1/grades/sheet returns complete grade sheet with distribution and stats', async () => {
    if (!sectionId) return;

    const res = await request(app.getHttpServer())
      .get(`/api/v1/grades/sheet?sectionId=${sectionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.section).toBeDefined();
    expect(res.body.section.sectionCode).toBe('CSE204-A');
    expect(res.body.assessments).toBeDefined();
    expect(res.body.assessments.length).toBeGreaterThanOrEqual(1);
    expect(res.body.students).toBeDefined();
    expect(res.body.stats).toBeDefined();
    expect(res.body.stats.distribution).toBeDefined();
  });

  it('GET /api/v1/grades/student-results returns student scorecard, CGPA, and exam eligibility', async () => {
    if (!studentId) return;

    const res = await request(app.getHttpServer())
      .get(`/api/v1/grades/student-results?studentId=${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.student).toBeDefined();
    expect(res.body.student.studentNumber).toBe('2024-CSE-0042');
    expect(res.body.currentCgpa).toBeDefined();
    expect(res.body.enrolledCourses).toBeDefined();
  });

  it('GET /api/v1/coursework/materials returns lecture materials for course', async () => {
    if (!courseId) return;

    const res = await request(app.getHttpServer())
      .get(`/api/v1/coursework/materials?courseId=${courseId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].title).toBeDefined();
  });

  it('GET /api/v1/coursework/assignments returns assignments for section', async () => {
    if (!sectionId) return;

    const res = await request(app.getHttpServer())
      .get(`/api/v1/coursework/assignments?sectionId=${sectionId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0].maxPoints).toBeDefined();
  });

  it('GET /api/v1/exams returns scheduled exams', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/exams')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/v1/exams/admit-card returns student admit card with seat number and QR token', async () => {
    if (!studentId || !examId) return;

    const res = await request(app.getHttpServer())
      .get(`/api/v1/exams/admit-card?studentId=${studentId}&examId=${examId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.admitCard).toBeDefined();
    expect(res.body.admitCard.studentNumber).toBe('2024-CSE-0042');
    expect(res.body.admitCard.seatNumber).toBe('Seat 42');
    expect(res.body.admitCard.qrToken).toBeDefined();
    expect(res.body.admitCard.rules.length).toBeGreaterThanOrEqual(3);
  });
});
