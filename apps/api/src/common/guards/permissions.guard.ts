import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPE_RANK } from '@smart-edu/types';
import type { AuthenticatedRequest } from '../auth.types';
import {
  ALLOW_IN_PREVIEW_KEY,
  IS_PUBLIC_KEY,
  PermissionRequirement,
  REQUIRE_PERMISSION_KEY,
} from '../decorators';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const auth = req.auth;
    if (!auth) {
      throw new ForbiddenException('Missing security context');
    }

    const allowInPreview = this.reflector.getAllAndOverride<boolean>(ALLOW_IN_PREVIEW_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (
      auth.isPreview &&
      !allowInPreview &&
      req.method !== 'GET' &&
      req.method !== 'HEAD'
    ) {
      throw new ForbiddenException('Preview mode is read only');
    }

    const required = this.reflector.getAllAndOverride<PermissionRequirement | undefined>(
      REQUIRE_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    if (auth.roleTier === 'SUPER_ADMIN') {
      return true;
    }

    const match = auth.permissions.find(
      (p) => p.module === required.module && p.action === required.action,
    );
    if (!match) {
      throw new ForbiddenException(
        `Missing permission ${required.module}:${required.action}`,
      );
    }

    if (required.minScope) {
      const grantedRank = SCOPE_RANK[match.scopeLevel] ?? 0;
      const neededRank = SCOPE_RANK[required.minScope] ?? 0;
      if (grantedRank < neededRank) {
        throw new ForbiddenException(
          `Insufficient scope for ${required.module}:${required.action}`,
        );
      }
    }

    return true;
  }
}
