import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentAuth, RequirePermission } from '../common/decorators';
import type { AuthContext } from '../common/auth.types';
import { AuditService } from './audit.service';

@ApiTags('Audit Log')
@ApiBearerAuth()
@Controller('audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @RequirePermission('audit_log', 'view')
  @ApiOperation({ summary: 'List paginated immutable audit log entries' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'module', required: false, type: String })
  @ApiQuery({ name: 'action', required: false, type: String })
  @ApiQuery({ name: 'q', required: false, type: String })
  async list(
    @CurrentAuth() auth: AuthContext,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('q') q?: string,
  ) {
    const page = Math.max(1, Number(pageRaw) || 1);
    const limit = Math.min(100, Math.max(1, Number(limitRaw) || 20));
    const campusFilter = auth.roleTier === 'SUPER_ADMIN' ? undefined : auth.campusId;

    return this.auditService.list({
      institutionId: auth.institutionId,
      campusId: campusFilter,
      module: module || undefined,
      action: action || undefined,
      q: q || undefined,
      page,
      limit,
    });
  }

  @Get('export.csv')
  @RequirePermission('audit_log', 'view')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="audit-logs.csv"')
  @ApiOperation({ summary: 'Export filtered audit logs as CSV' })
  async exportCsv(
    @CurrentAuth() auth: AuthContext,
    @Query('module') module?: string,
    @Query('action') action?: string,
    @Query('q') q?: string,
  ): Promise<string> {
    const campusFilter = auth.roleTier === 'SUPER_ADMIN' ? undefined : auth.campusId;
    const { items } = await this.auditService.list({
      institutionId: auth.institutionId,
      campusId: campusFilter,
      module: module || undefined,
      action: action || undefined,
      q: q || undefined,
      page: 1,
      limit: 500,
    });

    const escapeCsv = (val: unknown) => {
      const s = String(val ?? '');
      return `"${s.replace(/"/g, '""')}"`;
    };

    const header = [
      'id',
      'createdAt',
      'actorName',
      'actorEmail',
      'roleSlug',
      'scopeUsed',
      'module',
      'action',
      'entityType',
      'entityId',
    ].join(',');

    const rows = items.map((row) =>
      [
        row.id,
        row.createdAt.toISOString(),
        row.actor?.fullName ?? 'System',
        row.actor?.email ?? '',
        row.roleSlug,
        row.scopeUsed,
        row.module,
        row.action,
        row.entityType,
        row.entityId ?? '',
      ]
        .map(escapeCsv)
        .join(','),
    );

    await this.auditService.logFromAuth(auth, {
      module: 'audit_log',
      action: 'export',
      entityType: 'AuditLog',
      afterJson: { exportedRows: rows.length },
    });

    return [header, ...rows].join('\n');
  }
}
