import { NextRequest, NextResponse } from 'next/server';

// Verified admin account credentials
const ADMIN_EMAIL = 'admin@university.edu';
const ADMIN_PASS = 'Admin#2026';

const MOCK_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyZjc2ZmUzNy0wYjU4LTQyMzktYmQ3Yy0zMjcwZTU4ZGRlNGEiLCJpbnN0aXR1dGlvbklkIjoiMGM4NTI1NjctMGIxYy00MGIzLWI1ZTctYmM3ZmJmZDI3ZGNlIiwiYXNzaWdubWVudElkIjoiYTdiZTIxNWItODU3Yy00NjQ2LThlY2MtNzU4MmNlMmY2NTFhIiwiZGV2aWNlSWQiOiJ2ZXJjZWwtY29uc29sZSIsImlhdCI6MTc5NDczMTE2OCwiZXhwIjoxNzk0NzMyMDY4fQ.3IgbiPjv-ptBvtxBaDnDX_dg0Zo6u23RWDwYMj0Ivyg';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vclequhmjpzxhopxuebs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_F7yCUyQW91hOcZpqVX638Q_c8pNMOAy';

async function fetchSupabaseRpc<T>(fnName: string, body?: unknown): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: body !== undefined ? JSON.stringify(body) : JSON.stringify({}),
      cache: 'no-store',
    });
    if (res.ok) {
      return (await res.json()) as T;
    }
  } catch (err) {
    console.error(`Error calling Supabase RPC ${fnName}:`, err);
  }
  return null;
}

let institutionData = {
  id: '0c852567-0b1c-40b3-b5e7-bc7fbfd27dce',
  name: 'Smart EDU Flagship University',
  shortName: 'SmartEDU',
  domain: 'university.edu',
  supportEmail: 'support@university.edu',
  defaultCurrency: 'USD',
  timezone: 'UTC',
};

const ALL_PERMISSIONS = [
  { id: 'p-1', module: 'institution_settings', action: 'view', scopeLevel: 'campus', code: 'institution_settings.view' },
  { id: 'p-2', module: 'institution_settings', action: 'edit', scopeLevel: 'campus', code: 'institution_settings.edit' },
  { id: 'p-3', module: 'roles_permissions', action: 'view', scopeLevel: 'campus', code: 'roles_permissions.view' },
  { id: 'p-4', module: 'roles_permissions', action: 'create', scopeLevel: 'campus', code: 'roles_permissions.create' },
  { id: 'p-5', module: 'roles_permissions', action: 'edit', scopeLevel: 'campus', code: 'roles_permissions.edit' },
  { id: 'p-6', module: 'roles_permissions', action: 'approve', scopeLevel: 'campus', code: 'roles_permissions.approve' },
  { id: 'p-7', module: 'roles_permissions', action: 'delete', scopeLevel: 'campus', code: 'roles_permissions.delete' },
  { id: 'p-8', module: 'academics_setup', action: 'view', scopeLevel: 'campus', code: 'academics_setup.view' },
  { id: 'p-9', module: 'academics_setup', action: 'create', scopeLevel: 'campus', code: 'academics_setup.create' },
  { id: 'p-10', module: 'academics_setup', action: 'edit', scopeLevel: 'campus', code: 'academics_setup.edit' },
  { id: 'p-11', module: 'academics_setup', action: 'approve', scopeLevel: 'campus', code: 'academics_setup.approve' },
  { id: 'p-12', module: 'student_records', action: 'view', scopeLevel: 'campus', code: 'student_records.view' },
  { id: 'p-13', module: 'student_records', action: 'create', scopeLevel: 'campus', code: 'student_records.create' },
  { id: 'p-14', module: 'student_records', action: 'edit', scopeLevel: 'campus', code: 'student_records.edit' },
  { id: 'p-15', module: 'student_records', action: 'export', scopeLevel: 'campus', code: 'student_records.export' },
  { id: 'p-16', module: 'attendance', action: 'view', scopeLevel: 'campus', code: 'attendance.view' },
  { id: 'p-17', module: 'attendance', action: 'edit', scopeLevel: 'campus', code: 'attendance.edit' },
  { id: 'p-18', module: 'attendance', action: 'export', scopeLevel: 'campus', code: 'attendance.export' },
  { id: 'p-19', module: 'grades', action: 'view', scopeLevel: 'campus', code: 'grades.view' },
  { id: 'p-20', module: 'grades', action: 'approve', scopeLevel: 'campus', code: 'grades.approve' },
  { id: 'p-21', module: 'grades', action: 'export', scopeLevel: 'campus', code: 'grades.export' },
  { id: 'p-22', module: 'finance', action: 'view', scopeLevel: 'campus', code: 'finance.view' },
  { id: 'p-23', module: 'finance', action: 'create', scopeLevel: 'campus', code: 'finance.create' },
  { id: 'p-24', module: 'finance', action: 'edit', scopeLevel: 'campus', code: 'finance.edit' },
  { id: 'p-25', module: 'finance', action: 'approve', scopeLevel: 'campus', code: 'finance.approve' },
  { id: 'p-26', module: 'finance', action: 'export', scopeLevel: 'campus', code: 'finance.export' },
  { id: 'p-27', module: 'communication', action: 'view', scopeLevel: 'campus', code: 'communication.view' },
  { id: 'p-28', module: 'communication', action: 'create', scopeLevel: 'campus', code: 'communication.create' },
  { id: 'p-29', module: 'reports_analytics', action: 'view', scopeLevel: 'campus', code: 'reports_analytics.view' },
  { id: 'p-30', module: 'reports_analytics', action: 'export', scopeLevel: 'campus', code: 'reports_analytics.export' },
  { id: 'p-31', module: 'audit_log', action: 'view', scopeLevel: 'campus', code: 'audit_log.view' },
  { id: 'p-32', module: 'library', action: 'view', scopeLevel: 'campus', code: 'library.view' },
  { id: 'p-33', module: 'campus_operations', action: 'view', scopeLevel: 'campus', code: 'campus_operations.view' },
  { id: 'p-34', module: 'services', action: 'view', scopeLevel: 'campus', code: 'services.view' },
  { id: 'p-35', module: 'services', action: 'approve', scopeLevel: 'campus', code: 'services.approve' },
];

