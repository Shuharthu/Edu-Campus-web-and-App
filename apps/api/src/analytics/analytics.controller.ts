import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth } from '../common/decorators';
import { CreateSurveyDto, SubmitSurveyResponseDto } from './dto/analytics.dto';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview(@CurrentAuth() auth: AuthContext) {
    return this.analyticsService.getExecutiveOverview(auth.institutionId);
  }

  @Get('at-risk')
  async getAtRiskStudents(@CurrentAuth() auth: AuthContext) {
    return this.analyticsService.getAtRiskStudents(auth.institutionId);
  }

  @Get('surveys')
  async getSurveys(@CurrentAuth() auth: AuthContext) {
    return this.analyticsService.getSurveys(auth.institutionId);
  }

  @Post('surveys')
  async createSurvey(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: CreateSurveyDto,
  ) {
    return this.analyticsService.createSurvey(auth.institutionId, dto, auth);
  }

  @Post('surveys/respond')
  async submitSurveyResponse(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: SubmitSurveyResponseDto,
  ) {
    return this.analyticsService.submitSurveyResponse(auth.userId, dto);
  }
}
