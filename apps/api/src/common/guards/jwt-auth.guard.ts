import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type {
  PermissionAction,
  PermissionModule,
  PermissionScope,
  RoleTier,
} from '@smart-edu/types';
import { getEnv } from '../../config/env';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedRequest, EffectivePermission } from '../auth.types';
import { IS_PUBLIC_KEY } from '../decorators';

interface AccessTokenPayload {
  sub: string;
  institutionId: string;
  assignmentId: string;
  deviceId: string;
  isPreview?: boolean;
  previewRoleId?: string;
  previewFromAssignmentId?: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    const token = authHeader.slice(7).trim();
    const env = getEnv();

    let payload: AccessTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<AccessTokenPayload>(token, {
        secret: env.JWT_ACCESS_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }

    const device = await this.prisma.device.findFirst({
      where: { id: payload.deviceId, userId: payload.sub, revokedAt: null },
      select: { id: true },
    });
    if (!device) {
      throw new UnauthorizedException('Device session has been revoked');
    }

    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, isActive: true, deletedAt: null },
      select: { id: true, institutionId: true, email: true, fullName: true },
    });
    if (!user) {
      throw new UnauthorizedException('User account unavailable');
    }

    const now = new Date();
    const assignment = await this.prisma.userRoleAssignment.findFirst({
      where: {
        id: payload.assignmentId,
        userId: user.id,
        isActive: true,
        deletedAt: null,
        OR: [{ validFrom: null }, { validFrom: { lte: now } }],
        AND: [{ OR: [{ validTo: null }, { validTo: { gte: now } }] }],
      },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!assignment || assignment.role.deletedAt) {
      throw new UnauthorizedException('Active role assignment expired or unavailable');
    }

    let activeRole = assignment.role;
    let isPreview = false;
    if (payload.isPreview && payload.previewRoleId) {
      if (assignment.role.tier !== 'SUPER_ADMIN' && assignment.role.tier !== 'ADMIN') {
        throw new UnauthorizedException('Preview role requires administrator privileges');
      }
      const targetRole = await this.prisma.role.findFirst({
        where: {
          id: payload.previewRoleId,
          institutionId: user.institutionId,
          deletedAt: null,
        },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });
      if (!targetRole) {
        throw new UnauthorizedException('Preview role no longer exists');
      }
      activeRole = targetRole;
      isPreview = true;
    }

    const permissions: EffectivePermission[] = activeRole.permissions.map((rp) => ({
      module: rp.permission.module as PermissionModule,
      action: rp.permission.action as PermissionAction,
      scopeLevel: rp.permission.scopeLevel as PermissionScope,
    }));

    req.auth = {
      userId: user.id,
      institutionId: user.institutionId,
      email: user.email,
      fullName: user.fullName,
      activeRoleAssignmentId: assignment.id,
      roleId: activeRole.id,
      roleSlug: activeRole.slug,
      roleTier: activeRole.tier as RoleTier,
      campusId: assignment.campusId,
      departmentCode: assignment.departmentCode,
      programCode: assignment.programCode,
      scopeType: assignment.scopeType as PermissionScope,
      isActing: assignment.isActing,
      isPreview,
      previewFromAssignmentId: payload.previewFromAssignmentId,
      deviceId: device.id,
      permissions,
    };

    return true;
  }
}
