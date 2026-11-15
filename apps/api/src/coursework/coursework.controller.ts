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
  CreateAssignmentDto,
  CreateMaterialDto,
  GradeSubmissionDto,
  SubmitAssignmentDto,
} from './coursework.dto';
import { CourseworkService } from './coursework.service';

@ApiTags('Coursework & Materials')
@ApiBearerAuth()
@Controller('coursework')
export class CourseworkController {
  constructor(private readonly courseworkService: CourseworkService) {}

  @Get('materials')
  @RequirePermission('academics_setup', 'view')
  @ApiOperation({ summary: 'Get course materials for a course/section' })
  async getMaterials(
    @Query('courseId') courseId: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.courseworkService.getMaterials(courseId, sectionId);
  }

  @Post('materials')
  @RequirePermission('academics_setup', 'create')
  @ApiOperation({ summary: 'Upload or publish course material' })
  async createMaterial(
    @Body() dto: CreateMaterialDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.courseworkService.createMaterial(dto, auth);
  }

  @Get('assignments')
  @RequirePermission('academics_setup', 'view')
  @ApiOperation({ summary: 'Get assignments and submissions for a section' })
  async getAssignments(
    @Query('sectionId') sectionId: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.courseworkService.getAssignments(sectionId, studentId);
  }

  @Post('assignments')
  @RequirePermission('academics_setup', 'create')
  @ApiOperation({ summary: 'Create assignment for a section' })
  async createAssignment(
    @Body() dto: CreateAssignmentDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.courseworkService.createAssignment(dto, auth);
  }

  @Post('assignments/submit')
  @RequirePermission('academics_setup', 'edit')
  @ApiOperation({ summary: 'Student submission for an assignment' })
  async submitAssignment(
    @Body() dto: SubmitAssignmentDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.courseworkService.submitAssignment(dto, auth);
  }

  @Patch('submissions/:id/grade')
  @RequirePermission('academics_setup', 'edit')
  @ApiOperation({ summary: 'Grade a student submission' })
  async gradeSubmission(
    @Param('id') id: string,
    @Body() dto: GradeSubmissionDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.courseworkService.gradeSubmission(id, dto, auth);
  }
}
