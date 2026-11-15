import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth, RequirePermission } from '../common/decorators';
import { FacultyService } from './faculty.service';

@ApiTags('Faculty Directory & Workload')
@ApiBearerAuth()
@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Get()
  @RequirePermission('academics_setup', 'view')
  @ApiOperation({ summary: 'List faculty members with departments and teaching load' })
  listFaculty(
    @CurrentAuth() auth: AuthContext,
    @Query('campusId') campusId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const targetCampusId = campusId || auth.campusId;
    if (!targetCampusId) throw new Error('Campus ID required');
    return this.facultyService.listFaculty(targetCampusId, departmentId);
  }

  @Get(':id/schedule')
  @RequirePermission('academics_setup', 'view')
  @ApiOperation({ summary: 'Get teaching timetable schedule for a faculty member' })
  getSchedule(@Param('id') facultyMemberId: string) {
    return this.facultyService.getFacultySchedule(facultyMemberId);
  }
}
