import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth, RequirePermission } from '../common/decorators';
import { CreateCampusDto, ToggleFeatureFlagDto, UpdateInstitutionDto } from './admin.dto';
import { AdminService } from './admin.service';

@ApiTags('Administration & Dashboard')
@ApiBearerAuth()
@Controller()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('institutions/current')
  @RequirePermission('institution_settings', 'view')
  @ApiOperation({ summary: 'Get active institution metadata and placeholders' })
  getInstitution(@CurrentAuth() auth: AuthContext) {
    return this.adminService.getCurrentInstitution(auth);
  }

  @Patch('institutions/current')
  @RequirePermission('institution_settings', 'edit', 'institution')
  @ApiOperation({ summary: 'Update institution settings (Super admin only)' })
  updateInstitution(@CurrentAuth() auth: AuthContext, @Body() dto: UpdateInstitutionDto) {
    return this.adminService.updateCurrentInstitution(auth, dto);
  }

  @Get('campuses')
  @RequirePermission('institution_settings', 'view')
  @ApiOperation({ summary: 'List campuses visible to current role scope' })
  listCampuses(@CurrentAuth() auth: AuthContext) {
    return this.adminService.listCampuses(auth);
  }

  @Post('campuses')
  @RequirePermission('institution_settings', 'create', 'institution')
  @ApiOperation({ summary: 'Create a new campus (Super admin only)' })
  createCampus(@CurrentAuth() auth: AuthContext, @Body() dto: CreateCampusDto) {
    return this.adminService.createCampus(auth, dto);
  }

  @Get('feature-flags')
  @RequirePermission('institution_settings', 'view')
  @ApiOperation({ summary: 'List feature flags for current institution' })
  listFlags(@CurrentAuth() auth: AuthContext) {
    return this.adminService.listFeatureFlags(auth);
  }

  @Patch('feature-flags/:key')
  @RequirePermission('institution_settings', 'edit')
  @ApiOperation({ summary: 'Toggle a feature flag' })
  toggleFlag(
    @CurrentAuth() auth: AuthContext,
    @Param('key') key: string,
    @Body() dto: ToggleFeatureFlagDto,
  ) {
    return this.adminService.toggleFeatureFlag(auth, key, dto);
  }

  @Get('system/health')
  @RequirePermission('audit_log', 'view')
  @ApiOperation({ summary: 'Inspect database, realtime bus, and service health' })
  getSystemHealth(@CurrentAuth() auth: AuthContext) {
    return this.adminService.getSystemHealth(auth);
  }

  @Get('dashboard/summary')
  @ApiOperation({ summary: 'Get role-aware Phase 2 dashboard summary and activity feed' })
  getDashboardSummary(@CurrentAuth() auth: AuthContext) {
    return this.adminService.getDashboardSummary(auth);
  }
}
