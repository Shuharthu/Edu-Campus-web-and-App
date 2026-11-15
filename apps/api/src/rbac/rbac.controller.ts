import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth, RequirePermission } from '../common/decorators';
import {
  AssignUserRoleDto,
  CreateRoleDto,
  DecideApprovalDto,
  UpdateRolePermissionsDto,
} from './rbac.dto';
import { RbacService } from './rbac.service';

@ApiTags('Roles & Permissions')
@ApiBearerAuth()
@Controller()
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  @RequirePermission('roles_permissions', 'view')
  @ApiOperation({ summary: 'List all institution role templates and custom roles' })
  listRoles(@CurrentAuth() auth: AuthContext) {
    return this.rbacService.listRoles(auth);
  }

  @Get('permissions')
  @RequirePermission('roles_permissions', 'view')
  @ApiOperation({ summary: 'List canonical module x action x scope permission catalog' })
  listPermissions() {
    return this.rbacService.listPermissions();
  }

  @Post('roles')
  @RequirePermission('roles_permissions', 'create')
  @ApiOperation({ summary: 'Create a custom Sub-admin role template' })
  createRole(@CurrentAuth() auth: AuthContext, @Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(auth, dto);
  }

  @Put('roles/:id/permissions')
  @RequirePermission('roles_permissions', 'edit')
  @ApiOperation({ summary: 'Update permission set for a role' })
  updateRolePermissions(
    @CurrentAuth() auth: AuthContext,
    @Param('id') id: string,
    @Body() dto: UpdateRolePermissionsDto,
  ) {
    return this.rbacService.updateRolePermissions(auth, id, dto);
  }

  @Get('user-roles')
  @RequirePermission('roles_permissions', 'view')
  @ApiOperation({ summary: 'List scoped role assignments and acting delegations' })
  listUserRoles(@CurrentAuth() auth: AuthContext) {
    return this.rbacService.listStaffAssignments(auth);
  }

  @Get('users/directory')
  @RequirePermission('roles_permissions', 'view')
  @ApiOperation({ summary: 'List institution accounts for role assignment' })
  listUsers(@CurrentAuth() auth: AuthContext) {
    return this.rbacService.listUsersDirectory(auth);
  }

  @Post('user-roles')
  @RequirePermission('roles_permissions', 'create')
  @ApiOperation({ summary: 'Assign a scoped role or time-limited acting delegation' })
  assignUserRole(@CurrentAuth() auth: AuthContext, @Body() dto: AssignUserRoleDto) {
    return this.rbacService.assignUserRole(auth, dto);
  }

  @Delete('user-roles/:id')
  @RequirePermission('roles_permissions', 'delete')
  @ApiOperation({ summary: 'Revoke a role assignment' })
  revokeAssignment(@CurrentAuth() auth: AuthContext, @Param('id') id: string) {
    return this.rbacService.revokeAssignment(auth, id);
  }

  @Get('approvals')
  @RequirePermission('roles_permissions', 'view')
  @ApiOperation({ summary: 'List pending and historical multi-step approvals' })
  listApprovals(@CurrentAuth() auth: AuthContext) {
    return this.rbacService.listApprovals(auth);
  }

  @Post('approvals/:id/decide')
  @RequirePermission('roles_permissions', 'approve')
  @ApiOperation({ summary: 'Approve or reject current step of an approval chain' })
  decideApproval(
    @CurrentAuth() auth: AuthContext,
    @Param('id') id: string,
    @Body() dto: DecideApprovalDto,
  ) {
    return this.rbacService.decideApproval(auth, id, dto);
  }
}
