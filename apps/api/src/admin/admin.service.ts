import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import type { AuthContext } from '../common/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import { EventBusService } from '../realtime/event-bus.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import type { CreateCampusDto, ToggleFeatureFlagDto, UpdateInstitutionDto } from './admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly eventBus: EventBusService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async getCurrentInstitution(auth: AuthContext) {
    return this.prisma.institution.findUnique({
      where: { id: auth.institutionId },
    });
  }

  async updateCurrentInstitution(auth: AuthContext, dto: UpdateInstitutionDto) {
    if (auth.roleTier !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super admin can change institution settings');
    }
    const before = await this.prisma.institution.findUnique({
      where: { id: auth.institutionId },
    });
    const updated = await this.prisma.institution.update({
      where: { id: auth.institutionId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.shortName !== undefined ? { shortName: dto.shortName } : {}),
        ...(dto.supportEmail !== undefined ? { supportEmail: dto.supportEmail } : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
        ...(dto.defaultCurrency !== undefined ? { defaultCurrency: dto.defaultCurrency } : {}),
      },
    });
    await this.auditService.logFromAuth(auth, {
      module: 'institution_settings',
      action: 'edit',
      entityType: 'Institution',
      entityId: updated.id,
      beforeJson: before,
      afterJson: updated,
    });
    return updated;
  }

  async listCampuses(auth: AuthContext) {
    return this.prisma.campus.findMany({
      where: {
        institutionId: auth.institutionId,
        deletedAt: null,
        ...(auth.roleTier === 'SUPER_ADMIN' || !auth.campusId ? {} : { id: auth.campusId }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async createCampus(auth: AuthContext, dto: CreateCampusDto) {
    if (auth.roleTier !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super admin can create campuses');
    }
    const created = await this.prisma.campus.create({
      data: {
        institutionId: auth.institutionId,
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        address: dto.address?.trim() ?? null,
        timezone: dto.timezone ?? 'UTC',
      },
    });
    await this.auditService.logFromAuth(auth, {
      module: 'institution_settings',
      action: 'create',
      entityType: 'Campus',
      entityId: created.id,
      afterJson: created,
    });
    return created;
  }

  async listFeatureFlags(auth: AuthContext) {
    return this.prisma.featureFlag.findMany({
      where: { institutionId: auth.institutionId },
      orderBy: { key: 'asc' },
    });
  }

  async toggleFeatureFlag(auth: AuthContext, key: string, dto: ToggleFeatureFlagDto) {
    if (auth.roleTier !== 'SUPER_ADMIN' && auth.roleTier !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can toggle feature flags');
    }
    const flag = await this.prisma.featureFlag.findFirst({
      where: { institutionId: auth.institutionId, key },
    });
    if (!flag) throw new NotFoundException('Feature flag not found');

    const updated = await this.prisma.featureFlag.update({
      where: { id: flag.id },
      data: { enabled: dto.enabled },
    });
    await this.auditService.logFromAuth(auth, {
      module: 'institution_settings',
      action: 'edit',
      entityType: 'FeatureFlag',
      entityId: updated.id,
      beforeJson: { key: flag.key, enabled: flag.enabled },
      afterJson: { key: updated.key, enabled: updated.enabled },
    });
    return updated;
  }

  async getSystemHealth(auth: AuthContext) {
    await this.prisma.$queryRaw`SELECT 1`;
    const [totalUsers, activeDevices, recentAudits, pendingApprovals] = await Promise.all([
      this.prisma.user.count({ where: { institutionId: auth.institutionId, deletedAt: null } }),
      this.prisma.device.count({ where: { revokedAt: null, user: { institutionId: auth.institutionId } } }),
      this.prisma.auditLog.count({ where: { institutionId: auth.institutionId } }),
      this.prisma.approvalRequest.count({
        where: { institutionId: auth.institutionId, status: 'PENDING' },
      }),
    ]);

    return {
      status: 'healthy',
      database: 'connected',
      realtimeBus: this.eventBus.isRedisReady() ? 'redis_pubsub' : 'local_dev_bus',
      connectedWebSockets: this.realtimeGateway.getConnectedCount(),
      uptimeSeconds: Math.floor(process.uptime()),
      counts: {
        totalUsers,
        activeDevices,
        recentAudits,
        pendingApprovals,
      },
    };
  }

  async getDashboardSummary(auth: AuthContext) {
    const [campuses, usersCount, approvalsCount, recentAuditLogs, activeFlags] =
      await Promise.all([
        this.prisma.campus.count({
          where: { institutionId: auth.institutionId, deletedAt: null },
        }),
        this.prisma.user.count({
          where: { institutionId: auth.institutionId, deletedAt: null },
        }),
        this.prisma.approvalRequest.count({
          where: { institutionId: auth.institutionId, status: 'PENDING' },
        }),
        this.prisma.auditLog.findMany({
          where: { institutionId: auth.institutionId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { actor: { select: { fullName: true } } },
        }),
        this.prisma.featureFlag.count({
          where: { institutionId: auth.institutionId, enabled: true },
        }),
      ]);

    return {
      roleTier: auth.roleTier,
      roleSlug: auth.roleSlug,
      scopeType: auth.scopeType,
      realtimeClients: this.realtimeGateway.getConnectedCount(),
      kpis: {
        campuses,
        usersCount,
        pendingApprovals: approvalsCount,
        enabledFeatures: activeFlags,
      },
      recentActivity: recentAuditLogs.map((log) => ({
        id: log.id,
        title: `${log.actor?.fullName ?? 'System'} performed ${log.action} on ${log.entityType}`,
        roleSlug: log.roleSlug,
        module: log.module,
        createdAt: log.createdAt,
      })),
    };
  }
}
