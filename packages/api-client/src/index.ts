// AUTO-GENERATED FROM apps/api/openapi.json — DO NOT EDIT DIRECTLY
/* eslint-disable */

export interface LoginDto {
  email: string;
  password: string;
  platform?: string;
  deviceName?: string;
}

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  roleSlug?: string;
  studentNumber?: string;
  departmentCode?: string;
  platform?: string;
  deviceName?: string;
}

export interface VerifyMfaDto {
  mfaToken: string;
  code: string;
  platform?: string;
  deviceName?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface SwitchRoleDto {
  assignmentId: string;
}

export interface PreviewRoleDto {
  roleId: string;
}

export interface CreateRoleDto {
  slug: string;
  name: string;
  tier?: string;
  description?: string;
  permissionIds: Array<string>;
}

export interface UpdateRolePermissionsDto {
  permissionIds: Array<string>;
}

export interface AssignUserRoleDto {
  userId: string;
  roleId: string;
  campusId?: string;
  departmentCode?: string;
  programCode?: string;
  scopeType: "own" | "section" | "department" | "program" | "campus" | "institution";
  isActing?: boolean;
  validFrom?: string;
  validTo?: string;
}

export interface DecideApprovalDto {
  decision: "APPROVED" | "REJECTED";
  comment?: string;
}

export interface UpdateInstitutionDto {
  name?: string;
  shortName?: string;
  supportEmail?: string;
  timezone?: string;
  defaultCurrency?: string;
}

export interface CreateCampusDto {
  code: string;
  name: string;
  address?: string;
  timezone?: string;
}

export interface ToggleFeatureFlagDto {
  enabled: boolean;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly payload?: unknown,
  ) {
    super(message);
  }
}

export interface ApiClientConfig {
  baseUrl: string;
  getToken?: () => string | null;
}

export class SmartEduApiClient {
  constructor(private readonly config: ApiClientConfig) {}

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const cleanPath = path.startsWith('/api/v1') ? path.slice(7) : path;
    const url = `${this.config.baseUrl.replace(/\/$/, '')}${cleanPath}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.config.getToken?.();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const contentType = res.headers.get('content-type') ?? '';
    const data = contentType.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) {
      const msg =
        typeof data === 'object' && data !== null && 'message' in data
          ? String((data as { message: unknown }).message)
          : `Request failed with status ${res.status}`;
      throw new ApiError(res.status, msg, data);
    }
    return data as T;
  }

  async auditList<T = unknown>(query?: Record<string, string | number | undefined>): Promise<T> {
    const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : '';
    return this.request<T>('GET', `${'/api/v1/audit-logs'}${qs}`);
  }

  async auditExportCsv<T = unknown>(query?: Record<string, string | number | undefined>): Promise<T> {
    const qs = query ? '?' + new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString() : '';
    return this.request<T>('GET', `${'/api/v1/audit-logs/export.csv'}${qs}`);
  }

  async authLogin<T = unknown>(body: LoginDto): Promise<T> {
    return this.request<T>('POST', '/api/v1/auth/login', body);
  }

  async authRegister<T = unknown>(body: RegisterDto): Promise<T> {
    return this.request<T>('POST', '/api/v1/auth/register', body);
  }

  async authVerifyMfa<T = unknown>(body: VerifyMfaDto): Promise<T> {
    return this.request<T>('POST', '/api/v1/auth/mfa/verify', body);
  }

  async authRefresh<T = unknown>(body: RefreshTokenDto): Promise<T> {
    return this.request<T>('POST', '/api/v1/auth/refresh', body);
  }

  async authGetSsoUrl<T = unknown>(provider: string): Promise<T> {
    return this.request<T>('GET', `/api/v1/auth/sso/${encodeURIComponent(provider)}/url`);
  }

  async authLogout<T = unknown>(): Promise<T> {
    return this.request<T>('POST', '/api/v1/auth/logout');
  }

  async authSwitchRole<T = unknown>(body: SwitchRoleDto): Promise<T> {
    return this.request<T>('POST', '/api/v1/auth/switch-role', body);
  }

  async authPreviewRole<T = unknown>(body: PreviewRoleDto): Promise<T> {
    return this.request<T>('POST', '/api/v1/auth/preview-role', body);
  }

  async authExitPreview<T = unknown>(): Promise<T> {
    return this.request<T>('POST', '/api/v1/auth/exit-preview');
  }

  async authMe<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/auth/me');
  }

  async authDevices<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/auth/devices');
  }

  async authRevokeDevice<T = unknown>(id: string): Promise<T> {
    return this.request<T>('DELETE', `/api/v1/auth/devices/${encodeURIComponent(id)}`);
  }

  async rbacListRoles<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/roles');
  }

  async rbacCreateRole<T = unknown>(body: CreateRoleDto): Promise<T> {
    return this.request<T>('POST', '/api/v1/roles', body);
  }

  async rbacListPermissions<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/permissions');
  }

  async rbacUpdateRolePermissions<T = unknown>(id: string, body: UpdateRolePermissionsDto): Promise<T> {
    return this.request<T>('PUT', `/api/v1/roles/${encodeURIComponent(id)}/permissions`, body);
  }

  async rbacListUserRoles<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/user-roles');
  }

  async rbacAssignUserRole<T = unknown>(body: AssignUserRoleDto): Promise<T> {
    return this.request<T>('POST', '/api/v1/user-roles', body);
  }

  async rbacListUsers<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/users/directory');
  }

  async rbacRevokeAssignment<T = unknown>(id: string): Promise<T> {
    return this.request<T>('DELETE', `/api/v1/user-roles/${encodeURIComponent(id)}`);
  }

  async rbacListApprovals<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/approvals');
  }

  async rbacDecideApproval<T = unknown>(id: string, body: DecideApprovalDto): Promise<T> {
    return this.request<T>('POST', `/api/v1/approvals/${encodeURIComponent(id)}/decide`, body);
  }

  async adminGetInstitution<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/institutions/current');
  }

  async adminUpdateInstitution<T = unknown>(body: UpdateInstitutionDto): Promise<T> {
    return this.request<T>('PATCH', '/api/v1/institutions/current', body);
  }

  async adminListCampuses<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/campuses');
  }

  async adminCreateCampus<T = unknown>(body: CreateCampusDto): Promise<T> {
    return this.request<T>('POST', '/api/v1/campuses', body);
  }

  async adminListFlags<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/feature-flags');
  }

  async adminToggleFlag<T = unknown>(key: string, body: ToggleFeatureFlagDto): Promise<T> {
    return this.request<T>('PATCH', `/api/v1/feature-flags/${encodeURIComponent(key)}`, body);
  }

  async adminGetSystemHealth<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/system/health');
  }

  async adminGetDashboardSummary<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/dashboard/summary');
  }

  async healthLive<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/health');
  }

  async healthReady<T = unknown>(): Promise<T> {
    return this.request<T>('GET', '/api/v1/health/ready');
  }
}
