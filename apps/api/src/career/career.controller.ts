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
  ApplyJobDto,
  CreateJobPostingDto,
  UpdateApplicationStatusDto,
} from './dto/career.dto';
import { CareerService } from './career.service';

@Controller('career')
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @Get('stats')
  async getStats(@CurrentAuth() auth: AuthContext) {
    return this.careerService.getCareerStats(auth.institutionId);
  }

  @Get('postings')
  async getJobPostings(
    @CurrentAuth() auth: AuthContext,
    @Query('activeOnly') activeOnly?: string,
  ) {
    const isActive = activeOnly !== 'false';
    return this.careerService.getJobPostings(auth.institutionId, isActive);
  }

  @Get('postings/:id')
  async getJobDetails(
    @CurrentAuth() auth: AuthContext,
    @Param('id') jobId: string,
  ) {
    return this.careerService.getJobPostingDetails(auth.institutionId, jobId);
  }

  @Post('postings')
  async createJobPosting(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: CreateJobPostingDto,
  ) {
    return this.careerService.createJobPosting(auth.institutionId, dto, auth);
  }

  @Get('my-applications')
  async getMyApplications(
    @CurrentAuth() auth: AuthContext,
    @Query('studentId') studentId?: string,
  ) {
    const targetStudentId = studentId || auth.userId;
    return this.careerService.getStudentApplications(targetStudentId);
  }

  @Post('apply')
  async applyForJob(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: ApplyJobDto,
  ) {
    return this.careerService.applyForJob(auth.institutionId, dto, auth);
  }

  @Patch('applications/:id/status')
  async updateApplicationStatus(
    @CurrentAuth() auth: AuthContext,
    @Param('id') applicationId: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.careerService.updateApplicationStatus(
      auth.institutionId,
      applicationId,
      dto,
      auth,
    );
  }
}
