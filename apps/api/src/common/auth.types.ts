import type {
  PermissionAction,
  PermissionModule,
  PermissionScope,
  RoleTier,
} from '@smart-edu/types';
import type { Request } from 'express';

export interface EffectivePermission {
  module: PermissionModule;
  action: PermissionAction;
  scopeLevel: PermissionScope;
}

export interface AuthContext {
  userId: string;
  institutionId: string;
  email: string;
  fullName: string;
  activeRoleAssignmentId: string;
  roleId: string;
  roleSlug: string;
  roleTier: RoleTier;
  campusId: string | null;
  departmentCode: string | null;
  programCode: string | null;
  scopeType: PermissionScope;
  isActing: boolean;
  isPreview: boolean;
  previewFromAssignmentId?: string;
  deviceId: string;
  permissions: EffectivePermission[];
}

export interface AuthenticatedRequest extends Request {
  auth: AuthContext;
}
