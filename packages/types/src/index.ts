export const ROLE_TIERS = [
  'SUPER_ADMIN',
  'ADMIN',
  'SUB_ADMIN',
  'FACULTY',
  'STUDENT',
  'PARENT',
] as const;

export type RoleTier = (typeof ROLE_TIERS)[number];

export const STAFF_ROLE_TIERS: readonly RoleTier[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'SUB_ADMIN',
  'FACULTY',
];

export const PERMISSION_MODULES = [
  'institution_settings',
  'roles_permissions',
  'academics_setup',
  'student_records',
  'attendance',
  'grades',
  'finance',
  'communication',
  'reports_analytics',
  'audit_log',
  'library',
  'campus_operations',
  'services',
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const PERMISSION_ACTIONS = [
  'view',
  'create',
  'edit',
  'approve',
  'export',
  'delete',
] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

export const PERMISSION_SCOPES = [
  'own',
  'section',
  'department',
  'program',
  'campus',
  'institution',
] as const;

export type PermissionScope = (typeof PERMISSION_SCOPES)[number];

export const DOMAIN_EVENT_NAMES = [
  'attendance.marked',
  'grade.published',
  'notice.sent',
  'invoice.paid',
  'request.updated',
  'class.rescheduled',
] as const;

export type DomainEventName = (typeof DOMAIN_EVENT_NAMES)[number];

export interface DomainEventEnvelope<T = Record<string, unknown>> {
  id: string;
  event: DomainEventName;
  version: 1;
  institutionId: string;
  campusId?: string | null;
  occurredAt: string;
  payload: T;
}

export const SCOPE_RANK: Record<PermissionScope, number> = {
  own: 1,
  section: 2,
  department: 3,
  program: 4,
  campus: 5,
  institution: 6,
};

export function isStaffTier(tier: RoleTier): boolean {
  return STAFF_ROLE_TIERS.includes(tier);
}