const ADMIN_ME_DATA = {
  user: {
    id: '2f76fe37-0b58-4239-bd7c-3270e58dde4a',
    email: 'admin@university.edu',
    fullName: 'System Administrator',
    preferredLocale: 'en',
    mfaEnabled: false,
    lastLoginAt: new Date().toISOString(),
  },
  institution: institutionData,
  activeContext: {
    assignmentId: 'a7be215b-857c-4646-8ecc-7582ce2f651a',
    roleId: '8b49459e-f23d-4957-8dae-2334ad37e2c1',
    roleSlug: 'admin',
    roleTier: 'ADMIN' as const,
    campusId: '1f0d7dea-d4d1-498a-bea9-9a870f723ba8',
    departmentCode: null,
    programCode: null,
    scopeType: 'institution',
    isActing: false,
    isPreview: false,
  },
  permissions: ALL_PERMISSIONS,
  assignments: [
    {
      id: 'a7be215b-857c-4646-8ecc-7582ce2f651a',
      roleId: '8b49459e-f23d-4957-8dae-2334ad37e2c1',
      roleSlug: 'admin',
      roleName: 'Admin',
      roleTier: 'ADMIN' as const,
      scopeType: 'institution',
      departmentCode: null,
      programCode: null,
      isActing: false,
      validTo: null,
      campus: {
        id: '1f0d7dea-d4d1-498a-bea9-9a870f723ba8',
        name: 'Main Campus',
        code: 'MAIN',
      },
    },
  ],
};

