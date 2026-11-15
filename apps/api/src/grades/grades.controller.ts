import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth, RequirePermission } from '../common/decorators';
import {
  ApproveModerationDto,
  CreateAssessmentDto,
  EnterScoreDto,
  PublishGradesDto,
  SubmitModerationDto,
} from './grades.dto';
import { GradesService } from './grades.service';

@ApiTags('Grades & Moderation')
@ApiBearerAuth()
@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get('sheet')
  @RequirePermission('grades', 'view')
  @ApiOperation({ summary: 'Get section grade sheet, assessment breakdown and distribution curve' })
  async getGradeSheet(@Query('sectionId') sectionId: string) {
    return this.gradesService.getSectionGradeSheet(sectionId);
  }

  @Post('assessments')
  @RequirePermission('grades', 'create')
  @ApiOperation({ summary: 'Create assessment (quiz, assignment, midterm, final) for a section' })
  async createAssessment(
    @Body() dto: CreateAssessmentDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.gradesService.createAssessment(dto, auth);
  }

  @Post('scores')
  @RequirePermission('grades', 'edit')
  @ApiOperation({ summary: 'Enter or update assessment score for a student' })
  async enterScore(
    @Body() dto: EnterScoreDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.gradesService.enterScore(dto, auth);
  }

  @Post('moderation/submit')
  @RequirePermission('grades', 'edit')
  @ApiOperation({ summary: 'Submit section grades for departmental moderation review' })
  async submitModeration(
    @Body() dto: SubmitModerationDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.gradesService.submitModeration(dto, auth);
  }

  @Post('moderation/approve')
  @RequirePermission('grades', 'approve')
  @ApiOperation({ summary: 'Dean/Head approval of moderated grade sheet' })
  async approveModeration(
    @Body() dto: ApproveModerationDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.gradesService.approveModeration(dto, auth);
  }

  @Post('publish')
  @RequirePermission('grades', 'approve')
  @ApiOperation({ summary: 'Publish final grade sheet, lock grades and compute semester GPA/CGPA' })
  async publishGrades(
    @Body() dto: PublishGradesDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.gradesService.publishGrades(dto, auth);
  }

  @Get('student-results')
  @RequirePermission('grades', 'view')
  @ApiOperation({ summary: 'Get student academic scorecard, CGPA, credits and exam eligibility' })
  async getStudentResults(
    @Query('studentId') studentId: string,
    @CurrentAuth() auth: AuthContext,
  ) {
    const targetStudentId = studentId || auth.userId;
    return this.gradesService.getStudentResults(targetStudentId);
  }
}
