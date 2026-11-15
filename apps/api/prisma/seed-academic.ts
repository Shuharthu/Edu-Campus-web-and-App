import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/common/crypto.util';

export async function seedAcademicCore(prisma: PrismaClient) {
  console.log('--- Seeding Phase 3: Academic Core ---');

  const institution = await prisma.institution.findFirst({
    where: { domain: 'university.edu' },
  });
  if (!institution) {
    throw new Error('Institution university.edu not found. Run foundation seed first.');
  }

  const campus = await prisma.campus.findFirst({
    where: { institutionId: institution.id, code: 'MAIN' },
  });
  if (!campus) {
    throw new Error('Main campus not found.');
  }

  const devPassword = await hashPassword('SmartEdu#2026');

  // Find existing users
  const drRahman = await prisma.user.findUnique({
    where: { email: 'dr.rahman@university.edu' },
  });
  const tariqMahmud = await prisma.user.findUnique({
    where: { email: 'tariq.mahmud@university.edu' },
  });
  const rafiqHasanUser = await prisma.user.findUnique({
    where: { email: 'rafiq.hasan@university.edu' },
  });
  const kamalHasanUser = await prisma.user.findUnique({
    where: { email: 'kamal.hasan@university.edu' },
  });

  const facultyRole = await prisma.role.findFirst({ where: { slug: 'faculty' } });
  const studentRole = await prisma.role.findFirst({ where: { slug: 'student' } });

  // 1. Faculties (Academic Schools)
  console.log('Seeding Faculties...');
  const facultiesData = [
    { code: 'FEPS', name: 'School of Engineering & Physical Sciences', deanUserId: drRahman?.id },
    { code: 'SBE', name: 'School of Business & Economics', deanUserId: null },
    { code: 'SHSS', name: 'School of Humanities & Social Sciences', deanUserId: null },
  ];
  for (const f of facultiesData) {
    await prisma.faculty.upsert({
      where: { campusId_code: { campusId: campus.id, code: f.code } },
      update: { name: f.name, deanUserId: f.deanUserId },
      create: {
        institutionId: institution.id,
        campusId: campus.id,
        code: f.code,
        name: f.name,
        deanUserId: f.deanUserId,
      },
    });
  }
  const feps = await prisma.faculty.findUnique({ where: { campusId_code: { campusId: campus.id, code: 'FEPS' } } });
  const sbe = await prisma.faculty.findUnique({ where: { campusId_code: { campusId: campus.id, code: 'SBE' } } });
  const shss = await prisma.faculty.findUnique({ where: { campusId_code: { campusId: campus.id, code: 'SHSS' } } });

  // 2. Departments
  console.log('Seeding Departments...');
  const departmentsData = [
    { code: 'CSE', name: 'Computer Science & Engineering', facultyId: feps!.id, headUserId: drRahman?.id },
    { code: 'EEE', name: 'Electrical & Electronic Engineering', facultyId: feps!.id, headUserId: null },
    { code: 'BBA', name: 'Business Administration', facultyId: sbe!.id, headUserId: null },
    { code: 'LAW', name: 'Department of Law', facultyId: shss!.id, headUserId: null },
  ];
  for (const d of departmentsData) {
    await prisma.department.upsert({
      where: { campusId_code: { campusId: campus.id, code: d.code } },
      update: { name: d.name, facultyId: d.facultyId, headUserId: d.headUserId },
      create: {
        institutionId: institution.id,
        campusId: campus.id,
        facultyId: d.facultyId,
        code: d.code,
        name: d.name,
        headUserId: d.headUserId,
      },
    });
  }
  const cseDept = await prisma.department.findUnique({ where: { campusId_code: { campusId: campus.id, code: 'CSE' } } });
  const eeeDept = await prisma.department.findUnique({ where: { campusId_code: { campusId: campus.id, code: 'EEE' } } });
  const bbaDept = await prisma.department.findUnique({ where: { campusId_code: { campusId: campus.id, code: 'BBA' } } });
  const lawDept = await prisma.department.findUnique({ where: { campusId_code: { campusId: campus.id, code: 'LAW' } } });

  // 3. Programs (12 total)
  console.log('Seeding 12 Programs...');
  const programsData = [
    { code: 'CSE-BSC', name: 'B.Sc. in Computer Science & Engineering', departmentId: cseDept!.id, credits: 136, sem: 8 },
    { code: 'CSE-MSC', name: 'M.Sc. in Computer Science & Engineering', departmentId: cseDept!.id, credits: 36, sem: 4 },
    { code: 'CSE-DS', name: 'B.Sc. in Data Science', departmentId: cseDept!.id, credits: 136, sem: 8 },
    { code: 'CSE-CS', name: 'B.Sc. in Cybersecurity', departmentId: cseDept!.id, credits: 136, sem: 8 },
    { code: 'CSE-SE', name: 'B.Sc. in Software Engineering', departmentId: cseDept!.id, credits: 136, sem: 8 },
    { code: 'EEE-BSC', name: 'B.Sc. in Electrical & Electronic Engineering', departmentId: eeeDept!.id, credits: 138, sem: 8 },
    { code: 'EEE-MSC', name: 'M.Sc. in Electrical & Electronic Engineering', departmentId: eeeDept!.id, credits: 36, sem: 4 },
    { code: 'BBA-GEN', name: 'Bachelor of Business Administration', departmentId: bbaDept!.id, credits: 124, sem: 8 },
    { code: 'BBA-MKT', name: 'BBA in Marketing & Digital Commerce', departmentId: bbaDept!.id, credits: 124, sem: 8 },
    { code: 'BBA-MBA', name: 'Executive Master of Business Administration', departmentId: bbaDept!.id, credits: 48, sem: 4 },
    { code: 'LAW-LLB', name: 'Bachelor of Laws (LL.B. Hons)', departmentId: lawDept!.id, credits: 130, sem: 8 },
    { code: 'LAW-LLM', name: 'Master of Laws (LL.M.)', departmentId: lawDept!.id, credits: 36, sem: 2 },
  ];
  for (const p of programsData) {
    await prisma.program.upsert({
      where: { campusId_code: { campusId: campus.id, code: p.code } },
      update: { name: p.name, totalCredits: p.credits, durationSemesters: p.sem },
      create: {
        institutionId: institution.id,
        campusId: campus.id,
        departmentId: p.departmentId,
        code: p.code,
        name: p.name,
        totalCredits: p.credits,
        durationSemesters: p.sem,
      },
    });
  }
  const cseBsc = await prisma.program.findUnique({ where: { campusId_code: { campusId: campus.id, code: 'CSE-BSC' } } });

  // 4. Batches
  console.log('Seeding Batches...');
  const batches = [
    { programId: cseBsc!.id, code: '2023', intakeYear: 2023 },
    { programId: cseBsc!.id, code: '2024', intakeYear: 2024 },
    { programId: cseBsc!.id, code: '2025', intakeYear: 2025 },
    { programId: cseBsc!.id, code: '2026', intakeYear: 2026 },
  ];
  for (const b of batches) {
    await prisma.batch.upsert({
      where: { programId_code: { programId: b.programId, code: b.code } },
      update: { intakeYear: b.intakeYear },
      create: {
        institutionId: institution.id,
        campusId: campus.id,
        programId: b.programId,
        code: b.code,
        intakeYear: b.intakeYear,
      },
    });
  }
  const batch2024 = await prisma.batch.findUnique({ where: { programId_code: { programId: cseBsc!.id, code: '2024' } } });

  // 5. Semesters
  console.log('Seeding Semesters...');
  const semestersData = [
    { code: 'FALL2026', name: 'Fall 2026', startsAt: new Date('2026-09-01'), endsAt: new Date('2026-12-31'), isCurrent: true, registrationOpen: false },
    { code: 'SPRING2026', name: 'Spring 2026', startsAt: new Date('2026-01-15'), endsAt: new Date('2026-05-30'), isCurrent: false, registrationOpen: false },
    { code: 'SUMMER2026', name: 'Summer 2026', startsAt: new Date('2026-06-15'), endsAt: new Date('2026-08-20'), isCurrent: false, registrationOpen: false },
  ];
  for (const s of semestersData) {
    await prisma.semester.upsert({
      where: { campusId_code: { campusId: campus.id, code: s.code } },
      update: { name: s.name, isCurrent: s.isCurrent, registrationOpen: s.registrationOpen },
      create: {
        institutionId: institution.id,
        campusId: campus.id,
        code: s.code,
        name: s.name,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
        isCurrent: s.isCurrent,
        registrationOpen: s.registrationOpen,
      },
    });
  }
  const fall2026 = await prisma.semester.findUnique({ where: { campusId_code: { campusId: campus.id, code: 'FALL2026' } } });

  // 6. Courses
  console.log('Seeding Courses...');
  const coursesData = [
    { departmentId: cseDept!.id, code: 'CSE201', title: 'Discrete Mathematics', credits: 3.0, isLab: false },
    { departmentId: cseDept!.id, code: 'CSE204', title: 'Data Structures & Algorithms', credits: 3.0, isLab: false },
    { departmentId: cseDept!.id, code: 'CSE205', title: 'Data Structures Lab', credits: 1.5, isLab: true },
    { departmentId: cseDept!.id, code: 'CSE311', title: 'Database Systems', credits: 3.0, isLab: false },
    { departmentId: cseDept!.id, code: 'CSE312', title: 'Database Systems Lab', credits: 1.5, isLab: true },
    { departmentId: cseDept!.id, code: 'CSE323', title: 'Operating Systems', credits: 3.0, isLab: false },
    { departmentId: eeeDept!.id, code: 'EEE201', title: 'Circuit Analysis', credits: 3.0, isLab: false },
    { departmentId: cseDept!.id, code: 'MAT201', title: 'Calculus & Linear Algebra 2', credits: 3.0, isLab: false },
    { departmentId: cseDept!.id, code: 'PHY201', title: 'Physics: Mechanics & Waves', credits: 3.0, isLab: false },
    { departmentId: bbaDept!.id, code: 'FIN201', title: 'Corporate Finance', credits: 3.0, isLab: false },
    { departmentId: bbaDept!.id, code: 'MKT101', title: 'Principles of Marketing', credits: 3.0, isLab: false },
    { departmentId: lawDept!.id, code: 'LAW101', title: 'Constitutional Law of Bangladesh', credits: 3.0, isLab: false },
  ];
  for (const c of coursesData) {
    await prisma.course.upsert({
      where: { departmentId_code: { departmentId: c.departmentId, code: c.code } },
      update: { title: c.title, credits: c.credits, isLab: c.isLab },
      create: {
        institutionId: institution.id,
        departmentId: c.departmentId,
        code: c.code,
        title: c.title,
        credits: c.credits,
        isLab: c.isLab,
      },
    });
  }
  const cse204Course = await prisma.course.findUnique({ where: { departmentId_code: { departmentId: cseDept!.id, code: 'CSE204' } } });
  const mat201Course = await prisma.course.findUnique({ where: { departmentId_code: { departmentId: cseDept!.id, code: 'MAT201' } } });
  const eee201Course = await prisma.course.findUnique({ where: { departmentId_code: { departmentId: eeeDept!.id, code: 'EEE201' } } });
  const cse205Course = await prisma.course.findUnique({ where: { departmentId_code: { departmentId: cseDept!.id, code: 'CSE205' } } });
  const fin201Course = await prisma.course.findUnique({ where: { departmentId_code: { departmentId: bbaDept!.id, code: 'FIN201' } } });
  const law101Course = await prisma.course.findUnique({ where: { departmentId_code: { departmentId: lawDept!.id, code: 'LAW101' } } });

  // 7. Rooms
  console.log('Seeding Rooms...');
  const roomsData = [
    { building: 'Building B', roomNumber: 'Room 4B', roomType: 'LECTURE_HALL', capacity: 45 },
    { building: 'Building B', roomNumber: 'Room 5C', roomType: 'LECTURE_HALL', capacity: 50 },
    { building: 'Building A', roomNumber: 'Room 3C', roomType: 'LECTURE_HALL', capacity: 40 },
    { building: 'Engineering Complex', roomNumber: 'Lab 1', roomType: 'LAB', capacity: 35 },
    { building: 'Engineering Complex', roomNumber: 'Lab 2', roomType: 'LAB', capacity: 35 },
    { building: 'Central Auditorium', roomNumber: 'Hall C', roomType: 'AUDITORIUM', capacity: 150 },
    { building: 'Business School', roomNumber: 'Room 2A', roomType: 'LECTURE_HALL', capacity: 45 },
    { building: 'Law Building', roomNumber: 'Moot Court', roomType: 'SEMINAR_ROOM', capacity: 60 },
  ];
  for (const r of roomsData) {
    await prisma.room.upsert({
      where: { campusId_building_roomNumber: { campusId: campus.id, building: r.building, roomNumber: r.roomNumber } },
      update: { roomType: r.roomType, capacity: r.capacity },
      create: {
        institutionId: institution.id,
        campusId: campus.id,
        building: r.building,
        roomNumber: r.roomNumber,
        roomType: r.roomType,
        capacity: r.capacity,
      },
    });
  }
  const room4B = await prisma.room.findUnique({ where: { campusId_building_roomNumber: { campusId: campus.id, building: 'Building B', roomNumber: 'Room 4B' } } });
  const room5C = await prisma.room.findUnique({ where: { campusId_building_roomNumber: { campusId: campus.id, building: 'Building B', roomNumber: 'Room 5C' } } });
  const room3C = await prisma.room.findUnique({ where: { campusId_building_roomNumber: { campusId: campus.id, building: 'Building A', roomNumber: 'Room 3C' } } });
  const lab1 = await prisma.room.findUnique({ where: { campusId_building_roomNumber: { campusId: campus.id, building: 'Engineering Complex', roomNumber: 'Lab 1' } } });
  const lab2 = await prisma.room.findUnique({ where: { campusId_building_roomNumber: { campusId: campus.id, building: 'Engineering Complex', roomNumber: 'Lab 2' } } });
  const room2A = await prisma.room.findUnique({ where: { campusId_building_roomNumber: { campusId: campus.id, building: 'Business School', roomNumber: 'Room 2A' } } });
  const mootCourt = await prisma.room.findUnique({ where: { campusId_building_roomNumber: { campusId: campus.id, building: 'Law Building', roomNumber: 'Moot Court' } } });

  // 8. Faculty Members (40 total)
  console.log('Seeding 40 Faculty Members in batch...');
  const facultyFirstNames = ['Anisur', 'Tariq', 'Sadia', 'Farhana', 'Arif', 'Tanvir', 'Nasrin', 'Mahmud', 'Kamrul', 'Rezaul', 'Zubair', 'Shahriar', 'Tasnim', 'Fahim', 'Nabil', 'Shirin', 'Salma', 'Monir', 'Hasan', 'Imran'];
  const facultyLastNames = ['Rahman', 'Mahmud', 'Haque', 'Islam', 'Chowdhury', 'Hasan', 'Karim', 'Ahmed', 'Siddique', 'Alam', 'Uddin', 'Zaman', 'Bhuiyan', 'Khan', 'Miah', 'Akter', 'Begum', 'Hossain', 'Ali', 'Mostafa'];

  const facultyUsersToCreate: Array<{
    institutionId: string;
    email: string;
    fullName: string;
    passwordHash: string;
    isActive: boolean;
  }> = [];

  for (let i = 1; i <= 40; i++) {
    const fn = facultyFirstNames[(i - 1) % facultyFirstNames.length];
    const ln = facultyLastNames[(i - 1) % facultyLastNames.length];
    const email = i === 1 ? 'dr.rahman@university.edu' : i === 2 ? 'tariq.mahmud@university.edu' : `faculty.${i}@university.edu`;
    const fullName = i === 1 ? 'Dr. Anisur Rahman' : i === 2 ? 'Dr. Tariq Mahmud' : `Dr. ${fn} ${ln}`;
    facultyUsersToCreate.push({
      institutionId: institution.id,
      email,
      fullName,
      passwordHash: devPassword,
      isActive: true,
    });
  }

  // Create or keep existing
  await prisma.user.createMany({
    data: facultyUsersToCreate,
    skipDuplicates: true,
  });

  const allFacultyUsers = await prisma.user.findMany({
    where: {
      email: { in: facultyUsersToCreate.map((u) => u.email) },
    },
  });
  const facultyUserMap = new Map(allFacultyUsers.map((u) => [u.email, u]));

  // Create FacultyMember records
  const facultyMembersToCreate: Array<{
    institutionId: string;
    campusId: string;
    userId: string;
    departmentId: string;
    employeeNumber: string;
    designation: string;
    maxWeeklyHours: number;
    officeRoom: string;
    specialization: string;
  }> = [];

  const depts = [cseDept!.id, eeeDept!.id, bbaDept!.id, lawDept!.id];
  const designations = ['PROFESSOR', 'ASSOCIATE_PROFESSOR', 'ASSISTANT_PROFESSOR', 'LECTURER'];

  allFacultyUsers.forEach((u, idx) => {
    const deptId = idx < 15 ? cseDept!.id : idx < 25 ? eeeDept!.id : idx < 33 ? bbaDept!.id : lawDept!.id;
    const desig = (idx === 0 ? 'PROFESSOR' : idx === 1 ? 'ASSOCIATE_PROFESSOR' : designations[idx % designations.length]) ?? 'LECTURER';
    const office = idx < 15 ? `Room 4B-${idx + 1}` : `Office-${idx + 1}`;
    facultyMembersToCreate.push({
      institutionId: institution.id,
      campusId: campus.id,
      userId: u.id,
      departmentId: deptId,
      employeeNumber: `FAC-${String(idx + 1).padStart(3, '0')}`,
      designation: desig,
      maxWeeklyHours: desig === 'PROFESSOR' ? 12 : 18,
      officeRoom: office,
      specialization: idx < 15 ? 'Algorithms & Machine Learning' : 'General',
    });
  });

  await prisma.facultyMember.createMany({
    data: facultyMembersToCreate,
    skipDuplicates: true,
  });

  // Assign faculty role if missing
  if (facultyRole) {
    const roleAssignments = allFacultyUsers.map((u) => ({
      userId: u.id,
      roleId: facultyRole.id,
      campusId: campus.id,
      scopeType: 'own' as const,
      isActing: false,
    }));
    await prisma.userRoleAssignment.createMany({
      data: roleAssignments,
      skipDuplicates: true,
    });
  }

  const tariqMember = await prisma.facultyMember.findFirst({
    where: { user: { email: 'tariq.mahmud@university.edu' } },
  });
  const drRahmanMember = await prisma.facultyMember.findFirst({
    where: { user: { email: 'dr.rahman@university.edu' } },
  });

  // 9. Students (600 total)
  console.log('Seeding 600 Students in batch...');
  const studentFirstNames = ['Rafiq', 'Tania', 'Imran', 'Sadia', 'Nabil', 'Farzana', 'Ashik', 'Fahima', 'Tanvir', 'Nusrat', 'Shaon', 'Rashed', 'Sharmin', 'Abrar', 'Lamia', 'Sabbir', 'Mehnaz', 'Alvi', 'Afia', 'Shakil', 'Sumaiya', 'Mahir', 'Samira', 'Rakib', 'Tahsin'];
  const studentLastNames = ['Hasan', 'Akter', 'Chowdhury', 'Rahman', 'Ahmed', 'Islam', 'Haque', 'Siddique', 'Karim', 'Jahan', 'Uddin', 'Alam', 'Bhuiyan', 'Khan', 'Miah', 'Mostafa', 'Ali', 'Zaman', 'Hossain', 'Kazi'];

  const studentUsersToCreate: Array<{
    institutionId: string;
    email: string;
    fullName: string;
    passwordHash: string;
    isActive: boolean;
  }> = [];

  for (let i = 1; i <= 600; i++) {
    const fn = studentFirstNames[(i - 1) % studentFirstNames.length];
    const ln = studentLastNames[(i - 1) % studentLastNames.length];
    const email = i === 1 ? 'rafiq.hasan@university.edu' : `student.${i}@university.edu`;
    const fullName = i === 1 ? 'Rafiq Hasan' : `${fn} ${ln}`;
    studentUsersToCreate.push({
      institutionId: institution.id,
      email,
      fullName,
      passwordHash: devPassword,
      isActive: true,
    });
  }

  await prisma.user.createMany({
    data: studentUsersToCreate,
    skipDuplicates: true,
  });

  const allStudentUsers = await prisma.user.findMany({
    where: {
      email: { in: studentUsersToCreate.map((u) => u.email) },
    },
  });
  const studentUserMap = new Map(allStudentUsers.map((u) => [u.email, u]));

  // Assign student roles
  if (studentRole) {
    const studentRoleAssignments = allStudentUsers.map((u) => ({
      userId: u.id,
      roleId: studentRole.id,
      campusId: campus.id,
      scopeType: 'own' as const,
      isActing: false,
    }));
    await prisma.userRoleAssignment.createMany({
      data: studentRoleAssignments,
      skipDuplicates: true,
    });
  }

  // Create Student and StudentProfile records
  const allBatches = await prisma.batch.findMany({ where: { campusId: campus.id } });
  const allPrograms = await prisma.program.findMany({ where: { campusId: campus.id } });

  const studentsToCreate: Array<{
    institutionId: string;
    campusId: string;
    userId: string;
    programId: string;
    batchId: string;
    advisorId?: string | null;
    studentNumber: string;
    academicStatus: string;
  }> = [];

  allStudentUsers.forEach((u, idx) => {
    const isRafiq = u.email === 'rafiq.hasan@university.edu';
    const sNum = isRafiq ? '2024-360-117' : `2024-${String(300 + (idx % 80)).padStart(3, '0')}-${String(100 + idx).padStart(3, '0')}`;
    const prog = (isRafiq ? cseBsc! : allPrograms[idx % allPrograms.length]) ?? cseBsc!;
    const batch = (isRafiq ? batch2024! : allBatches[idx % allBatches.length]) ?? batch2024!;
    
    // Status distribution: ~80% ACTIVE, ~12% AT_RISK, ~5% PROBATION, ~3% GRADUATED
    let status = 'ACTIVE';
    if (isRafiq || idx % 8 === 0) status = 'AT_RISK';
    else if (idx % 20 === 0) status = 'PROBATION';

    studentsToCreate.push({
      institutionId: institution.id,
      campusId: campus.id,
      userId: u.id,
      programId: prog.id,
      batchId: batch.id,
      advisorId: tariqMember?.id ?? drRahmanMember?.id,
      studentNumber: sNum,
      academicStatus: status,
    });
  });

  await prisma.student.createMany({
    data: studentsToCreate,
    skipDuplicates: true,
  });

  const createdStudents = await prisma.student.findMany({
    where: { campusId: campus.id },
  });

  const profilesToCreate = createdStudents.map((s, idx) => {
    const isRafiq = s.studentNumber === '2024-360-117';
    return {
      studentId: s.id,
      nationality: 'Bangladeshi',
      phone: isRafiq ? '+880 1712 345678' : `+880 17${String(10000000 + idx).slice(0, 8)}`,
      addressLine: isRafiq ? 'Road 12, Dhanmondi, Dhaka' : 'Dhaka, Bangladesh',
      emergencyContact: isRafiq ? '+880 1711 000000' : '+880 1700 000000',
      bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'O-'][idx % 5],
      cgpa: isRafiq ? 3.21 : Number((2.4 + (idx % 16) * 0.1).toFixed(2)),
      totalCreditsCompleted: isRafiq ? 54 : 30 + (idx % 60),
      riskNotes: isRafiq
        ? 'Risk Review: Attendance dropped below 85% in 2 courses (CSE204, MAT201) and mid-term score is 58%.'
        : s.academicStatus === 'AT_RISK'
        ? 'Midterm score low in foundational subjects.'
        : null,
    };
  });

  await prisma.studentProfile.createMany({
    data: profilesToCreate,
    skipDuplicates: true,
  });

  // Guardian for Rafiq Hasan
  const rafiqStudent = createdStudents.find((s) => s.studentNumber === '2024-360-117');
  if (rafiqStudent && kamalHasanUser) {
    const guardian = await prisma.guardian.upsert({
      where: { userId: kamalHasanUser.id },
      update: { fullName: 'Kamal Hasan', phone: '+880 1711 000000', relationship: 'FATHER' },
      create: {
        institutionId: institution.id,
        userId: kamalHasanUser.id,
        fullName: 'Kamal Hasan',
        relationship: 'FATHER',
        email: kamalHasanUser.email,
        phone: '+880 1711 000000',
      },
    });
    await prisma.studentGuardian.upsert({
      where: { studentId_guardianId: { studentId: rafiqStudent.id, guardianId: guardian.id } },
      update: { isPrimary: true },
      create: { studentId: rafiqStudent.id, guardianId: guardian.id, isPrimary: true },
    });
  }

  // 10. Course Offerings & Sections for Fall 2026
  console.log('Seeding Course Offerings and Sections for Fall 2026...');
  const offerings = [
    { courseId: cse204Course!.id, coordinatorId: tariqMahmud?.id },
    { courseId: mat201Course!.id, coordinatorId: drRahman?.id },
    { courseId: eee201Course!.id, coordinatorId: drRahman?.id },
    { courseId: cse205Course!.id, coordinatorId: tariqMahmud?.id },
    { courseId: fin201Course!.id, coordinatorId: null },
    { courseId: law101Course!.id, coordinatorId: null },
  ];

  for (const o of offerings) {
    await prisma.courseOffering.upsert({
      where: { campusId_courseId_semesterId: { campusId: campus.id, courseId: o.courseId, semesterId: fall2026!.id } },
      update: { coordinatorId: o.coordinatorId },
      create: {
        institutionId: institution.id,
        campusId: campus.id,
        courseId: o.courseId,
        semesterId: fall2026!.id,
        coordinatorId: o.coordinatorId,
        status: 'OFFERED',
      },
    });
  }

  const cse204Offering = await prisma.courseOffering.findUnique({ where: { campusId_courseId_semesterId: { campusId: campus.id, courseId: cse204Course!.id, semesterId: fall2026!.id } } });
  const mat201Offering = await prisma.courseOffering.findUnique({ where: { campusId_courseId_semesterId: { campusId: campus.id, courseId: mat201Course!.id, semesterId: fall2026!.id } } });
  const eee201Offering = await prisma.courseOffering.findUnique({ where: { campusId_courseId_semesterId: { campusId: campus.id, courseId: eee201Course!.id, semesterId: fall2026!.id } } });
  const cse205Offering = await prisma.courseOffering.findUnique({ where: { campusId_courseId_semesterId: { campusId: campus.id, courseId: cse205Course!.id, semesterId: fall2026!.id } } });
  const fin201Offering = await prisma.courseOffering.findUnique({ where: { campusId_courseId_semesterId: { campusId: campus.id, courseId: fin201Course!.id, semesterId: fall2026!.id } } });
  const law101Offering = await prisma.courseOffering.findUnique({ where: { campusId_courseId_semesterId: { campusId: campus.id, courseId: law101Course!.id, semesterId: fall2026!.id } } });

  // Sections
  const sectionsData = [
    { courseOfferingId: cse204Offering!.id, sectionCode: 'Sec A', capacity: 45, facultyMemberId: tariqMember?.id, batchId: batch2024!.id },
    { courseOfferingId: cse204Offering!.id, sectionCode: 'Sec B', capacity: 45, facultyMemberId: drRahmanMember?.id, batchId: batch2024!.id },
    { courseOfferingId: mat201Offering!.id, sectionCode: 'Sec A', capacity: 45, facultyMemberId: drRahmanMember?.id, batchId: batch2024!.id },
    { courseOfferingId: eee201Offering!.id, sectionCode: 'Sec A', capacity: 45, facultyMemberId: tariqMember?.id, batchId: batch2024!.id },
    { courseOfferingId: cse205Offering!.id, sectionCode: 'Lab 1', capacity: 35, facultyMemberId: tariqMember?.id, batchId: batch2024!.id },
    { courseOfferingId: fin201Offering!.id, sectionCode: 'Sec A', capacity: 45, facultyMemberId: null, batchId: null },
    { courseOfferingId: law101Offering!.id, sectionCode: 'Sec A', capacity: 45, facultyMemberId: null, batchId: null },
  ];

  for (const s of sectionsData) {
    await prisma.section.upsert({
      where: { courseOfferingId_sectionCode: { courseOfferingId: s.courseOfferingId, sectionCode: s.sectionCode } },
      update: { capacity: s.capacity, facultyMemberId: s.facultyMemberId, batchId: s.batchId },
      create: {
        institutionId: institution.id,
        campusId: campus.id,
        courseOfferingId: s.courseOfferingId,
        sectionCode: s.sectionCode,
        capacity: s.capacity,
        facultyMemberId: s.facultyMemberId,
        batchId: s.batchId,
      },
    });
  }

  const cse204SecA = await prisma.section.findUnique({ where: { courseOfferingId_sectionCode: { courseOfferingId: cse204Offering!.id, sectionCode: 'Sec A' } } });
  const cse204SecB = await prisma.section.findUnique({ where: { courseOfferingId_sectionCode: { courseOfferingId: cse204Offering!.id, sectionCode: 'Sec B' } } });
  const mat201SecA = await prisma.section.findUnique({ where: { courseOfferingId_sectionCode: { courseOfferingId: mat201Offering!.id, sectionCode: 'Sec A' } } });
  const eee201SecA = await prisma.section.findUnique({ where: { courseOfferingId_sectionCode: { courseOfferingId: eee201Offering!.id, sectionCode: 'Sec A' } } });
  const cse205Lab1 = await prisma.section.findUnique({ where: { courseOfferingId_sectionCode: { courseOfferingId: cse205Offering!.id, sectionCode: 'Lab 1' } } });
  const fin201SecA = await prisma.section.findUnique({ where: { courseOfferingId_sectionCode: { courseOfferingId: fin201Offering!.id, sectionCode: 'Sec A' } } });
  const law101SecA = await prisma.section.findUnique({ where: { courseOfferingId_sectionCode: { courseOfferingId: law101Offering!.id, sectionCode: 'Sec A' } } });

  // 11. Enrollments for Rafiq Hasan and Batch 2024
  console.log('Seeding Enrollments...');
  if (rafiqStudent) {
    const rafiqEnrollments = [
      { sectionId: cse204SecA!.id, attendancePct: 82.5, currentGrade: 'B' },
      { sectionId: mat201SecA!.id, attendancePct: 84.0, currentGrade: 'B-' },
      { sectionId: eee201SecA!.id, attendancePct: 91.0, currentGrade: 'A-' },
      { sectionId: cse205Lab1!.id, attendancePct: 95.0, currentGrade: 'A' },
    ];
    for (const e of rafiqEnrollments) {
      await prisma.enrollment.upsert({
        where: { studentId_sectionId: { studentId: rafiqStudent.id, sectionId: e.sectionId } },
        update: { attendancePct: e.attendancePct, currentGrade: e.currentGrade },
        create: {
          institutionId: institution.id,
          campusId: campus.id,
          studentId: rafiqStudent.id,
          sectionId: e.sectionId,
          semesterId: fall2026!.id,
          attendancePct: e.attendancePct,
          currentGrade: e.currentGrade,
        },
      });
    }

    // Enroll 40 other students into cse204SecA
    const otherStudents = createdStudents.filter((s) => s.id !== rafiqStudent.id).slice(0, 41);
    const bulkEnrollments = otherStudents.map((s, idx) => ({
      institutionId: institution.id,
      campusId: campus.id,
      studentId: s.id,
      sectionId: cse204SecA!.id,
      semesterId: fall2026!.id,
      attendancePct: Number((70 + (idx % 28)).toFixed(1)),
      currentGrade: ['A', 'A-', 'B+', 'B', 'C+', 'D'][idx % 6],
    }));
    await prisma.enrollment.createMany({
      data: bulkEnrollments,
      skipDuplicates: true,
    });
  }

  // 12. Timetable Slots (Weekly grid Mon - Fri matching Timetable Builder & Mobile mockups)
  console.log('Seeding Timetable Slots...');
  // Days: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri
  const slotsData = [
    // Monday
    { sectionId: mat201SecA!.id, roomId: room3C!.id, facultyMemberId: tariqMember!.id, dayOfWeek: 1, startTime: '09:00', endTime: '10:30' },
    { sectionId: cse204SecA!.id, roomId: room4B!.id, facultyMemberId: tariqMember!.id, dayOfWeek: 1, startTime: '10:45', endTime: '12:15' },
    { sectionId: eee201SecA!.id, roomId: lab2!.id, facultyMemberId: drRahmanMember!.id, dayOfWeek: 1, startTime: '13:00', endTime: '14:30' },
    { sectionId: cse205Lab1!.id, roomId: lab1!.id, facultyMemberId: tariqMember!.id, dayOfWeek: 1, startTime: '14:45', endTime: '16:15' },

    // Tuesday
    { sectionId: cse204SecB!.id, roomId: room4B!.id, facultyMemberId: drRahmanMember!.id, dayOfWeek: 2, startTime: '09:00', endTime: '10:30' },
    { sectionId: fin201SecA!.id, roomId: room2A!.id, facultyMemberId: drRahmanMember!.id, dayOfWeek: 2, startTime: '10:45', endTime: '12:15' },

    // Wednesday
    { sectionId: mat201SecA!.id, roomId: room3C!.id, facultyMemberId: tariqMember!.id, dayOfWeek: 3, startTime: '09:00', endTime: '10:30' },
    { sectionId: cse204SecA!.id, roomId: room4B!.id, facultyMemberId: tariqMember!.id, dayOfWeek: 3, startTime: '10:45', endTime: '12:15' },
    { sectionId: eee201SecA!.id, roomId: room5C!.id, facultyMemberId: drRahmanMember!.id, dayOfWeek: 3, startTime: '13:00', endTime: '14:30' },

    // Thursday
    { sectionId: law101SecA!.id, roomId: mootCourt!.id, facultyMemberId: drRahmanMember!.id, dayOfWeek: 4, startTime: '09:00', endTime: '10:30' },
    { sectionId: cse204SecA!.id, roomId: room4B!.id, facultyMemberId: tariqMember!.id, dayOfWeek: 4, startTime: '10:45', endTime: '12:15' },
    { sectionId: eee201SecA!.id, roomId: room5C!.id, facultyMemberId: drRahmanMember!.id, dayOfWeek: 4, startTime: '13:00', endTime: '14:30' },

    // Friday
    { sectionId: cse205Lab1!.id, roomId: lab1!.id, facultyMemberId: tariqMember!.id, dayOfWeek: 5, startTime: '09:00', endTime: '11:00' },
  ];

  await prisma.timetableSlot.deleteMany({ where: { campusId: campus.id } });
  await prisma.timetableSlot.createMany({
    data: slotsData.map((s) => ({
      institutionId: institution.id,
      campusId: campus.id,
      sectionId: s.sectionId,
      roomId: s.roomId,
      facultyMemberId: s.facultyMemberId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      slotStatus: 'CONFIRMED',
      isPublished: true,
    })),
  });

  console.log('Phase 3: Academic Core seed complete!');
}
