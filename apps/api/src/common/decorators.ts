import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import type { PermissionAction, PermissionModule, PermissionScope } from '@smart-edu/types';
import type { AuthenticatedRequest, AuthContext } from './auth.types';

export const IS_PUBLIC_KEY = 'smartedu:isPublic';
export const REQUIRE_PERMISSION_KEY = 'smartedu:requirePermission';
export const ALLOW_IN_PREVIEW_KEY = 'smartedu:allowInPreview';

export interface PermissionRequirement {
  module: PermissionModule;
  action: PermissionAction;
  minScope?: PermissionScope;
}

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const AllowInPreview = () => SetMetadata(ALLOW_IN_PREVIEW_KEY, true);

export const RequirePermission = (
  module: PermissionModule,
  action: PermissionAction,
  minScope?: PermissionScope,
) => SetMetadata(REQUIRE_PERMISSION_KEY, { module, action, minScope } satisfies PermissionRequirement);

export const CurrentAuth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthContext => {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    return req.auth;
  },
);
