import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthContext } from '../common/auth.types';

export interface WriteAuditInput {
  institutionId: string;
  campusId?: string | null;
  actorId?: string | null;
  roleId?: string | null;
  roleSlug: string;
  scopeUsed: string;
  module: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeJson?: unknown;
  afterJson?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: WriteAuditInput): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        institutionId: input.institutionId,
        campusId: input.campusId ?? null,
        actorId: input.actorId ?? null,
        roleId: input.roleId ?? null,
        roleSlug: input.roleSlug,
        scopeUsed: input.scopeUsed,
        module: input.module,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        beforeJson: (input.beforeJson as Prisma.InputJsonValue | undefined) ?? undefined,
        afterJson: (input.afterJson as Prisma.InputJsonValue | undefined) ?? undefined,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
      },
    });
  }

  async logFromAuth(
    auth: AuthContext,
    params: Omit<
      WriteAuditInput,
      'institutionId' | 'campusId' | 'actorId' | 'roleId' | 'roleSlug' | 'scopeUsed'
    >,
  ): Promise<void> {
    await this.log({
      institutionId: auth.institutionId,
      campusId: auth.campusId,
      actorId: auth.userId,
      roleId: auth.roleId,
      roleSlug: auth.roleSlug,
      scopeUsed: auth.scopeType,
      ...params,
    });
  }

  async list(params: {
    institutionId: string;
    campusId?: string | null;
    module?: string;
    action?: string;
    q?: string;
    page: number;
    limit: number;
  }) {
    const where: Prisma.AuditLogWhereInput = {
      institutionId: params.institutionId,
      ...(params.campusId ? { campusId: params.campusId } : {}),
      ...(params.module ? { module: params.module } : {}),
      ...(params.action ? { action: params.action } : {}),
      ...(params.q
        ? {
            OR: [
              { roleSlug: { contains: params.q, mode: 'insensitive' } },
              { entityType: { contains: params.q, mode: 'insensitive' } },
              { module: { contains: params.q, mode: 'insensitive' } },
              { actor: { fullName: { contains: params.q, mode: 'insensitive' } } },
              { actor: { email: { contains: params.q, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          actor: { select: { id: true, fullName: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / params.limit)),
      },
    };
  }
}
