import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { WsAdapter } from '@nestjs/platform-ws';
import { authenticator } from 'otplib';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { loadRootEnv } from '../src/config/load-env';
import { DEV_TOTP_SECRETS } from '../prisma/seed';

describe('Phase 3 Academic Core E2E against Supabase PostgreSQL', () => {
  jest.setTimeout(45000);
  let app: INestApplication;
  let adminToken: string;
  let campusId: string;

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

    // Authenticate as Admin (tariq.mahmud@university.edu)
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

    const meRes = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    campusId = meRes.body.activeAssignment?.campusId || meRes.body.assignments[0]?.campusId;
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/academics/catalog returns faculties, departments, 12 programs, and rooms', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/academics/catalog')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.faculties).toBeDefined();
    expect(res.body.faculties.length).toBeGreaterThanOrEqual(3);
    expect(res.body.departments.length).toBeGreaterThanOrEqual(4);
    expect(res.body.programs.length).toBeGreaterThanOrEqual(12);
    expect(res.body.rooms.length).toBeGreaterThanOrEqual(8);

    // Verify rooms include Room 4B and Room 5C
    const roomNumbers = res.body.rooms.map((r: any) => r.roomNumber);
    expect(roomNumbers).toContain('Room 4B');
    expect(roomNumbers).toContain('Room 5C');
  });

  it('GET /api/v1/academics/timetable returns slots for active semester', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/academics/timetable')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(10);

    const cse204Slot = res.body.find(
      (s: any) => s.section.courseOffering.course.code === 'CSE204',
    );
    expect(cse204Slot).toBeDefined();
    expect(cse204Slot.room.roomNumber).toBe('Room 4B');
  });

  it('GET /api/v1/academics/timetable/clashes executes clash detector engine', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/academics/timetable/clashes')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body).toHaveProperty('hasClashes');
    expect(res.body).toHaveProperty('clashes');
    expect(Array.isArray(res.body.clashes)).toBe(true);
  });

  it('GET /api/v1/students returns 600 students with status counts', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/students?limit=10')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.total).toBeGreaterThanOrEqual(600);
    expect(res.body.counts).toBeDefined();
    expect(res.body.counts.all).toBeGreaterThanOrEqual(600);
    expect(res.body.counts.atRisk).toBeGreaterThan(0);
    expect(res.body.counts.feeDue).toBeGreaterThan(0);
    expect(res.body.counts.onProbation).toBeGreaterThan(0);
    expect(res.body.data.length).toBe(10);
  });

  it('GET /api/v1/students/:id returns 4-tab profile drawer data for Rafiq Hasan', async () => {
    // Search for Rafiq Hasan by student ID
    const listRes = await request(app.getHttpServer())
      .get('/api/v1/students?search=2024-360-117')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const rafiq = listRes.body.data.find((s: any) => s.studentNumber === '2024-360-117');
    expect(rafiq).toBeDefined();

    const profileRes = await request(app.getHttpServer())
      .get(`/api/v1/students/${rafiq.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(profileRes.body.studentNumber).toBe('2024-360-117');
    expect(profileRes.body.fullName).toBe('Rafiq Hasan');
    expect(profileRes.body.metrics.cgpa).toBe(3.21);
    expect(profileRes.body.metrics.overallAttendance).toBeCloseTo(88.1, 0);
    expect(profileRes.body.metrics.creditsCompleted).toBe(54);
    expect(profileRes.body.metrics.outstandingFee).toBe(420.0);
    expect(profileRes.body.profile.riskNotes).toContain('Risk Review');
    expect(profileRes.body.guardian).toBeDefined();
    expect(profileRes.body.guardian.fullName).toBe('Kamal Hasan');
    expect(profileRes.body.enrolledCourses.length).toBeGreaterThanOrEqual(4);
  });

  it('GET /api/v1/faculty returns faculty members with active teaching sections', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/faculty')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(40);

    const drRahman = res.body.find((f: any) => f.email === 'dr.rahman@university.edu');
    expect(drRahman).toBeDefined();
    expect(drRahman.departmentCode).toBe('CSE');
  });
});
