import { PrismaClient } from '@prisma/client';
import { loadRootEnv } from '../src/config/load-env';

loadRootEnv();
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Phase 8: Analytics, Surveys, Study Planner & Smart Assistant against Supabase PostgreSQL...');

  const institution = await prisma.institution.findFirst();
  if (!institution) throw new Error('Institution not found');

  const adminUser = await prisma.user.findFirst({
    where: { email: 'tariq.mahmud@university.edu' },
  });
  if (!adminUser) throw new Error('Admin user not found');

  const rafiqStudent = await prisma.student.findFirst({
    where: {
      OR: [
        { studentNumber: '2024-CSE-0042' },
        { user: { fullName: { contains: 'Rafiq' } } },
      ],
    },
    include: { user: true },
  });
  if (!rafiqStudent) throw new Error('Student Rafiq not found');

  const courseOffering = await prisma.courseOffering.findFirst({
    where: { course: { code: 'CSE204' } },
    include: { course: true },
  });

  const cse204Course = await prisma.course.findFirst({
    where: { code: 'CSE204' },
  });

  const mat201Course = await prisma.course.findFirst({
    where: { code: 'MAT201' },
  });

  // 1. Course Evaluation Surveys
  console.log('Upserting Surveys...');
  const survey1 = await prisma.survey.upsert({
    where: { id: '00000000-0000-0000-0008-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0008-000000000001',
      institutionId: institution.id,
      courseOfferingId: courseOffering?.id,
      title: 'Fall 2026 Course & Faculty Evaluation: CSE204 Data Structures & Algorithms',
      description: 'End-of-term academic feedback on pedagogical clarity, syllabus pacing, assignment fairness, and lab engagement.',
      surveyType: 'COURSE_EVALUATION',
      status: 'ACTIVE',
      startsAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  const survey2 = await prisma.survey.upsert({
    where: { id: '00000000-0000-0000-0008-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0008-000000000002',
      institutionId: institution.id,
      title: 'Fall 2026 Campus Life, Facilities & Dining Quality Survey',
      description: 'University-wide student satisfaction survey covering library hours, transit shuttles, cafeteria nutrition, and high-speed Wi-Fi.',
      surveyType: 'CAMPUS_SATISFACTION',
      status: 'ACTIVE',
      startsAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
  });

  // 2. Survey Responses
  console.log('Upserting Survey Responses...');
  await prisma.surveyResponse.upsert({
    where: { id: '00000000-0000-0000-0008-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0008-000000000011',
      surveyId: survey1.id,
      studentId: rafiqStudent.id,
      clarityRating: 5,
      engagementRating: 5,
      fairnessRating: 4,
      overallRating: 5,
      feedbackText: 'Dr. Tariq Mahmud explains complex graph algorithms and dynamic programming with remarkable clarity. Problem sets are rigorous and well-paced.',
    },
  });

  // 3. Study Plan Blocks
  console.log('Upserting Study Plan Blocks...');
  await prisma.studyPlanBlock.upsert({
    where: { id: '00000000-0000-0000-0008-000000000021' },
    update: {},
    create: {
      id: '00000000-0000-0000-0008-000000000021',
      studentId: rafiqStudent.id,
      courseId: cse204Course?.id,
      title: 'CSE204: Binary Search Trees & Red-Black Trees',
      targetTopic: 'Tree Balance & AVL Rotations',
      allocatedHours: 2.0,
      targetDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  await prisma.studyPlanBlock.upsert({
    where: { id: '00000000-0000-0000-0008-000000000022' },
    update: {},
    create: {
      id: '00000000-0000-0000-0008-000000000022',
      studentId: rafiqStudent.id,
      courseId: mat201Course?.id,
      title: 'MAT201: Eigenvalues & Vector Spaces Problem Set',
      targetTopic: 'Characteristic Polynomials & Diagonalization',
      allocatedHours: 1.5,
      targetDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      isCompleted: false,
    },
  });

  await prisma.studyPlanBlock.upsert({
    where: { id: '00000000-0000-0000-0008-000000000023' },
    update: {},
    create: {
      id: '00000000-0000-0000-0008-000000000023',
      studentId: rafiqStudent.id,
      courseId: cse204Course?.id,
      title: 'CSE204: Dynamic Programming & Knapsack Problem',
      targetTopic: 'Memoization vs Tabulation Time Complexities',
      allocatedHours: 2.0,
      targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isCompleted: false,
    },
  });

  // 4. Grounded Smart Assistant Conversation
  console.log('Upserting Grounded Smart Assistant Conversation...');
  const conv = await prisma.assistantConversation.upsert({
    where: { id: '00000000-0000-0000-0008-000000000031' },
    update: {},
    create: {
      id: '00000000-0000-0000-0008-000000000031',
      userId: rafiqStudent.userId,
      title: 'Midterm Seating & Tuition Installment Query',
    },
  });

  await prisma.assistantMessage.upsert({
    where: { id: '00000000-0000-0000-0008-000000000041' },
    update: {},
    create: {
      id: '00000000-0000-0000-0008-000000000041',
      conversationId: conv.id,
      senderRole: 'USER',
      content: 'Where is my Fall 2026 Midterm exam hall and what seat am I assigned to?',
      citations: [],
    },
  });

  await prisma.assistantMessage.upsert({
    where: { id: '00000000-0000-0000-0008-000000000042' },
    update: {},
    create: {
      id: '00000000-0000-0000-0008-000000000042',
      conversationId: conv.id,
      senderRole: 'ASSISTANT',
      content:
        'According to the officially published Fall 2026 Midterm Examination Seating Matrix, you are assigned to **Auditorium Hall C, Seat 42** for course **CSE204 (Data Structures & Algorithms)**.\n\nPlease generate your digital admit card with anti-fraud QR code from the Smart EDU app prior to 08:30 AM on exam day.\n\nSource: Office of the Controller of Examinations, Midterm Seating Matrix 2026, Section CSE-Hall-C.',
      citations: [
        {
          source: 'Midterm Seating Matrix 2026',
          section: 'Auditorium Hall C, Seat 42',
          verifiedAt: new Date().toISOString(),
        },
      ],
    },
  });

  console.log('✅ Phase 8 seed finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding Phase 8:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
