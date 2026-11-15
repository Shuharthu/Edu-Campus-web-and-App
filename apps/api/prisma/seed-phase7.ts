import { PrismaClient } from '@prisma/client';
import { loadRootEnv } from '../src/config/load-env';

loadRootEnv();
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Phase 7: Library, Campus Operations & Career against Supabase PostgreSQL...');

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

  // 1. Library Books
  console.log('Upserting Library Books...');
  const book1 = await prisma.book.upsert({
    where: { id: '00000000-0000-0000-0007-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000001',
      institutionId: institution.id,
      isbn: '978-0262046305',
      title: 'Introduction to Algorithms, 4th Edition',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
      publisher: 'MIT Press',
      edition: '4th Edition',
      category: 'COMPUTER_SCIENCE',
      shelfLocation: 'CS-B4-S2',
      totalCopies: 12,
      availableCopies: 11,
      coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=400&q=80',
    },
  });

  const book2 = await prisma.book.upsert({
    where: { id: '00000000-0000-0000-0007-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000002',
      institutionId: institution.id,
      isbn: '978-0128182000',
      title: 'Computer Networks: A Systems Approach',
      author: 'Larry L. Peterson, Bruce S. Davie',
      publisher: 'Morgan Kaufmann',
      edition: '6th Edition',
      category: 'NETWORKING',
      shelfLocation: 'CS-B2-S1',
      totalCopies: 8,
      availableCopies: 7,
      coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
    },
  });

  const book3 = await prisma.book.upsert({
    where: { id: '00000000-0000-0000-0007-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000003',
      institutionId: institution.id,
      isbn: '978-0134494166',
      title: 'Clean Architecture: A Craftsman Guide to Software Structure and Design',
      author: 'Robert C. Martin',
      publisher: 'Prentice Hall',
      edition: '1st Edition',
      category: 'SOFTWARE_ENGINEERING',
      shelfLocation: 'CS-B5-S4',
      totalCopies: 15,
      availableCopies: 14,
      coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80',
    },
  });

  const book4 = await prisma.book.upsert({
    where: { id: '00000000-0000-0000-0007-000000000004' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000004',
      institutionId: institution.id,
      isbn: '978-0262035613',
      title: 'Deep Learning (Adaptive Computation and Machine Learning)',
      author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
      publisher: 'MIT Press',
      edition: '1st Edition',
      category: 'ARTIFICIAL_INTELLIGENCE',
      shelfLocation: 'AI-B1-S3',
      totalCopies: 6,
      availableCopies: 6,
      coverUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=400&q=80',
    },
  });

  const book5 = await prisma.book.upsert({
    where: { id: '00000000-0000-0000-0007-000000000005' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000005',
      institutionId: institution.id,
      isbn: '978-0078022159',
      title: 'Database System Concepts, 7th Edition [Digital E-Book]',
      author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
      publisher: 'McGraw-Hill Education',
      edition: '7th Edition',
      category: 'DATABASE',
      shelfLocation: 'DIGITAL-REPOSITORY',
      totalCopies: 999,
      availableCopies: 999,
      ebookUrl: 'https://library.smartedu.edu/ebooks/db-concepts-7e.pdf',
      coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=400&q=80',
    },
  });

  // 2. Book Loans
  console.log('Upserting Book Loan for Rafiq Hasan...');
  const loan1 = await prisma.bookLoan.upsert({
    where: { id: '00000000-0000-0000-0007-000000000011' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000011',
      bookId: book1.id,
      studentId: rafiqStudent.id,
      borrowedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      fineAmount: 0.00,
      isFinePaid: true,
    },
  });

  // 3. Hostel Rooms & Allocations
  console.log('Upserting Hostel Rooms & Allocations...');
  const room1 = await prisma.hostelRoom.upsert({
    where: { id: '00000000-0000-0000-0007-000000000021' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000021',
      institutionId: institution.id,
      buildingName: 'Shahidullah Hall (Boys)',
      roomNumber: '302',
      capacity: 3,
      occupied: 2,
      feePerSemester: 450.00,
    },
  });

  const room2 = await prisma.hostelRoom.upsert({
    where: { id: '00000000-0000-0000-0007-000000000022' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000022',
      institutionId: institution.id,
      buildingName: 'Begum Rokeya Hall (Girls)',
      roomNumber: '204',
      capacity: 2,
      occupied: 1,
      feePerSemester: 500.00,
    },
  });

  const alloc1 = await prisma.hostelAllocation.upsert({
    where: { id: '00000000-0000-0000-0007-000000000031' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000031',
      roomId: room1.id,
      studentId: rafiqStudent.id,
      allocatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
    },
  });

  // 4. Transport Routes
  console.log('Upserting Transport Routes...');
  await prisma.transportRoute.upsert({
    where: { id: '00000000-0000-0000-0007-000000000041' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000041',
      institutionId: institution.id,
      routeName: 'Uttara - Campus Express',
      routeNumber: 'R-01',
      departureTime: '07:30 AM',
      vehicleNumber: 'DHK-METRO-BA-11-2345',
      driverName: 'Kabir Hossain',
      driverPhone: '+8801711223344',
      currentStop: 'Farmgate Junction (In Transit)',
      activeStatus: 'ON_SCHEDULE',
    },
  });

  await prisma.transportRoute.upsert({
    where: { id: '00000000-0000-0000-0007-000000000042' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000042',
      institutionId: institution.id,
      routeName: 'Dhanmondi - Campus Shuttle',
      routeNumber: 'R-02',
      departureTime: '08:00 AM',
      vehicleNumber: 'DHK-METRO-BA-11-5678',
      driverName: 'Monirul Islam',
      driverPhone: '+8801811334455',
      currentStop: 'Dhanmondi 27 (Boarding)',
      activeStatus: 'ON_SCHEDULE',
    },
  });

  await prisma.transportRoute.upsert({
    where: { id: '00000000-0000-0000-0007-000000000043' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000043',
      institutionId: institution.id,
      routeName: 'Mirpur - Campus Rapid',
      routeNumber: 'R-03',
      departureTime: '07:45 AM',
      vehicleNumber: 'DHK-METRO-BA-11-9012',
      driverName: 'Abdul Gafur',
      driverPhone: '+8801911445566',
      currentStop: 'Mirpur 10 (Departed)',
      activeStatus: 'DELAYED',
    },
  });

  // 5. Maintenance Tickets
  console.log('Upserting Maintenance Tickets...');
  await prisma.maintenanceTicket.upsert({
    where: { id: '00000000-0000-0000-0007-000000000051' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000051',
      institutionId: institution.id,
      reportedById: adminUser.id,
      location: 'Hardware Lab 4B',
      category: 'HVAC',
      description: 'Central AC unit is blowing ambient air; ambient temperature exceeds 31C affecting GPU workstations.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignedTo: 'Kamal Uddin (Senior HVAC Tech)',
    },
  });

  await prisma.maintenanceTicket.upsert({
    where: { id: '00000000-0000-0000-0007-000000000052' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000052',
      institutionId: institution.id,
      reportedById: adminUser.id,
      location: 'Auditorium Hall C',
      category: 'AV_SYSTEM',
      description: 'Main laser projector lamp flickering intermittently during CSE departmental seminars.',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignedTo: null,
    },
  });

  await prisma.maintenanceTicket.upsert({
    where: { id: '00000000-0000-0000-0007-000000000053' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000053',
      institutionId: institution.id,
      reportedById: adminUser.id,
      location: 'Shahidullah Hall Room 302',
      category: 'PLUMBING',
      description: 'Washroom faucet cartridge leak repaired and sealed with high-pressure Teflon valve.',
      priority: 'LOW',
      status: 'RESOLVED',
      assignedTo: 'Babul Mia (Plumber)',
      resolvedAt: new Date(),
    },
  });

  // 6. Job Postings & Applications
  console.log('Upserting Job Postings & Student Applications...');
  const job1 = await prisma.jobPosting.upsert({
    where: { id: '00000000-0000-0000-0007-000000000061' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000061',
      institutionId: institution.id,
      companyName: 'bKash Limited',
      companyLogoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      roleTitle: 'Software Engineer Intern (Backend / Cloud)',
      jobType: 'INTERNSHIP',
      stipendSalary: '$400 / month',
      location: 'Dhaka (Hybrid)',
      minCgpa: 3.20,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      requirements: 'Proficiency in TypeScript, Node.js / NestJS, PostgreSQL, Docker, and RESTful API architecture.',
      isActive: true,
    },
  });

  const job2 = await prisma.jobPosting.upsert({
    where: { id: '00000000-0000-0000-0007-000000000062' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000062',
      institutionId: institution.id,
      companyName: 'Brain Station 23',
      companyLogoUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&q=80',
      roleTitle: 'Junior Full-Stack Developer',
      jobType: 'FULL_TIME',
      stipendSalary: '$650 / month',
      location: 'Dhaka / Remote',
      minCgpa: 3.00,
      applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      requirements: 'React/Next.js frontend, NestJS backend, Git workflow, CI/CD experience with modern cloud tooling.',
      isActive: true,
    },
  });

  const job3 = await prisma.jobPosting.upsert({
    where: { id: '00000000-0000-0000-0007-000000000063' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000063',
      institutionId: institution.id,
      companyName: 'Optimizely',
      companyLogoUrl: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&w=120&q=80',
      roleTitle: 'Associate QA Automation Engineer',
      jobType: 'FULL_TIME',
      stipendSalary: '$600 / month',
      location: 'Dhaka (Gulshan)',
      minCgpa: 3.00,
      applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      requirements: 'Playwright/Cypress automation, API test frameworks, postman automation, performance profiling.',
      isActive: true,
    },
  });

  const app1 = await prisma.jobApplication.upsert({
    where: { id: '00000000-0000-0000-0007-000000000071' },
    update: {},
    create: {
      id: '00000000-0000-0000-0007-000000000071',
      jobPostingId: job1.id,
      studentId: rafiqStudent.id,
      status: 'SHORTLISTED',
      interviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Phase 7 seed finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding Phase 7:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
