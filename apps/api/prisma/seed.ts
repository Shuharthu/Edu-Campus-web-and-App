import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  PERMISSION_SCOPES,
  type PermissionAction,
  type PermissionModule,
  type PermissionScope,
} from '@smart-edu/types';
import { PrismaClient, RoleTier } from '@prisma/client';
import { encryptSecret, hashPassword } from '../src/common/crypto.util';
import { getEnv } from '../src/config/env';
import { loadRootEnv } from '../src/config/load-env';
import { seedAcademicCore } from './seed-academic';

loadRootEnv();

const prisma = new PrismaClient();

// Fixed Base32 dev TOTP secrets (only for local development/test seeds)
export const DEV_TOTP_SECRETS = {
  superAdmin: 'JBSWY3DPEHPK3PXP',
  admin: 'JBSWY3DPEHPK3PXQ',
  registrar: 'JBSWY3DPEHPK3PXR',
  faculty: 'JBSWY3DPEHPK3PXS',
} as const;

type PermSpec = [PermissionModule, PermissionAction, PermissionScope];

const ROLE_TEMPLATES: Array<{
  slug: string;
  name: string;
  tier: RoleTier;
  requiresMfa: boolean;
  description: string;
  permissions: PermSpec[];
}> = [
  {
    slug: 'super_admin',
    name: 'Super admin',
    tier: RoleTier.SUPER_ADMIN,
    requiresMfa: true,
    description: 'Institution owner managing campuses, integrations, global settings and Admins.',
    permissions: PERMISSION_MODULES.flatMap((m) =>
      PERMISSION_ACTIONS.map((a): PermSpec => [m, a, 'institution']),
    ),
  },
  {
    slug: 'admin',
    name: 'Admin',
    tier: RoleTier.ADMIN,
    requiresMfa: true,
    description: 'Runs daily campus operations, academics, finance, Sub-admin creation and approvals.',
    permissions: [
      ['institution_settings', 'view', 'campus'],
      ['roles_permissions', 'view', 'campus'],
      ['roles_permissions', 'create', 'campus'],
      ['roles_permissions', 'edit', 'campus'],
      ['roles_permissions', 'approve', 'campus'],
      ['roles_permissions', 'delete', 'campus'],
      ['academics_setup', 'view', 'campus'],
      ['academics_setup', 'create', 'campus'],
      ['academics_setup', 'edit', 'campus'],
      ['academics_setup', 'approve', 'campus'],
      ['student_records', 'view', 'campus'],
      ['student_records', 'create', 'campus'],
      ['student_records', 'edit', 'campus'],
      ['student_records', 'export', 'campus'],
      ['attendance', 'view', 'campus'],
      ['attendance', 'edit', 'campus'],
      ['attendance', 'export', 'campus'],
      ['grades', 'view', 'campus'],
      ['grades', 'approve', 'campus'],
      ['grades', 'export', 'campus'],
      ['finance', 'view', 'campus'],
      ['finance', 'create', 'campus'],
      ['finance', 'edit', 'campus'],
      ['finance', 'approve', 'campus'],
      ['finance', 'export', 'campus'],
      ['communication', 'view', 'campus'],
      ['communication', 'create', 'campus'],
      ['reports_analytics', 'view', 'campus'],
      ['reports_analytics', 'export', 'campus'],
      ['audit_log', 'view', 'campus'],
      ['library', 'view', 'campus'],
      ['campus_operations', 'view', 'campus'],
      ['services', 'view', 'campus'],
      ['services', 'approve', 'campus'],
    ],
  },
  {
    slug: 'registrar',
    name: 'Registrar',
    tier: RoleTier.SUB_ADMIN,
    requiresMfa: true,
    description: 'Manages academic records, enrollments, timetable, transcripts and service requests.',
    permissions: [
      ['academics_setup', 'view', 'campus'],
      ['academics_setup', 'create', 'campus'],
      ['academics_setup', 'edit', 'campus'],
      ['student_records', 'view', 'campus'],
      ['student_records', 'create', 'campus'],
      ['student_records', 'edit', 'campus'],
      ['student_records', 'export', 'campus'],
      ['attendance', 'view', 'campus'],
      ['grades', 'view', 'campus'],
      ['communication', 'view', 'campus'],
      ['communication', 'create', 'campus'],
      ['reports_analytics', 'view', 'campus'],
      ['services', 'view', 'campus'],
      ['services', 'edit', 'campus'],
      ['services', 'approve', 'campus'],
    ],
  },
  {
    slug: 'accounts_officer',
    name: 'Accounts officer',
    tier: RoleTier.SUB_ADMIN,
    requiresMfa: true,
    description: 'Scoped Sub-admin for tuition billing, installments, scholarships and fee reconciliation.',
    permissions: [
      ['finance', 'view', 'campus'],
      ['finance', 'create', 'campus'],
      ['finance', 'edit', 'campus'],
      ['finance', 'approve', 'campus'],
      ['finance', 'export', 'campus'],
      ['student_records', 'view', 'campus'],
      ['reports_analytics', 'view', 'campus'],
    ],
  },
  {
    slug: 'librarian',
    name: 'Librarian',
    tier: RoleTier.SUB_ADMIN,
    requiresMfa: true,
    description: 'Manages library catalog, circulation desk, loans, reservations and fines.',
    permissions: [
      ['library', 'view', 'campus'],
      ['library', 'create', 'campus'],
      ['library', 'edit', 'campus'],
      ['library', 'delete', 'campus'],
      ['reports_analytics', 'view', 'campus'],
    ],
  },
  {
    slug: 'admissions_officer',
    name: 'Admissions officer',
    tier: RoleTier.SUB_ADMIN,
    requiresMfa: true,
    description: 'Manages student intake pipeline, offers and onboarding.',
    permissions: [
      ['student_records', 'view', 'campus'],
      ['student_records', 'create', 'campus'],
      ['student_records', 'edit', 'campus'],
      ['communication', 'create', 'campus'],
    ],
  },
  {
    slug: 'hostel_transport_manager',
    name: 'Hostel and transport manager',
    tier: RoleTier.SUB_ADMIN,
    requiresMfa: true,
    description: 'Manages hostel allocations, transport routes, vehicles and maintenance tickets.',
    permissions: [
      ['campus_operations', 'view', 'campus'],
      ['campus_operations', 'create', 'campus'],
      ['campus_operations', 'edit', 'campus'],
      ['services', 'view', 'campus'],
      ['services', 'edit', 'campus'],
    ],
  },
  {
    slug: 'exam_controller',
    name: 'Exam controller',
    tier: RoleTier.SUB_ADMIN,
    requiresMfa: true,
    description: 'Schedules exams, verifies eligibility, moderates grades and locks published results.',
    permissions: [
      ['academics_setup', 'view', 'campus'],
      ['attendance', 'view', 'campus'],
      ['grades', 'view', 'campus'],
      ['grades', 'approve', 'campus'],
      ['grades', 'export', 'campus'],
      ['reports_analytics', 'view', 'campus'],
    ],
  },
  {
    slug: 'department_head',
    name: 'Department head',
    tier: RoleTier.SUB_ADMIN,
    requiresMfa: true,
    description: 'Department-scoped leader approving grade changes, workload and course offerings.',
    permissions: [
      ['academics_setup', 'view', 'department'],
      ['academics_setup', 'edit', 'department'],
      ['student_records', 'view', 'department'],
      ['attendance', 'view', 'department'],
      ['grades', 'view', 'department'],
      ['grades', 'approve', 'department'],
      ['roles_permissions', 'view', 'department'],
      ['roles_permissions', 'approve', 'department'],
      ['communication', 'create', 'department'],
      ['reports_analytics', 'view', 'department'],
    ],
  },
  {
    slug: 'faculty',
    name: 'Faculty',
    tier: RoleTier.FACULTY,
    requiresMfa: true,
    description: 'Teaches assigned sections: attendance, marks entry, coursework and advisee leaves.',
    permissions: [
      ['academics_setup', 'view', 'own'],
      ['student_records', 'view', 'section'],
      ['attendance', 'view', 'section'],
      ['attendance', 'create', 'section'],
      ['attendance', 'edit', 'section'],
      ['grades', 'view', 'section'],
      ['grades', 'create', 'section'],
      ['grades', 'edit', 'section'],
      ['communication', 'view', 'section'],
      ['communication', 'create', 'section'],
      ['reports_analytics', 'view', 'section'],
      ['services', 'approve', 'section'],
    ],
  },
  {
    slug: 'student',
    name: 'Student',
    tier: RoleTier.STUDENT,
    requiresMfa: false,
    description: 'Accesses own timetable, attendance, courses, grades, invoices, library and services.',
    permissions: [
      ['academics_setup', 'view', 'own'],
      ['student_records', 'view', 'own'],
      ['attendance', 'view', 'own'],
      ['grades', 'view', 'own'],
      ['finance', 'view', 'own'],
      ['communication', 'view', 'own'],
      ['reports_analytics', 'view', 'own'],
      ['library', 'view', 'own'],
      ['services', 'view', 'own'],
      ['services', 'create', 'own'],
    ],
  },
  {
    slug: 'parent',
    name: 'Parent or guardian',
    tier: RoleTier.PARENT,
    requiresMfa: false,
    description: 'Read-only access to linked student attendance, results, fees and notices.',
    permissions: [
      ['student_records', 'view', 'own'],
      ['attendance', 'view', 'own'],
      ['grades', 'view', 'own'],
      ['finance', 'view', 'own'],
      ['communication', 'view', 'own'],
    ],
  },
];

