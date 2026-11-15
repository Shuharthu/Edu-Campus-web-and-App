import { PrismaClient } from '@prisma/client';
import { loadRootEnv } from '../src/config/load-env';

loadRootEnv();
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Phase 5: Finance, Scholarships & Digital ID against Supabase PostgreSQL...');

  const institution = await prisma.institution.findFirst();
  if (!institution) throw new Error('Institution not found');

  const campus = await prisma.campus.findFirst({ where: { institutionId: institution.id } });
  if (!campus) throw new Error('Campus not found');

  const semester = await prisma.semester.findFirst({
    where: { institutionId: institution.id },
    orderBy: { startsAt: 'desc' },
  });
  if (!semester) throw new Error('No semester found');
  console.log('Using active semester:', semester.code, semester.name);

  const programs = await prisma.program.findMany({
    where: { institutionId: institution.id },
  });

  // 1. Fee Structures
  console.log('Upserting Fee Structures...');
  for (const prog of programs) {
    const isLabHeavy = prog.code.includes('CSE') || prog.code.includes('EEE');
    await prisma.feeStructure.upsert({
      where: { id: `00000000-0000-0000-0000-${prog.id.slice(-12)}` },
      update: {},
      create: {
        id: `00000000-0000-0000-0000-${prog.id.slice(-12)}`,
        institutionId: institution.id,
        programId: prog.id,
        semesterId: semester.id,
        name: `${prog.name} - Standard Fee Structure`,
        tuitionPerCredit: 200.0,
        labFee: isLabHeavy ? 250.0 : 0.0,
        libraryFee: 120.0,
        activityFee: 50.0,
      },
    });
  }

  // 2. Scholarships
  console.log('Upserting Scholarships...');
  const deanMerit = await prisma.scholarship.upsert({
    where: { id: '00000000-0000-0000-0001-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0001-000000000001',
      institutionId: institution.id,
      name: "Dean's Merit Scholarship (25% Tuition Waiver)",
      code: 'DEAN-MERIT',
      discountPct: 25.0,
      criteria: 'Semester GPA >= 3.75 and Attendance >= 80%',
      isActive: true,
    },
  });

  const vcHonor = await prisma.scholarship.upsert({
    where: { id: '00000000-0000-0000-0001-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0001-000000000002',
      institutionId: institution.id,
      name: "Vice Chancellor's Full Honor (100% Tuition Waiver)",
      code: 'VC-HONOR',
      discountPct: 100.0,
      criteria: 'Semester GPA >= 3.95 and top 1% of cohort',
      isActive: true,
    },
  });

  const needAid = await prisma.scholarship.upsert({
    where: { id: '00000000-0000-0000-0001-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0001-000000000003',
      institutionId: institution.id,
      name: 'Need-Based Financial Assistance (50% Tuition Waiver)',
      code: 'NEED-AID',
      discountPct: 50.0,
      criteria: 'Family annual income verification and good academic standing',
      isActive: true,
    },
  });

  // 3. Find Rafiq Hasan
  const rafiq = await prisma.student.findFirst({
    where: {
      OR: [
        { studentNumber: '2024-CSE-0042' },
        { user: { fullName: { contains: 'Rafiq' } } },
      ],
    },
    include: { user: true },
  });
  if (!rafiq) throw new Error('Student Rafiq not found');
  console.log('Found Rafiq Hasan:', rafiq.id, rafiq.studentNumber, rafiq.user.fullName);

  // Award Dean's Merit to Rafiq
  await prisma.studentScholarship.upsert({
    where: {
      scholarshipId_studentId_semesterId: {
        scholarshipId: deanMerit.id,
        studentId: rafiq.id,
        semesterId: semester.id,
      },
    },
    update: {},
    create: {
      scholarshipId: deanMerit.id,
      studentId: rafiq.id,
      semesterId: semester.id,
      status: 'APPROVED',
    },
  });

  // 4. Create Invoice for Rafiq Hasan matching Mockup media_1794467978586_9ba55207.png
  console.log('Upserting Invoices & Installments...');
  const rafiqInvoice = await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-2026-0042' },
    update: {
      totalAmount: 3970.0,
      scholarshipDeduction: 900.0,
      netPayable: 3070.0,
      paidAmount: 1023.34,
      status: 'PARTIAL',
      dueDate: new Date('2026-11-30T23:59:59Z'),
    },
    create: {
      institutionId: institution.id,
      campusId: campus.id,
      studentId: rafiq.id,
      semesterId: semester.id,
      invoiceNumber: 'INV-2026-0042',
      totalAmount: 3970.0,
      scholarshipDeduction: 900.0,
      netPayable: 3070.0,
      paidAmount: 1023.34,
      status: 'PARTIAL',
      dueDate: new Date('2026-11-30T23:59:59Z'),
    },
  });

  // 3 Installments for Rafiq
  const inst1 = await prisma.invoiceInstallment.upsert({
    where: {
      invoiceId_installmentNumber: {
        invoiceId: rafiqInvoice.id,
        installmentNumber: 1,
      },
    },
    update: {},
    create: {
      invoiceId: rafiqInvoice.id,
      installmentNumber: 1,
      amount: 1023.34,
      dueDate: new Date('2026-09-05T23:59:59Z'),
      paidAmount: 1023.34,
      status: 'PAID',
      paidAt: new Date('2026-09-04T14:32:00Z'),
      stripePaymentIntentId: 'pi_3MtwBwLkdIwHu7ix0B391z_inst1',
    },
  });

  await prisma.invoiceInstallment.upsert({
    where: {
      invoiceId_installmentNumber: {
        invoiceId: rafiqInvoice.id,
        installmentNumber: 2,
      },
    },
    update: {},
    create: {
      invoiceId: rafiqInvoice.id,
      installmentNumber: 2,
      amount: 1023.33,
      dueDate: new Date('2026-11-30T23:59:59Z'),
      paidAmount: 0,
      status: 'PENDING',
    },
  });

  await prisma.invoiceInstallment.upsert({
    where: {
      invoiceId_installmentNumber: {
        invoiceId: rafiqInvoice.id,
        installmentNumber: 3,
      },
    },
    update: {},
    create: {
      invoiceId: rafiqInvoice.id,
      installmentNumber: 3,
      amount: 1023.33,
      dueDate: new Date('2027-01-15T23:59:59Z'),
      paidAmount: 0,
      status: 'PENDING',
    },
  });

  // Record payment transaction for Installment 1
  await prisma.paymentTransaction.create({
    data: {
      invoiceId: rafiqInvoice.id,
      installmentId: inst1.id,
      studentId: rafiq.id,
      amount: 1023.34,
      currency: 'USD',
      gateway: 'STRIPE',
      gatewayReference: 'ch_3MtwBwLkdIwHu7ix0B391z_test',
      status: 'SUCCESS',
      paidAt: new Date('2026-09-04T14:32:00Z'),
    },
  });

  // 5. Digital ID Credential for Rafiq Hasan (matching mockup media_1794467978585_cffd2546.png)
  console.log('Upserting Digital ID Credential...');
  await prisma.digitalIDCredential.upsert({
    where: { studentId: rafiq.id },
    update: {},
    create: {
      studentId: rafiq.id,
      cardUuid: 'smartedu_id_2024_cse_0042',
      status: 'ACTIVE',
      issuedAt: new Date('2024-09-01T00:00:00Z'),
      expiresAt: new Date('2028-08-31T23:59:59Z'),
      bloodGroup: 'A+',
      emergencyPhone: '+880 1711-234567',
      canAccessGate: true,
      canAccessLibrary: true,
      canAccessLabs: true,
      canAccessHostel: false,
    },
  });

  // 6. Service Request for Rafiq Hasan
  console.log('Upserting Service Requests...');
  await prisma.serviceRequest.upsert({
    where: { requestNumber: 'SR-2026-8492' },
    update: {},
    create: {
      institutionId: institution.id,
      studentId: rafiq.id,
      requestType: 'TRANSCRIPT',
      requestNumber: 'SR-2026-8492',
      purpose: 'Graduate School Application (WES Evaluation)',
      status: 'IN_REVIEW',
      feeAmount: 15.0,
      isFeePaid: true,
      remarks: 'Documents verified by department coordinator',
    },
  });

  console.log('Phase 5 Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
