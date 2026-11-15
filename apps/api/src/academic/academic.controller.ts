import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth, RequirePermission } from '../common/decorators';
import { AcademicService } from './academic.service';
import { ClashCheckQueryDto, CreateTimetableSlotDto } from './dto/timetable.dto';

@ApiTags('Academic Core & Timetable')
@ApiBearerAuth()
@Controller('academics')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  @Get('catalog')
  @RequirePermission('academics_setup', 'view')
  @ApiOperation({ summary: 'Get complete academic catalog hierarchy and rooms' })
  getCatalog(@CurrentAuth() auth: AuthContext, @Query('campusId') campusId?: string) {
    const targetCampusId = campusId || auth.campusId;
    if (!targetCampusId) {
      throw new Error('Campus ID required');
    }
    return this.academicService.getCatalog(targetCampusId);
  }

  @Get('timetable')
  @RequirePermission('academics_setup', 'view')
  @ApiOperation({ summary: 'List timetable slots with clash metadata' })
  getTimetable(
    @CurrentAuth() auth: AuthContext,
    @Query('campusId') campusId?: string,
    @Query('semesterId') semesterId?: string,
    @Query('departmentId') departmentId?: string,
  ) {
    const targetCampusId = campusId || auth.campusId;
    if (!targetCampusId) throw new Error('Campus ID required');
    return this.academicService.getTimetableSlots(targetCampusId, semesterId, departmentId);
  }

  @Get('timetable/clashes')
  @RequirePermission('academics_setup', 'view')
  @ApiOperation({ summary: 'Run live clash detector engine across timetable slots' })
  getClashes(@CurrentAuth() auth: AuthContext, @Query() query: ClashCheckQueryDto) {
    const targetCampusId = query.campusId || auth.campusId;
    if (!targetCampusId) throw new Error('Campus ID required');
    return this.academicService.checkClashes(targetCampusId, query.semesterId);
  }

  @Post('timetable/slots')
  @RequirePermission('academics_setup', 'create')
  @ApiOperation({ summary: 'Add a new timetable slot' })
  createSlot(@Body() dto: CreateTimetableSlotDto) {
    return this.academicService.createSlot(dto);
  }

  @Post('timetable/publish')
  @RequirePermission('academics_setup', 'edit')
  @ApiOperation({ summary: 'Publish timetable and emit realtime sync event' })
  publishTimetable(
    @CurrentAuth() auth: AuthContext,
    @Body('campusId') campusId?: string,
    @Body('semesterId') semesterId?: string,
  ) {
    const targetCampusId = campusId || auth.campusId;
    if (!targetCampusId) throw new Error('Campus ID required');
    return this.academicService.publishTimetable(targetCampusId, semesterId);
  }
}