const campuses = [
  {
    id: '1f0d7dea-d4d1-498a-bea9-9a870f723ba8',
    name: 'Main University Campus',
    code: 'MAIN',
    city: 'Academic District',
    country: 'Global',
    timezone: 'UTC',
    address: '100 University Boulevard',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    stats: {
      departments: 14,
      programs: 28,
      rooms: 64,
      students: 647,
      staff: 82,
      departmentsCount: 14,
      degreeProgramsCount: 28,
      classroomsLabsCount: 64,
      studentsEnrolledCount: 647,
    },
  },
  {
    id: '2f0d7dea-d4d1-498a-bea9-9a870f723ba9',
    name: 'North Tech Campus',
    code: 'NORTH',
    city: 'Innovation Park',
    country: 'Global',
    timezone: 'UTC',
    address: '450 Innovation Parkway',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    stats: {
      departments: 8,
      programs: 16,
      rooms: 42,
      students: 420,
      staff: 45,
      departmentsCount: 8,
      degreeProgramsCount: 16,
      classroomsLabsCount: 42,
      studentsEnrolledCount: 420,
    },
  },
  {
    id: '3f0d7dea-d4d1-498a-bea9-9a870f723ba0',
    name: 'South Medical Campus',
    code: 'SOUTH',
    city: 'Health Sciences Complex',
    country: 'Global',
    timezone: 'UTC',
    address: '88 Healthcare Ave',
    isActive: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    stats: {
      departments: 6,
      programs: 10,
      rooms: 38,
      students: 310,
      staff: 36,
      departmentsCount: 6,
      degreeProgramsCount: 10,
      classroomsLabsCount: 38,
      studentsEnrolledCount: 310,
    },
  },
];

let pendingRegistrations: Array<Record<string, unknown>> = [];

const featureFlags = [
  { id: 'ff-1', key: 'multi_campus', enabled: true, description: 'Support multiple institutional campuses' },
  { id: 'ff-2', key: 'mfa_enforced', enabled: false, description: 'Require MFA for all administrative roles' },
  { id: 'ff-3', key: 'self_registration', enabled: true, description: 'Allow new students and faculty to apply online' },
  { id: 'ff-4', key: 'live_attendance', enabled: true, description: 'Real-time WebSocket beacon attendance' },
  { id: 'ff-5', key: 'financial_ledger', enabled: true, description: 'Integrated tuition, invoices and scholarship ledger' },
];

let activeDevices = [
  { id: 'dev-1', platform: 'Web Browser', deviceName: 'Chrome on Windows 11', lastSeenAt: new Date().toISOString() },
  { id: 'dev-2', platform: 'Android App', deviceName: 'Smart EDU Flutter APK v0.1.0', lastSeenAt: new Date(Date.now() - 3600000).toISOString() },
];

const rolesList = [
  {
    id: '8b49459e-f23d-4957-8dae-2334ad37e2c1',
    slug: 'admin',
    name: 'Admin',
    tier: 'ADMIN',
    isSystemTemplate: true,
    description: 'System Administrator with full access to institutional operations, security, and audits',
    permissions: ALL_PERMISSIONS.map((p) => ({ permission: p })),
    _count: { assignments: 1 },
  },
  {
    id: '7b49459e-f23d-4957-8dae-2334ad37e2c2',
    slug: 'faculty',
    name: 'Faculty',
    tier: 'FACULTY',
    isSystemTemplate: true,
    description: 'Teaching and academic research faculty member',
    permissions: ALL_PERMISSIONS.filter((p) => ['academics_setup', 'attendance', 'grades'].includes(p.module)).map((p) => ({ permission: p })),
    _count: { assignments: 48 },
  },
  {
    id: '6b49459e-f23d-4957-8dae-2334ad37e2c3',
    slug: 'student',
    name: 'Student',
    tier: 'STUDENT',
    isSystemTemplate: true,
    description: 'Enrolled university student',
    permissions: ALL_PERMISSIONS.filter((p) => p.action === 'view').map((p) => ({ permission: p })),
    _count: { assignments: 647 },
  },
];

interface UserAssignment {
  id: string;
  scopeType: string;
  departmentCode: string | null;
  programCode: string | null;
  isActing: boolean;
  validTo: string | null;
  user: { id: string; fullName: string; email: string; mfaEnabled: boolean };
  role: { id: string; slug: string; name: string; tier: string };
  campus: { id: string; code: string; name: string } | null;
}

