import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';

function makeContext(method: string, auth: Record<string, unknown>) {
  return {
    getHandler: () => () => undefined,
    getClass: () => class {},
    switchToHttp: () => ({
      getRequest: () => ({ method, auth }),
    }),
  } as never;
}

describe('PermissionsGuard', () => {
  it('blocks mutations during View-as-role preview mode', () => {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) => {
        if (key === 'smartedu:isPublic') return false;
        if (key === 'smartedu:allowInPreview') return false;
        return undefined;
      }),
    } as unknown as Reflector;

    const guard = new PermissionsGuard(reflector);
    const ctx = makeContext('POST', {
      roleTier: 'FACULTY',
      isPreview: true,
      permissions: [{ module: 'roles_permissions', action: 'create', scopeLevel: 'campus' }],
    });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('enforces module, action, and scope rank', () => {
    const reflector = {
      getAllAndOverride: jest.fn((key: string) => {
        if (key === 'smartedu:isPublic') return false;
        if (key === 'smartedu:allowInPreview') return false;
        if (key === 'smartedu:requirePermission') {
          return { module: 'institution_settings', action: 'edit', minScope: 'institution' };
        }
        return undefined;
      }),
    } as unknown as Reflector;

    const guard = new PermissionsGuard(reflector);
    const campusAdminCtx = makeContext('PATCH', {
      roleTier: 'ADMIN',
      isPreview: false,
      permissions: [{ module: 'institution_settings', action: 'edit', scopeLevel: 'campus' }],
    });

    expect(() => guard.canActivate(campusAdminCtx)).toThrow(ForbiddenException);

    const superAdminCtx = makeContext('PATCH', {
      roleTier: 'SUPER_ADMIN',
      isPreview: false,
      permissions: [],
    });
    expect(guard.canActivate(superAdminCtx)).toBe(true);
  });
});
