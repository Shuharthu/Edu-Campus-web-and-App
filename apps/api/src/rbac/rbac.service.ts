import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import type { AuthContext } from '../common/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AssignUserRoleDto,
  CreateRoleDto,
  DecideApprovalDto,
  UpdateRolePermissionsDto,
} from './rbac.dto';

@Injectable()
export class RbacService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async listRoles(auth: AuthContext) {
    return this.prisma.role.findMany({
      where: { institutionId: auth.institutionId, deletedAt: null },
      orderBy: [{ isSystemTemplate: 'desc' }, { name: 'asc' }],
      include: {
        permissions: {
          include: { permission: true },
        },
        _count: { select: { assignments: { where: { isActive: true, deletedAt: null } } } },
      },
    });
  }

  async listPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }, { scopeLevel: 'asc' }],
    });
  }

  async createRole(auth: AuthContext, dto: CreateRoleDto) {
    const slug = dto.slug
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_');

    const tier = dto.tier ?? 'SUB_ADMIN';
    if (auth.roleTier === 'ADMIN' && tier !== 'SUB_ADMIN') {
      throw new ForbiddenException('Admins can only create Sub-admin roles');
    }

    const exists = await this.prisma.role.findFirst({
      where: { institutionId: auth.institutionId, slug, deletedAt: null },
    });
    if (exists) {
      throw new BadRequestException(`Role slug "${slug}" already exists`);
    }

    const created = await this.prisma.role.create({
      data: {
        institutionId: auth.institutionId,
        slug,
        name: dto.name.trim(),
        tier,
        isSystemTemplate: false,
        requiresMfa: true,
        description: dto.description?.trim(),
        permissions: {
          create: dto.permissionIds.map((permissionId) => ({ permissionId })),
        },
      },
      include: {
        permissions: { include: { permission: true } },
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'roles_permissions',
      action: 'create',
      entityType: 'Role',
      entityId: created.id,
      afterJson: { slug: created.slug, name: created.name, permissionCount: dto.permissionIds.length },
    });

    return created;
  }

  async updateRolePermissions(
    auth: AuthContext,
    roleId: string,
    dto: UpdateRolePermissionsDto,
  ) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, institutionId: auth.institutionId, deletedAt: null },
      include: { permissions: true },
    });
    if (!role) throw new NotFoundException('Role not found');
    if (role.tier === 'SUPER_ADMIN' && auth.roleTier !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super admin can modify Super admin permissions');
    }
    if (auth.roleTier === 'ADMIN' && role.tier !== 'SUB_ADMIN') {
      throw new ForbiddenException('Admins can only modify Sub-admin roles');
    }

    const beforeIds = role.permissions.map((p) => p.permissionId);

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId: role.id } }),
      this.prisma.rolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })),
      }),
    ]);

    await this.auditService.logFromAuth(auth, {
      module: 'roles_permissions',
      action: 'edit',
      entityType: 'Role',
      entityId: role.id,
      beforeJson: { permissionIds: beforeIds },
      afterJson: { permissionIds: dto.permissionIds },
    });

    return this.prisma.role.findUnique({
      where: { id: role.id },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async listStaffAssignments(auth: AuthContext) {
    const campusFilter = auth.roleTier === 'SUPER_ADMIN' ? undefined : auth.campusId ?? undefined;
    return this.prisma.userRoleAssignment.findMany({
      where: {
        deletedAt: null,
        user: { institutionId: auth.institutionId, deletedAt: null },
        ...(campusFilter ? { OR: [{ campusId: campusFilter }, { campusId: null }] } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true, mfaEnabled: true } },
        role: { select: { id: true, slug: true, name: true, tier: true } },
        campus: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async listUsersDirectory(auth: AuthContext) {
    return this.prisma.user.findMany({
      where: { institutionId: auth.institutionId, deletedAt: null },
      orderBy: { fullName: 'asc' },
      select: { id: true, fullName: true, email: true, mfaEnabled: true, isActive: true },
    });
  }

  async assignUserRole(auth: AuthContext, dto: AssignUserRoleDto) {
    const [targetUser, targetRole] = await Promise.all([
      this.prisma.user.findFirst({
        where: { id: dto.userId, institutionId: auth.institutionId, deletedAt: null },
      }),
      this.prisma.role.findFirst({
        where: { id: dto.roleId, institutionId: auth.institutionId, deletedAt: null },
      }),
    ]);

    if (!targetUser) throw new NotFoundException('User not found');
    if (!targetRole) throw new NotFoundException('Role not found');

    if (auth.roleTier === 'ADMIN' && targetRole.tier !== 'SUB_ADMIN' && targetRole.tier !== 'FACULTY') {
      throw new ForbiddenException('Admins can only assign Sub-admin or Faculty roles');
    }

    const created = await this.prisma.userRoleAssignment.create({
      data: {
        userId: targetUser.id,
        roleId: targetRole.id,
        campusId: dto.campusId ?? auth.campusId,
        departmentCode: dto.departmentCode ?? null,
        programCode: dto.programCode ?? null,
        scopeType: dto.scopeType,
        isActing: dto.isActing ?? false,
        delegatedById: dto.isActing ? auth.userId : null,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : null,
        validTo: dto.validTo ? new Date(dto.validTo) : null,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        role: { select: { id: true, slug: true, name: true, tier: true } },
        campus: { select: { id: true, code: true, name: true } },
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'roles_permissions',
      action: 'create',
      entityType: 'UserRoleAssignment',
      entityId: created.id,
      afterJson: {
        userId: created.userId,
        roleSlug: targetRole.slug,
        scopeType: created.scopeType,
        departmentCode: created.departmentCode,
        isActing: created.isActing,
        validTo: created.validTo,
      },
    });

    return created;
  }

  async revokeAssignment(auth: AuthContext, assignmentId: string) {
    const existing = await this.prisma.userRoleAssignment.findFirst({
      where: {
        id: assignmentId,
        deletedAt: null,
        user: { institutionId: auth.institutionId },
      },
      include: { role: true },
    });
    if (!existing) throw new NotFoundException('Role assignment not found');
    if (existing.role.tier === 'SUPER_ADMIN' && auth.roleTier !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super admin can revoke a Super admin assignment');
    }

    await this.prisma.userRoleAssignment.update({
      where: { id: existing.id },
      data: { isActive: false, deletedAt: new Date() },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'roles_permissions',
      action: 'delete',
      entityType: 'UserRoleAssignment',
      entityId: existing.id,
      beforeJson: { userId: existing.userId, roleSlug: existing.role.slug, scopeType: existing.scopeType },
    });

    return { ok: true };
  }

  async listApprovals(auth: AuthContext) {
    return this.prisma.approvalRequest.findMany({
      where: {
        institutionId: auth.institutionId,
        ...(auth.roleTier === 'SUPER_ADMIN' || !auth.campusId ? {} : { campusId: auth.campusId }),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        requestedBy: { select: { id: true, fullName: true, email: true } },
        steps: {
          orderBy: { stepOrder: 'asc' },
          include: { actor: { select: { id: true, fullName: true } } },
        },
      },
    });
  }

  async decideApproval(auth: AuthContext, approvalId: string, dto: DecideApprovalDto) {
    const approval = await this.prisma.approvalRequest.findFirst({
      where: { id: approvalId, institutionId: auth.institutionId },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
    if (!approval) throw new NotFoundException('Approval request not found');
    if (approval.status !== 'PENDING') {
      throw new BadRequestException('Approval request is already finalized');
    }

    const nextStep = approval.steps.find((s) => s.decision === 'PENDING');
    if (!nextStep) {
      throw new BadRequestException('No pending approval step remains');
    }

    if (
      auth.roleTier !== 'SUPER_ADMIN' &&
      auth.roleTier !== 'ADMIN' &&
      nextStep.requiredRoleSlug !== auth.roleSlug
    ) {
      throw new ForbiddenException(`Step requires role "${nextStep.requiredRoleSlug}"`);
    }

    const allDoneApproved =
      dto.decision === 'APPROVED' &&
      approval.steps.filter((s) => s.id !== nextStep.id).every((s) => s.decision === 'APPROVED');

    const nextOverallStatus =
      dto.decision === 'REJECTED'
        ? 'REJECTED'
        : allDoneApproved
          ? 'APPROVED'
          : 'PENDING';

    await this.prisma.$transaction([
      this.prisma.approvalStep.update({
        where: { id: nextStep.id },
        data: {
          decision: dto.decision,
          actorId: auth.userId,
          comment: dto.comment ?? null,
          decidedAt: new Date(),
        },
      }),
      this.prisma.approvalRequest.update({
        where: { id: approval.id },
        data: { status: nextOverallStatus },
      }),
    ]);

    await this.auditService.logFromAuth(auth, {
      module: 'roles_permissions',
      action: 'approve',
      entityType: 'ApprovalRequest',
      entityId: approval.id,
      beforeJson: { status: approval.status, stepOrder: nextStep.stepOrder },
      afterJson: { status: nextOverallStatus, decision: dto.decision, comment: dto.comment },
    });

    return this.prisma.approvalRequest.findUnique({
      where: { id: approval.id },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
  }
}