let userRoleAssignments: UserAssignment[] = [
  {
    id: 'a7be215b-857c-4646-8ecc-7582ce2f651a',
    scopeType: 'institution',
    departmentCode: null,
    programCode: null,
    isActing: false,
    validTo: null,
    user: { id: '2f76fe37-0b58-4239-bd7c-3270e58dde4a', fullName: 'System Administrator', email: 'admin@university.edu', mfaEnabled: false },
    role: { id: '8b49459e-f23d-4957-8dae-2334ad37e2c1', slug: 'admin', name: 'Admin', tier: 'ADMIN' },
    campus: { id: '1f0d7dea-d4d1-498a-bea9-9a870f723ba8', code: 'MAIN', name: 'Main Campus' },
  },
];

let rbacApprovals: Array<Record<string, unknown>> = [];

// ----------------- POST Handler -----------------
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const subpath = path.join('/');

  try {
    const body = await req.json().catch(() => ({}));

    // /api/v1/auth/login
    if (subpath === 'auth/login') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (email === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASS) {
        return NextResponse.json({
          status: 'AUTHENTICATED',
          accessToken: MOCK_TOKEN,
          refreshToken: 'refresh-' + Date.now(),
          expiresIn: '15m',
          deviceId: 'web-console',
          activeRole: {
            assignmentId: 'a7be215b-857c-4646-8ecc-7582ce2f651a',
            roleId: '8b49459e-f23d-4957-8dae-2334ad37e2c1',
            slug: 'admin',
            name: 'Admin',
            tier: 'ADMIN',
            scopeType: 'institution',
          },
        });
      }

      if (email === 'tariq.mahmud@university.edu' && password === 'SmartEdu#2026') {
        return NextResponse.json({
          status: 'AUTHENTICATED',
          accessToken: MOCK_TOKEN,
          refreshToken: 'refresh-' + Date.now(),
          expiresIn: '15m',
          deviceId: 'web-console',
          activeRole: {
            assignmentId: 'b7be215b-857c-4646-8ecc-7582ce2f651b',
            roleId: '7b49459e-f23d-4957-8dae-2334ad37e2c2',
            slug: 'faculty',
            name: 'Faculty',
            tier: 'FACULTY',
            scopeType: 'department',
          },
        });
      }

      // Check if user is an approved student/user from Supabase
      const userCheck = await fetchSupabaseRpc<{ found: boolean; id: string; fullName: string; email: string; isActive: boolean }>('get_user_for_login', { p_email: email });
      if (userCheck && userCheck.found && userCheck.isActive) {
        return NextResponse.json({
          status: 'AUTHENTICATED',
          accessToken: MOCK_TOKEN,
          refreshToken: 'refresh-' + Date.now(),
          expiresIn: '15m',
          deviceId: 'client-device',
          activeRole: {
            assignmentId: 'asgn-' + userCheck.id,
            roleId: '6b49459e-f23d-4957-8dae-2334ad37e2c3',
            slug: 'student',
            name: userCheck.fullName || 'Student',
            tier: 'STUDENT',
            scopeType: 'campus',
          },
        });
      }

      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 },
      );
    }

    // /api/v1/auth/register
    if (subpath === 'auth/register') {
      const fullName = String(body.fullName || 'New Applicant').trim();
      const email = String(body.email || 'applicant@university.edu').trim().toLowerCase();
      const roleSlug = String(body.roleSlug || 'student');
      const departmentCode = String(body.departmentCode || 'CSE');

      await fetchSupabaseRpc('create_registration_request', {
        p_full_name: fullName,
        p_email: email,
        p_role_slug: roleSlug,
        p_department_code: departmentCode,
      });

      const newReg = {
        id: 'reg-' + Date.now(),
        userId: 'usr-' + Date.now(),
        fullName,
        email,
        roleName: roleSlug.toUpperCase(),
        roleSlug,
        departmentCode,
        status: 'PENDING',
        submittedAt: new Date().toISOString(),
      };
      pendingRegistrations.unshift(newReg);

      return NextResponse.json({
        status: 'PENDING_APPROVAL',
        message: 'Account registration submitted. Pending administrator approval.',
        userId: newReg.userId,
        email: newReg.email,
        fullName: newReg.fullName,
        role: newReg.roleSlug,
      });
    }

    // /api/v1/auth/approve-registration/:id
    if (subpath.startsWith('auth/approve-registration/')) {
      const id = subpath.replace('auth/approve-registration/', '');
      await fetchSupabaseRpc('approve_registration', { request_id: id });
      pendingRegistrations = pendingRegistrations.filter((r) => r.id !== id && r.userId !== id);
      return NextResponse.json({ success: true, message: `Registration ${id} approved successfully` });
    }

    // /api/v1/auth/reject-registration/:id
    if (subpath.startsWith('auth/reject-registration/')) {
      const id = subpath.replace('auth/reject-registration/', '');
      await fetchSupabaseRpc('reject_registration', { request_id: id });
      pendingRegistrations = pendingRegistrations.filter((r) => r.id !== id && r.userId !== id);
      return NextResponse.json({ success: true, message: `Registration ${id} rejected` });
    }

    // /api/v1/operations/campuses
    if (subpath === 'operations/campuses') {
      const newCampus = {
        id: 'camp-' + Date.now(),
        code: String(body.code || 'NEW'),
        name: String(body.name || 'New Campus'),
        city: String(body.city || 'Academic District'),
        country: String(body.country || 'Global'),
        address: String(body.address || 'University Campus'),
        timezone: String(body.timezone || 'UTC'),
        isActive: true,
        createdAt: new Date().toISOString(),
        stats: {
          departments: 0,
          programs: 0,
          rooms: 0,
          students: 0,
          staff: 0,
          departmentsCount: 0,
          degreeProgramsCount: 0,
          classroomsLabsCount: 0,
          studentsEnrolledCount: 0,
        },
      };
      campuses.push(newCampus);
      return NextResponse.json(newCampus);
    }

    // /api/v1/rbac/roles or /api/v1/roles
    if (subpath === 'rbac/roles' || subpath === 'roles') {
      const newRole = {
        id: 'role-' + Date.now(),
        slug: String(body.slug || 'custom-role'),
        name: String(body.name || 'Custom Role'),
        tier: String(body.tier || 'FACULTY'),
        isSystemTemplate: false,
        description: body.description || null,
        permissions: (body.permissionIds || []).map((pid: string) => ({
          permission: ALL_PERMISSIONS.find((p) => p.id === pid) || { id: pid, module: 'general', action: 'view', scopeLevel: 'campus', code: pid },
        })),
        _count: { assignments: 0 },
      };
      rolesList.push(newRole);
      return NextResponse.json(newRole);
    }

    // /api/v1/rbac/assign-role or /api/v1/user-roles
    if (subpath === 'rbac/assign-role' || subpath === 'user-roles') {
      const selectedCampus = campuses.find((c) => c.id === body.campusId) || campuses[0];
      const matchedRole = rolesList.find((r) => r.id === body.roleId);
      const assignment: UserAssignment = {
        id: 'asgn-' + Date.now(),
        scopeType: body.scopeType || 'campus',
        departmentCode: body.departmentCode || null,
        programCode: body.programCode || null,
        isActing: false,
        validTo: body.validTo || null,
        user: { id: body.userId, fullName: 'Assigned User', email: 'user@university.edu', mfaEnabled: false },
        role: {
          id: matchedRole ? matchedRole.id : String(body.roleId),
          slug: matchedRole ? matchedRole.slug : 'assigned',
          name: matchedRole ? matchedRole.name : 'Assigned',
          tier: matchedRole ? matchedRole.tier : 'STAFF',
        },
        campus: selectedCampus ? { id: selectedCampus.id, code: selectedCampus.code, name: selectedCampus.name } : null,
      };
      userRoleAssignments.push(assignment);
      return NextResponse.json(assignment);
    }

    // /api/v1/rbac/approvals/:id/decide or /api/v1/approvals/:id/decide
    if (
      (subpath.startsWith('rbac/approvals/') || subpath.startsWith('approvals/')) &&
      subpath.endsWith('/decide')
    ) {
      const parts = subpath.split('/');
      const id = parts[parts.length - 2];
      rbacApprovals = rbacApprovals.filter((a) => a.id !== id);
      return NextResponse.json({ success: true, message: 'Decision recorded' });
    }

    // /api/v1/auth/switch-role
    if (subpath === 'auth/switch-role') {
      return NextResponse.json({ accessToken: MOCK_TOKEN });
    }

    // /api/v1/auth/preview-role
    if (subpath === 'auth/preview-role') {
      return NextResponse.json({ accessToken: MOCK_TOKEN });
    }

    // /api/v1/auth/exit-preview
    if (subpath === 'auth/exit-preview') {
      return NextResponse.json({ accessToken: MOCK_TOKEN });
    }

    // /api/v1/auth/logout
    if (subpath === 'auth/logout') {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, message: 'Processed' });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}

