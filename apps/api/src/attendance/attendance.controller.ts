import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth, RequirePermission } from '../common/decorators';
import {
  AttendanceCheckInDto,
  AttendanceCorrectionDto,
  CreateAttendanceSessionDto,
  DecideCorrectionDto,
} from './attendance.dto';
import { AttendanceService } from './attendance.service';

@ApiTags('Attendance')
@ApiBearerAuth()
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('sessions')
  @RequirePermission('attendance', 'create')
  @ApiOperation({ summary: 'Launch a live attendance session with rotating QR & 6-digit short code' })
  async createSession(
    @Body() dto: CreateAttendanceSessionDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.attendanceService.createSession(dto, auth);
  }

  @Get('sessions/active')
  @RequirePermission('attendance', 'view')
  @ApiOperation({ summary: 'Get current active attendance session for a class section' })
  async getActiveSession(@Query('sectionId') sectionId: string) {
    return this.attendanceService.getActiveSession(sectionId);
  }

  @Post('check-in')
  @RequirePermission('attendance', 'edit')
  @ApiOperation({ summary: 'Student check-in via rotating QR token or 6-digit short code' })
  async checkIn(
    @Body() dto: AttendanceCheckInDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.attendanceService.checkIn(dto, auth);
  }

  @Post('sessions/:id/close')
  @RequirePermission('attendance', 'edit')
  @ApiOperation({ summary: 'End and lock attendance session, marking remaining students absent' })
  async closeSession(
    @Param('id') sessionId: string,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.attendanceService.closeSession(sessionId, auth);
  }

  @Get('defaulters')
  @RequirePermission('attendance', 'view')
  @ApiOperation({ summary: 'List students below minimum attendance threshold (<75%)' })
  async getDefaulters(
    @Query('threshold') threshold?: number,
    @CurrentAuth() auth?: AuthContext,
  ) {
    return this.attendanceService.getDefaulters(
      threshold ? Number(threshold) : 75,
      auth?.campusId ?? undefined,
    );
  }

  @Post('corrections')
  @RequirePermission('attendance', 'edit')
  @ApiOperation({ summary: 'Submit manual attendance adjustment request' })
  async submitCorrection(
    @Body() dto: AttendanceCorrectionDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.attendanceService.submitCorrection(dto, auth);
  }

  @Patch('corrections/:id/decide')
  @RequirePermission('attendance', 'approve')
  @ApiOperation({ summary: 'Approve or reject attendance correction' })
  async decideCorrection(
    @Param('id') id: string,
    @Body() dto: DecideCorrectionDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.attendanceService.decideCorrection(id, dto, auth);
  }
}
