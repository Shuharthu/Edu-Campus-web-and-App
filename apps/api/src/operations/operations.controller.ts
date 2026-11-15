import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth, RequirePermission } from '../common/decorators';
import {
  AllocateHostelDto,
  CreateMaintenanceTicketDto,
  UpdateMaintenanceTicketDto,
} from './dto/operations.dto';
import { OperationsService } from './operations.service';

@Controller('operations')
export class OperationsController {
  constructor(private readonly operationsService: OperationsService) {}

  @Get('stats')
  async getStats(@CurrentAuth() auth: AuthContext) {
    return this.operationsService.getOperationsStats(auth.institutionId);
  }

  @Get('hostel/rooms')
  async getHostelRooms(@CurrentAuth() auth: AuthContext) {
    return this.operationsService.getHostelRooms(auth.institutionId);
  }

  @Get('hostel/my-allocation')
  async getMyHostelAllocation(
    @CurrentAuth() auth: AuthContext,
    @Query('studentId') studentId?: string,
  ) {
    const targetStudentId = studentId || auth.userId;
    return this.operationsService.getStudentHostelAllocation(targetStudentId);
  }

  @Post('hostel/allocate')
  async allocateHostel(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: AllocateHostelDto,
  ) {
    return this.operationsService.allocateHostel(auth.institutionId, dto, auth);
  }

  @Get('transport/routes')
  async getTransportRoutes(@CurrentAuth() auth: AuthContext) {
    return this.operationsService.getTransportRoutes(auth.institutionId);
  }

  @Get('maintenance/tickets')
  async getMaintenanceTickets(
    @CurrentAuth() auth: AuthContext,
    @Query('status') status?: string,
  ) {
    return this.operationsService.getMaintenanceTickets(auth.institutionId, status);
  }

  @Post('maintenance/tickets')
  async createMaintenanceTicket(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: CreateMaintenanceTicketDto,
  ) {
    return this.operationsService.createMaintenanceTicket(auth.institutionId, dto, auth);
  }

  @Patch('maintenance/tickets/:id')
  async updateMaintenanceTicket(
    @CurrentAuth() auth: AuthContext,
    @Param('id') ticketId: string,
    @Body() dto: UpdateMaintenanceTicketDto,
  ) {
    return this.operationsService.updateMaintenanceTicket(auth.institutionId, ticketId, dto, auth);
  }

  @Get('campuses')
  async getCampuses(@CurrentAuth() auth: AuthContext) {
    return this.operationsService.getCampuses(auth.institutionId);
  }

  @Post('campuses')
  async createCampus(
    @CurrentAuth() auth: AuthContext,
    @Body() body: { code: string; name: string; address?: string; timezone?: string },
  ) {
    return this.operationsService.createCampus(auth.institutionId, body, auth);
  }

  @Patch('campuses/:id')
  async updateCampus(
    @CurrentAuth() auth: AuthContext,
    @Param('id') id: string,
    @Body() body: { name?: string; address?: string; timezone?: string; isActive?: boolean },
  ) {
    return this.operationsService.updateCampus(id, body, auth);
  }
}