// ----------------- GET Handler -----------------
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const subpath = path.join('/');

  // /api/v1/auth/me
  if (subpath === 'auth/me') {
    return NextResponse.json(ADMIN_ME_DATA);
  }

  // /api/v1/admin/dashboard-summary or /api/v1/dashboard/summary
  if (subpath === 'admin/dashboard-summary' || subpath === 'dashboard/summary') {
    const remote = await fetchSupabaseRpc<Array<Record<string, unknown>>>('get_pending_registrations');
    const pendingCount = remote && Array.isArray(remote) ? remote.length : pendingRegistrations.length;

    return NextResponse.json({
      roleTier: 'ADMIN',
      roleSlug: 'admin',
      scopeType: 'institution',
      realtimeClients: 14,
      kpis: {
        campuses: campuses.length,
        usersCount: 648,
        pendingApprovals: pendingCount,
        enabledFeatures: featureFlags.filter((f) => f.enabled).length,
      },
      recentActivity: [
        {
          id: 'act-1',
          title: 'System Administrator session authenticated',
          roleSlug: 'admin',
          module: 'auth',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'act-2',
          title: 'Connected to Supabase PostgreSQL database',
          roleSlug: 'admin',
          module: 'database',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: 'act-3',
          title: 'Institutional infrastructure synchronized across campuses',
          roleSlug: 'admin',
          module: 'campuses',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    });
  }

  // /api/v1/auth/pending-registrations
  if (subpath === 'auth/pending-registrations') {
    const remote = await fetchSupabaseRpc<Array<Record<string, unknown>>>('get_pending_registrations');
    if (remote && Array.isArray(remote) && remote.length > 0) {
      return NextResponse.json(remote);
    }
    return NextResponse.json(pendingRegistrations);
  }

  // /api/v1/operations/campuses or /api/v1/campuses
  if (subpath === 'operations/campuses' || subpath === 'campuses') {
    return NextResponse.json(campuses);
  }

  // /api/v1/admin/institution or /api/v1/institutions/current
  if (subpath === 'admin/institution' || subpath === 'institutions/current') {
    return NextResponse.json(institutionData);
  }

  // /api/v1/admin/feature-flags or /api/v1/feature-flags
  if (subpath === 'admin/feature-flags' || subpath === 'feature-flags') {
    return NextResponse.json(featureFlags);
  }

  // /api/v1/auth/devices
  if (subpath === 'auth/devices') {
    return NextResponse.json(activeDevices);
  }

  // /api/v1/rbac/roles or /api/v1/roles
  if (subpath === 'rbac/roles' || subpath === 'roles') {
    return NextResponse.json(rolesList);
  }

  // /api/v1/rbac/permissions or /api/v1/permissions
  if (subpath === 'rbac/permissions' || subpath === 'permissions') {
    return NextResponse.json(ALL_PERMISSIONS);
  }

  // /api/v1/rbac/user-roles or /api/v1/user-roles
  if (subpath === 'rbac/user-roles' || subpath === 'user-roles') {
    return NextResponse.json(userRoleAssignments);
  }

  // /api/v1/rbac/users or /api/v1/users/directory
  if (subpath === 'rbac/users' || subpath === 'users/directory') {
    return NextResponse.json([
      { id: '2f76fe37-0b58-4239-bd7c-3270e58dde4a', fullName: 'System Administrator', email: 'admin@university.edu' },
      { id: 'usr-101', fullName: 'Dr. Sarah Connor', email: 's.connor@university.edu' },
      { id: 'usr-102', fullName: 'Alex Vance', email: 'alex.vance@university.edu' },
    ]);
  }

  // /api/v1/rbac/approvals or /api/v1/approvals
  if (subpath === 'rbac/approvals' || subpath === 'approvals') {
    return NextResponse.json(rbacApprovals);
  }

  // /api/v1/audit-logs/export.csv
  if (subpath === 'audit-logs/export.csv') {
    const csvContent =
      'id,timestamp,action,actor,role,module,ip,device\n' +
      `log-1,${new Date().toISOString()},LOGIN,System Administrator,admin,auth,Vercel Edge,Web Console\n` +
      `log-2,${new Date(Date.now() - 3600000).toISOString()},SYNC_DB,System Administrator,admin,database,192.168.50.87,Backend\n`;
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="smart-edu-audit-logs.csv"',
      },
    });
  }

  // /api/v1/audit-logs
  if (subpath.startsWith('audit-logs')) {
    return NextResponse.json({
      items: [
        {
          id: 'log-1',
          roleSlug: 'admin',
          scopeUsed: 'institution',
          module: 'auth',
          action: 'LOGIN',
          entityType: 'User',
          entityId: '2f76fe37-0b58-4239-bd7c-3270e58dde4a',
          description: 'System Administrator authenticated via Web Console',
          ipAddress: 'Vercel Edge',
          userAgent: 'Mozilla/5.0 Web Console',
          createdAt: new Date().toISOString(),
          actor: { id: '2f76fe37-0b58-4239-bd7c-3270e58dde4a', fullName: 'System Administrator', email: 'admin@university.edu' },
        },
        {
          id: 'log-2',
          roleSlug: 'admin',
          scopeUsed: 'institution',
          module: 'operations',
          action: 'CAMPUS_SYNC',
          entityType: 'Campus',
          entityId: '1f0d7dea-d4d1-498a-bea9-9a870f723ba8',
          description: 'Institutional database synchronized with PostgreSQL',
          ipAddress: '192.168.50.87',
          userAgent: 'Smart EDU Backend',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          actor: { id: '2f76fe37-0b58-4239-bd7c-3270e58dde4a', fullName: 'System Administrator', email: 'admin@university.edu' },
        },
      ],
      meta: {
        page: 1,
        limit: 15,
        total: 2,
        totalPages: 1,
      },
    });
  }

  return NextResponse.json({ success: true, path: subpath });
}

