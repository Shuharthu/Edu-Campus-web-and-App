import { PrismaClient } from '@prisma/client';
import { loadRootEnv } from '../src/config/load-env';

loadRootEnv();
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Phase 6: Communication, Announcements, Threads & Messages against Supabase PostgreSQL...');

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

  const cseDept = await prisma.department.findFirst({
    where: { code: 'CSE' },
  });

  const section = await prisma.section.findFirst({
    where: { sectionCode: 'CSE204-A' },
  });

  // 1. Announcements
  console.log('Upserting Announcements...');
  const ann1 = await prisma.announcement.upsert({
    where: { id: '00000000-0000-0000-0006-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0006-000000000001',
      institutionId: institution.id,
      authorId: adminUser.id,
      title: 'Fall 2026 Midterm Examination Seating Matrix & Admit Cards Published',
      content: 'Dear Students & Faculty,\n\nThe Fall 2026 Midterm Examination Seating Matrix has been published. All eligible students must generate their digital admit cards with anti-fraud QR code prior to entering the exam venue. Defaulters below 75% attendance should report to the department coordinator immediately.\n\nExam venues open at 08:30 AM.',
      priority: 'URGENT',
      targetScope: 'ALL',
      sendPush: true,
      sendEmail: true,
      sendSms: false,
      isPinned: true,
      statsDeliveryCount: 386,
      statsReadCount: 312,
      publishedAt: new Date('2026-11-12T09:00:00Z'),
    },
  });

  const ann2 = await prisma.announcement.upsert({
    where: { id: '00000000-0000-0000-0006-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0006-000000000002',
      institutionId: institution.id,
      authorId: adminUser.id,
      targetDepartmentId: cseDept?.id,
      title: 'CSE Department Hackathon & Robotics Showcase Registration Open',
      content: 'Registration is now open for the annual CSE Autumn Hackathon. Teams of 3-4 students may submit their project proposals to the department office by November 20, 2026.',
      priority: 'NORMAL',
      targetScope: 'DEPARTMENT',
      sendPush: true,
      sendEmail: true,
      sendSms: false,
      isPinned: false,
      statsDeliveryCount: 164,
      statsReadCount: 142,
      publishedAt: new Date('2026-11-13T11:30:00Z'),
    },
  });

  // Read receipt for Rafiq
  await prisma.announcementReadReceipt.upsert({
    where: {
      announcementId_userId: {
        announcementId: ann1.id,
        userId: rafiqStudent.userId,
      },
    },
    update: {},
    create: {
      announcementId: ann1.id,
      userId: rafiqStudent.userId,
      readAt: new Date('2026-11-12T09:45:00Z'),
    },
  });

  // 2. Communication Threads
  console.log('Upserting Communication Threads & Messages...');
  const thread = await prisma.communicationThread.upsert({
    where: { id: '00000000-0000-0000-0006-000000000010' },
    update: {},
    create: {
      id: '00000000-0000-0000-0006-000000000010',
      institutionId: institution.id,
      sectionId: section?.id,
      departmentId: cseDept?.id,
      title: 'CSE204-A Data Structures — Class Discussion & Q&A',
      threadType: 'COURSE_DISCUSSION',
      isLocked: false,
      createdById: adminUser.id,
    },
  });

  // Seed 3 messages in the thread
  await prisma.threadMessage.createMany({
    data: [
      {
        threadId: thread.id,
        senderId: adminUser.id,
        content: 'Welcome to the CSE204 Section A channel. Please post questions about Assignment 2 (Red-Black Trees & AVL Balance) here.',
        createdAt: new Date('2026-11-10T10:00:00Z'),
      },
      {
        threadId: thread.id,
        senderId: rafiqStudent.userId,
        content: 'Sir, for problem 3 in Assignment 2, should we recolor before or after performing the rotation?',
        createdAt: new Date('2026-11-10T10:15:00Z'),
      },
      {
        threadId: thread.id,
        senderId: adminUser.id,
        content: 'Good question Rafiq. Check case 1 vs case 2: recolor if the uncle node is red, rotate if the uncle is black.',
        createdAt: new Date('2026-11-10T10:20:00Z'),
      },
    ],
    skipDuplicates: true,
  });

  // 3. Dispatch Logs
  console.log('Upserting Dispatch Logs...');
  await prisma.dispatchLog.createMany({
    data: [
      {
        institutionId: institution.id,
        channel: 'PUSH',
        recipient: 'Cohort Fall 2026 (386 tokens)',
        status: 'DELIVERED',
        latencyMs: 142,
        createdAt: new Date('2026-11-12T09:00:02Z'),
      },
      {
        institutionId: institution.id,
        channel: 'EMAIL',
        recipient: 'tariq.mahmud@university.edu',
        status: 'DELIVERED',
        latencyMs: 310,
        createdAt: new Date('2026-11-12T09:00:05Z'),
      },
      {
        institutionId: institution.id,
        channel: 'EMAIL',
        recipient: 'rafiq.hasan@university.edu',
        status: 'DELIVERED',
        latencyMs: 295,
        createdAt: new Date('2026-11-12T09:00:06Z'),
      },
      {
        institutionId: institution.id,
        channel: 'SMS',
        recipient: '+880 1711-234567',
        status: 'DELIVERED',
        latencyMs: 512,
        createdAt: new Date('2026-11-12T09:01:00Z'),
      },
    ],
    skipDuplicates: true,
  });

  console.log('Phase 6 Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
