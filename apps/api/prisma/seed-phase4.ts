import { PrismaClient } from '@prisma/client';

export async function seedPhase4AttendanceGrades(prisma: PrismaClient) {
  console.log('--- Seeding Phase 4: Attendance, Coursework, Grades, & Exams ---');

  const institution = await prisma.institution.findFirst({
    where: { domain: 'university.edu' },
  });
  if (!institution) throw new Error('Institution university.edu not found');

  const campus = await prisma.campus.findFirst({
    where: { institutionId: institution.id, code: 'MAIN' },
  });
  if (!campus) throw new Error('Campus MAIN not found');

  const semester = await prisma.semester.findFirst({
    where: { campusId: campus.id, code: 'FALL2026' },
  });
  if (!semester) throw new Error('Semester FALL2026 not found');

  const tariq = await prisma.facultyMember.findFirst({
    where: { user: { email: 'tariq.mahmud@university.edu' } },
  });
  if (!tariq) throw new Error('Faculty Tariq Mahmud not found');

  const anisur = await prisma.facultyMember.findFirst({
    where: { user: { email: 'dr.rahman@university.edu' } },
  });

  const rafiq = await prisma.student.findUnique({
    where: { studentNumber: '2024-360-117' },
  });
  if (!rafiq) throw new Error('Student Rafiq Hasan (2024-360-117) not found');

  const room4B = await prisma.room.findFirst({
    where: { campusId: campus.id, roomNumber: 'Room 4B' },
  });

  const hallC = await prisma.room.findFirst({
    where: { campusId: campus.id, roomNumber: 'Hall C' },
  });

  const cse204 = await prisma.course.findFirst({
    where: { code: 'CSE204' },
  });
  if (!cse204) throw new Error('Course CSE204 not found');

  const cse204Offering = await prisma.courseOffering.findFirst({
    where: { courseId: cse204.id, semesterId: semester.id },
  });
  if (!cse204Offering) throw new Error('CourseOffering for CSE204 FALL2026 not found');

  const cse204SecA = await prisma.section.findFirst({
    where: { courseOfferingId: cse204Offering.id, sectionCode: 'Sec A' },
  });
  if (!cse204SecA) throw new Error('Section CSE204 Sec A not found');

  // 1. GradeScale (4.0 US Scale)
  console.log('Seeding GradeScale...');
  let gradeScale = await prisma.gradeScale.findFirst({
    where: { institutionId: institution.id, name: 'Standard 4.0 US Scale' },
  });
  if (!gradeScale) {
    gradeScale = await prisma.gradeScale.create({
      data: {
        institutionId: institution.id,
        name: 'Standard 4.0 US Scale',
        scaleType: 'FOUR_POINT_US',
        isDefault: true,
      },
    });

    const scaleItems = [
      { letter: 'A+', minPercent: 90, maxPercent: 100, gradePoint: 4.0, description: 'Outstanding' },
      { letter: 'A', minPercent: 85, maxPercent: 89.99, gradePoint: 3.75, description: 'Excellent' },
      { letter: 'A-', minPercent: 80, maxPercent: 84.99, gradePoint: 3.5, description: 'Very Good' },
      { letter: 'B+', minPercent: 75, maxPercent: 79.99, gradePoint: 3.25, description: 'Good' },
      { letter: 'B', minPercent: 70, maxPercent: 74.99, gradePoint: 3.0, description: 'Satisfactory' },
      { letter: 'B-', minPercent: 65, maxPercent: 69.99, gradePoint: 2.75, description: 'Above Average' },
      { letter: 'C+', minPercent: 60, maxPercent: 64.99, gradePoint: 2.5, description: 'Average' },
      { letter: 'C', minPercent: 55, maxPercent: 59.99, gradePoint: 2.25, description: 'Pass' },
      { letter: 'D', minPercent: 50, maxPercent: 54.99, gradePoint: 2.0, description: 'Marginal Pass' },
      { letter: 'F', minPercent: 0, maxPercent: 49.99, gradePoint: 0.0, description: 'Fail' },
    ];

    for (const item of scaleItems) {
      await prisma.gradeScaleItem.create({
        data: {
          gradeScaleId: gradeScale.id,
          ...item,
        },
      });
    }
  }

  // 2. Attendance Sessions & Records
  console.log('Seeding Attendance Sessions & Records...');
  const slot = await prisma.timetableSlot.findFirst({
    where: { sectionId: cse204SecA.id },
  });

  // Active Live Session for today
  let activeSession = await prisma.attendanceSession.findFirst({
    where: { sectionId: cse204SecA.id, status: 'OPEN' },
  });
  if (!activeSession) {
    activeSession = await prisma.attendanceSession.create({
      data: {
        sectionId: cse204SecA.id,
        facultyId: tariq.id,
        slotId: slot?.id,
        token: 'smartedu_qr_session_live_849201',
        shortCode: '849201',
        status: 'OPEN',
        geofenceLat: 23.8103,
        geofenceLng: 90.4125,
        geofenceRadiusMeters: 50,
        bleUuid: 'e2c56db5-dffb-48d2-b060-d0f5a71096e0',
        startedAt: new Date(),
      },
    });
  }

  // Check in Rafiq Hasan for active session
  await prisma.attendanceRecord.upsert({
    where: {
      sessionId_studentId: {
        sessionId: activeSession.id,
        studentId: rafiq.id,
      },
    },
    update: {},
    create: {
      sessionId: activeSession.id,
      studentId: rafiq.id,
      status: 'PRESENT',
      verifiedVia: 'QR_ROTATING',
      latitude: 23.81031,
      longitude: 90.41252,
    },
  });

  // Seed 17 historical closed sessions to make 18 total sessions (Rafiq attended 15 of 18 = 83.3%)
  const historicalSessionsCount = await prisma.attendanceSession.count({
    where: { sectionId: cse204SecA.id, status: 'CLOSED' },
  });

  if (historicalSessionsCount < 17) {
    const students = await prisma.student.findMany({
      where: { enrollments: { some: { sectionId: cse204SecA.id } } },
      take: 40,
    });

    const recordsToInsert: Array<{
      sessionId: string;
      studentId: string;
      status: string;
      verifiedVia: string;
    }> = [];

    for (let i = 1; i <= 17; i++) {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - (18 - i) * 2);

      const sess = await prisma.attendanceSession.create({
        data: {
          sectionId: cse204SecA.id,
          facultyId: tariq.id,
          slotId: slot?.id,
          sessionDate: pastDate,
          token: `token_hist_${i}`,
          shortCode: `${100000 + i}`,
          status: 'CLOSED',
          startedAt: pastDate,
          closedAt: new Date(pastDate.getTime() + 90 * 60 * 1000),
        },
      });

      // Rafiq is present in sessions 1..14 (and active session makes 15/18), absent in sessions 15, 16, 17
      const isRafiqPresent = i <= 14;

      for (const st of students) {
        const isPresent = st.id === rafiq.id ? isRafiqPresent : Math.random() > 0.1;
        recordsToInsert.push({
          sessionId: sess.id,
          studentId: st.id,
          status: isPresent ? 'PRESENT' : 'ABSENT',
          verifiedVia: isPresent ? 'QR_ROTATING' : 'MANUAL_OVERRIDE',
        });
      }
    }

    if (recordsToInsert.length > 0) {
      await prisma.attendanceRecord.createMany({
        data: recordsToInsert,
        skipDuplicates: true,
      });
    }
  }

  // 3. Course Materials
  console.log('Seeding Course Materials...');
  const materials = [
    {
      title: 'Week 1: Algorithmic Complexity & Big-O Notation',
      description: 'Lecture slides, asymptotic bounds analysis, and practice problems.',
      fileUrl: 'https://smartedu.cdn/materials/cse204/week1-complexity.pdf',
      fileSizeBytes: BigInt(2450000),
      mimeType: 'application/pdf',
      weekNumber: 1,
    },
    {
      title: 'Week 2: Advanced Linked Lists & Skip Lists',
      description: 'Memory layout, cache locality, and pointer manipulation patterns.',
      fileUrl: 'https://smartedu.cdn/materials/cse204/week2-linked-lists.pdf',
      fileSizeBytes: BigInt(3120000),
      mimeType: 'application/pdf',
      weekNumber: 2,
    },
    {
      title: 'Week 3: Binary Search Trees & AVL Trees',
      description: 'Tree rotations, self-balancing mechanics, and search optimality.',
      fileUrl: 'https://smartedu.cdn/materials/cse204/week3-trees.pdf',
      fileSizeBytes: BigInt(4500000),
      mimeType: 'application/pdf',
      weekNumber: 3,
    },
    {
      title: 'Week 4: Heaps & Priority Queues',
      description: 'Binary heaps, heapify algorithm, and priority scheduling.',
      fileUrl: 'https://smartedu.cdn/materials/cse204/week4-heaps.pdf',
      fileSizeBytes: BigInt(1890000),
      mimeType: 'application/pdf',
      weekNumber: 4,
    },
  ];

  for (const m of materials) {
    const existing = await prisma.courseMaterial.findFirst({
      where: { courseId: cse204.id, title: m.title },
    });
    if (!existing) {
      await prisma.courseMaterial.create({
        data: {
          courseId: cse204.id,
          sectionId: cse204SecA.id,
          ...m,
        },
      });
    }
  }

  // 4. Assignments & Submissions
  console.log('Seeding Assignments & Submissions...');
  let assignment1 = await prisma.assignment.findFirst({
    where: { sectionId: cse204SecA.id, title: 'Lab 3: Binary Search Tree Implementation' },
  });
  if (!assignment1) {
    assignment1 = await prisma.assignment.create({
      data: {
        sectionId: cse204SecA.id,
        title: 'Lab 3: Binary Search Tree Implementation',
        description:
          'Implement an AVL tree with automatic balancing on insert and delete. Benchmark against std::map.',
        dueAt: new Date(Date.now() + 6 * 86400000), // Due in 6 days
        maxPoints: 100,
        weightagePct: 10,
        latePolicy: 'DEDUCT_PERCENT_PER_DAY',
        lateDeductionPerDay: 5,
        isPublished: true,
      },
    });
  }

  // Rafiq's submission
  await prisma.submission.upsert({
    where: {
      assignmentId_studentId: {
        assignmentId: assignment1.id,
        studentId: rafiq.id,
      },
    },
    update: {},
    create: {
      assignmentId: assignment1.id,
      studentId: rafiq.id,
      fileUrl: 'https://smartedu.cdn/submissions/rafiq-lab3-avl.zip',
      content: 'Implemented AVL tree with recursive balance factor recalculation and rotation suite.',
      submittedAt: new Date(Date.now() - 86400000),
      isLate: false,
      score: 95,
      feedback: 'Excellent tree rotation implementation and thorough edge-case unit tests.',
      gradedById: tariq.id,
      gradedAt: new Date(),
    },
  });

  // 5. Assessments & Student Assessment Scores
  console.log('Seeding Assessments & Scores...');
  const assessmentsSpec = [
    { name: 'Class Attendance & Participation', type: 'ATTENDANCE', maxScore: 100, weightagePct: 10 },
    { name: 'Surprise Quizzes (Best 3 of 4)', type: 'QUIZ', maxScore: 100, weightagePct: 15 },
    { name: 'Midterm Examination', type: 'EXAM', maxScore: 100, weightagePct: 25 },
    { name: 'Laboratory Assignments', type: 'ASSIGNMENT', maxScore: 100, weightagePct: 20 },
    { name: 'Final Comprehensive Exam', type: 'EXAM', maxScore: 100, weightagePct: 30 },
  ];

  const rafiqScores: Record<string, number> = {
    'Class Attendance & Participation': 83.3,
    'Surprise Quizzes (Best 3 of 4)': 88.0,
    'Midterm Examination': 58.0, // Risk review calls this out: 58%
    'Laboratory Assignments': 95.0,
    'Final Comprehensive Exam': 78.0,
  };

  for (const aSpec of assessmentsSpec) {
    let assess = await prisma.assessment.findFirst({
      where: { sectionId: cse204SecA.id, name: aSpec.name },
    });
    if (!assess) {
      assess = await prisma.assessment.create({
        data: {
          sectionId: cse204SecA.id,
          ...aSpec,
        },
      });
    }

    const scoreVal = rafiqScores[aSpec.name] ?? 80.0;
    await prisma.studentAssessmentScore.upsert({
      where: {
        assessmentId_studentId: {
          assessmentId: assess.id,
          studentId: rafiq.id,
        },
      },
      update: { score: scoreVal },
      create: {
        assessmentId: assess.id,
        studentId: rafiq.id,
        score: scoreVal,
        isAbsent: false,
        remarks: aSpec.name.includes('Midterm') ? 'Needs improvement in dynamic programming' : null,
        enteredById: tariq.id,
      },
    });
  }

  // 6. Grade Moderation
  console.log('Seeding Grade Moderation...');
  await prisma.gradeModeration.upsert({
    where: {
      sectionId_semesterId: {
        sectionId: cse204SecA.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      sectionId: cse204SecA.id,
      semesterId: semester.id,
      status: 'SUBMITTED_TO_HEAD',
      submittedById: tariq.userId,
      comments: 'All assessments entered and normalized according to department standard bell curve.',
    },
  });

  // 7. Semester Result for Rafiq Hasan
  console.log('Seeding Semester Result...');
  await prisma.semesterResult.upsert({
    where: {
      studentId_semesterId: {
        studentId: rafiq.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      studentId: rafiq.id,
      semesterId: semester.id,
      termGpa: 3.21,
      cgpa: 3.21,
      totalCreditsEarned: 54,
      termCredits: 14,
      status: 'PROVISIONAL',
    },
  });

  // 8. Exams & Exam Seats
  console.log('Seeding Exams & Exam Seats...');
  const examDate = new Date('2026-11-24T10:00:00.000Z');
  let exam = await prisma.exam.findFirst({
    where: { courseId: cse204.id, semesterId: semester.id, name: 'Data Structures & Algorithms Midterm Exam' },
  });

  if (!exam) {
    exam = await prisma.exam.create({
      data: {
        courseId: cse204.id,
        semesterId: semester.id,
        name: 'Data Structures & Algorithms Midterm Exam',
        examDate,
        startTime: '10:00',
        endTime: '12:00',
        durationMinutes: 120,
        roomId: hallC?.id || room4B?.id,
        totalSeats: 60,
        status: 'SCHEDULED',
      },
    });
  }

  // Exam seat for Rafiq Hasan (Matching Ask Smart EDU mockup: Hall C, seat 42)
  await prisma.examSeat.upsert({
    where: {
      examId_studentId: {
        examId: exam.id,
        studentId: rafiq.id,
      },
    },
    update: {},
    create: {
      examId: exam.id,
      studentId: rafiq.id,
      seatNumber: 'Seat 42',
      admitCardQrToken: 'smartedu_admit_rafiq_2024360117_fall2026',
      isAdmitted: true,
    },
  });

  console.log('--- Phase 4 Seed Complete! ---');
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await seedPhase4AttendanceGrades(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Phase 4 seed failed:', err);
    process.exit(1);
  });
}