// ----------------- PATCH Handler -----------------
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const subpath = path.join('/');

  try {
    const body = await req.json().catch(() => ({}));

    // /api/v1/admin/institution or /api/v1/institutions/current
    if (subpath === 'admin/institution' || subpath === 'institutions/current') {
      institutionData = { ...institutionData, ...body };
      return NextResponse.json(institutionData);
    }

    // /api/v1/admin/feature-flags/:key or /api/v1/feature-flags/:key
    if (subpath.startsWith('admin/feature-flags/') || subpath.startsWith('feature-flags/')) {
      const key = subpath.replace('admin/feature-flags/', '').replace('feature-flags/', '');
      const flag = featureFlags.find((f) => f.key === key);
      if (flag) {
        flag.enabled = Boolean(body.enabled);
      }
      return NextResponse.json(flag || { key, enabled: body.enabled });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 },
    );
  }
}

// ----------------- DELETE Handler -----------------
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const subpath = path.join('/');

  // /api/v1/auth/devices/:id
  if (subpath.startsWith('auth/devices/')) {
    const id = subpath.replace('auth/devices/', '');
    activeDevices = activeDevices.filter((d) => d.id !== id);
    return NextResponse.json({ success: true });
  }

  // /api/v1/rbac/assignments/:id or /api/v1/user-roles/:id
  if (subpath.startsWith('rbac/assignments/') || subpath.startsWith('user-roles/')) {
    const id = subpath.replace('rbac/assignments/', '').replace('user-roles/', '');
    userRoleAssignments = userRoleAssignments.filter((a) => a.id !== id);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true });
}