async function main() {
  const env = getEnv();
  console.log('Seeding Smart EDU foundation database...');

  const institution = await prisma.institution.upsert({
    where: { domain: env.INSTITUTION_DOMAIN },
    update: {
      name: env.UNIVERSITY_NAME,
      shortName: env.UNIVERSITY_SHORT_NAME,
      supportEmail: env.SUPPORT_EMAIL,
      timezone: env.DEFAULT_TIMEZONE,
      defaultCurrency: env.DEFAULT_CURRENCY,
    },
    create: {
      name: env.UNIVERSITY_NAME,
      shortName: env.UNIVERSITY_SHORT_NAME,
      domain: env.INSTITUTION_DOMAIN,
      supportEmail: env.SUPPORT_EMAIL,
      timezone: env.DEFAULT_TIMEZONE,
      defaultCurrency: env.DEFAULT_CURRENCY,
      brandingConfig: {
        primaryColor: '#14B8A6',
        inkColor: '#0B1220',
        secondLanguage: env.SECOND_LANGUAGE,
      },
      retentionPolicy: {
        auditLogYears: 7,
        softDeletedPurgeDays: 90,
      },
    },
  });

  const mainCampus = await prisma.campus.upsert({
    where: { institutionId_code: { institutionId: institution.id, code: 'MAIN' } },
    update: { name: 'Main Campus', isActive: true },
    create: {
      institutionId: institution.id,
      code: 'MAIN',
      name: 'Main Campus',
      address: 'Central Academic Precinct',
      timezone: env.DEFAULT_TIMEZONE,
    },
  });

  // 1. Seed canonical Permission catalog
  const allPerms: Array<{
    module: string;
    action: PermissionAction;
    scopeLevel: PermissionScope;
    code: string;
    description: string;
  }> = [];

  for (const mod of PERMISSION_MODULES) {
    for (const act of PERMISSION_ACTIONS) {
      for (const scp of PERMISSION_SCOPES) {
        const code = `${mod}:${act}:${scp}`;
        allPerms.push({
          module: mod,
          action: act,
          scopeLevel: scp,
          code,
          description: `${act} ${mod} at ${scp} scope`,
        });
      }
    }
  }

  await prisma.permission.createMany({
    data: allPerms,
    skipDuplicates: true,
  });

  const existingPerms = await prisma.permission.findMany({ select: { id: true, code: true } });
  const permMap = new Map<string, string>(existingPerms.map((p) => [p.code, p.id]));

  // 2. Seed all Role Templates
  const roleIdBySlug = new Map<string, string>();
  for (const tpl of ROLE_TEMPLATES) {
    const role = await prisma.role.upsert({
      where: { institutionId_slug: { institutionId: institution.id, slug: tpl.slug } },
      update: {
        name: tpl.name,
        tier: tpl.tier,
        requiresMfa: tpl.requiresMfa,
        isSystemTemplate: true,
        description: tpl.description,
      },
      create: {
        institutionId: institution.id,
        slug: tpl.slug,
        name: tpl.name,
        tier: tpl.tier,
        requiresMfa: tpl.requiresMfa,
        isSystemTemplate: true,
        description: tpl.description,
      },
    });
    roleIdBySlug.set(tpl.slug, role.id);

    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    const permRows = tpl.permissions
      .map(([m, a, s]) => permMap.get(`${m}:${a}:${s}`))
      .filter((id): id is string => Boolean(id))
      .map((permissionId) => ({ roleId: role.id, permissionId }));

    if (permRows.length > 0) {
      await prisma.rolePermission.createMany({ data: permRows, skipDuplicates: true });
    }
  }

  // 3. Seed Users (Passwords: SmartEdu#2026 for all dev demo personas)
  const devPasswordHash = await hashPassword('SmartEdu#2026');

  const seededUsers = [
    {
      email: 'zayed.chowdhury@university.edu',
      fullName: 'Zayed Chowdhury',
      mfaSecret: DEV_TOTP_SECRETS.superAdmin,
      assignments: [
        { roleSlug: 'super_admin', scopeType: 'institution' as const, campusId: null, isActing: false },
      ],
    },
    {
      email: 'tariq.mahmud@university.edu',
      fullName: 'Tariq Mahmud',
      mfaSecret: DEV_TOTP_SECRETS.admin,
      assignments: [
        { roleSlug: 'admin', scopeType: 'campus' as const, campusId: mainCampus.id, isActing: false },
      ],
    },
    {
      email: 'nusrat.jahan@university.edu',
      fullName: 'Nusrat Jahan',
      mfaSecret: DEV_TOTP_SECRETS.registrar,
      assignments: [
        { roleSlug: 'registrar', scopeType: 'campus' as const, campusId: mainCampus.id, isActing: false },
      ],
    },
    {
      email: 'dr.rahman@university.edu',
      fullName: 'Dr. Rahman',
      mfaSecret: DEV_TOTP_SECRETS.faculty,
      assignments: [
        {
          roleSlug: 'faculty',
          scopeType: 'section' as const,
          campusId: mainCampus.id,
          departmentCode: 'CSE',
          isActing: false,
        },
        {
          roleSlug: 'department_head',
          scopeType: 'department' as const,
          campusId: mainCampus.id,
          departmentCode: 'CSE',
          isActing: true,
          validTo: new Date(Date.now() + 30 * 86400_000),
        },
      ],
    },
    {
      email: 'rafiq.hasan@university.edu',
      fullName: 'Rafiq Hasan',
      mfaSecret: null,
      assignments: [
        {
          roleSlug: 'student',
          scopeType: 'own' as const,
          campusId: mainCampus.id,
          departmentCode: 'CSE',
          programCode: 'BSC-CSE',
          isActing: false,
        },
      ],
    },
    {
      email: 'kamal.hasan@university.edu',
      fullName: 'Kamal Hasan',
      mfaSecret: null,
      assignments: [
        { roleSlug: 'parent', scopeType: 'own' as const, campusId: mainCampus.id, isActing: false },
      ],
    },
  ];

  let drRahmanId: string | null = null;
  let superAdminId: string | null = null;

  for (const u of seededUsers) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        passwordHash: devPasswordHash,
        mfaEnabled: Boolean(u.mfaSecret),
        mfaSecretEncrypted: u.mfaSecret
          ? encryptSecret(u.mfaSecret, env.MFA_ENCRYPTION_KEY)
          : null,
      },
      create: {
        institutionId: institution.id,
        email: u.email,
        fullName: u.fullName,
        passwordHash: devPasswordHash,
        mfaEnabled: Boolean(u.mfaSecret),
        mfaSecretEncrypted: u.mfaSecret
          ? encryptSecret(u.mfaSecret, env.MFA_ENCRYPTION_KEY)
          : null,
        isActive: true,
      },
    });

    if (u.email === 'dr.rahman@university.edu') drRahmanId = user.id;
    if (u.email === 'zayed.chowdhury@university.edu') superAdminId = user.id;

    await prisma.userRoleAssignment.deleteMany({ where: { userId: user.id } });
    for (const a of u.assignments) {
      const roleId = roleIdBySlug.get(a.roleSlug);
      if (!roleId) continue;
      await prisma.userRoleAssignment.create({
        data: {
          userId: user.id,
          roleId,
          campusId: a.campusId,
          departmentCode: 'departmentCode' in a ? a.departmentCode : null,
          programCode: 'programCode' in a ? a.programCode : null,
          scopeType: a.scopeType,
          isActing: a.isActing,
          validFrom: a.isActing ? new Date() : null,
          validTo: 'validTo' in a ? a.validTo : null,
        },
      });
    }
  }

  // 4. Feature Flags
  const flags = [
    { key: 'realtime_ws_sync', enabled: true, description: 'Live WebSocket updates across Console and Mobile' },
    { key: 'ai_assistant_grounded', enabled: true, description: 'Ask Smart EDU policy and record assistant' },
    { key: 'geofence_attendance', enabled: false, description: 'Optional campus geofence check during QR check in' },
    { key: 'stripe_online_payments', enabled: true, description: 'In app and portal installment payments via Stripe' },
    { key: 'rtl_arabic_locale', enabled: true, description: 'Arabic RTL localization toggle' },
  ];
  for (const f of flags) {
    await prisma.featureFlag.upsert({
      where: { institutionId_key: { institutionId: institution.id, key: f.key } },
      update: { enabled: f.enabled, description: f.description },
      create: { institutionId: institution.id, key: f.key, enabled: f.enabled, description: f.description },
    });
  }

  // 5. Sample Approval Request & Audit Logs (idempotent if none exist yet)
  const existingApprovals = await prisma.approvalRequest.count({
    where: { institutionId: institution.id },
  });
  if (existingApprovals === 0 && drRahmanId) {
    await prisma.approvalRequest.create({
      data: {
        institutionId: institution.id,
        campusId: mainCampus.id,
        workflowType: 'grade_change',
        targetEntityType: 'Grade',
        targetEntityId: '00000000-0000-4000-8000-000000000101',
        requestedById: drRahmanId,
        status: 'PENDING',
        payloadSnapshot: {
          courseCode: 'CSE204',
          studentNumber: '2024 360 117',
          previousScore: 76.5,
          proposedScore: 81.0,
          reason: 'Re-evaluated midterm question 3 rubric',
        },
        steps: {
          create: [
            { stepOrder: 1, requiredRoleSlug: 'department_head', decision: 'PENDING' },
            { stepOrder: 2, requiredRoleSlug: 'exam_controller', decision: 'PENDING' },
          ],
        },
      },
    });
  }

  const existingAudits = await prisma.auditLog.count({
    where: { institutionId: institution.id },
  });
  if (existingAudits === 0 && superAdminId) {
    await prisma.auditLog.createMany({
      data: [
        {
          institutionId: institution.id,
          campusId: mainCampus.id,
          actorId: superAdminId,
          roleId: roleIdBySlug.get('super_admin')!,
          roleSlug: 'super_admin',
          scopeUsed: 'institution',
          module: 'institution_settings',
          action: 'create',
          entityType: 'Campus',
          entityId: mainCampus.id,
          afterJson: { code: 'MAIN', name: 'Main Campus' },
        },
        {
          institutionId: institution.id,
          campusId: mainCampus.id,
          actorId: superAdminId,
          roleId: roleIdBySlug.get('super_admin')!,
          roleSlug: 'super_admin',
          scopeUsed: 'institution',
          module: 'roles_permissions',
          action: 'create',
          entityType: 'UserRoleAssignment',
          entityId: drRahmanId ?? undefined,
          afterJson: {
            user: 'dr.rahman@university.edu',
            role: 'department_head',
            scope: 'department:CSE',
            isActing: true,
          },
        },
      ],
    });
  }

  // 6. Phase 3: Academic Core Seed
  await seedAcademicCore(prisma);

  console.log('Seed complete. Dev password for all seeded accounts: SmartEdu#2026');
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
