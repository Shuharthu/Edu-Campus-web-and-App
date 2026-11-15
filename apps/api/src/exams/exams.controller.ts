import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth, RequirePermission } from '../common/decorators';
import {
  AllocateSeatsDto,
  CreateExamDto,
  VerifyAdmitCardDto,
} from './exams.dto';
import { ExamsService } from './exams.service';

@ApiTags('Exams & Seating')
@ApiBearerAuth()
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  @RequirePermission('academics_setup', 'view')
  @ApiOperation({ summary: 'List scheduled exams and room allocations' })
  async getExams(
    @Query('semesterId') semesterId?: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.examsService.getExams(semesterId, courseId);
  }

  @Post()
  @RequirePermission('academics_setup', 'create')
  @ApiOperation({ summary: 'Schedule a new examination' })
  async createExam(
    @Body() dto: CreateExamDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.examsService.createExam(dto, auth);
  }

  @Post('seats/allocate')
  @RequirePermission('academics_setup', 'edit')
  @ApiOperation({ summary: 'Run automatic seating arrangement and generate anti-fraud admit tokens' })
  async allocateSeats(
    @Body() dto: AllocateSeatsDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.examsService.allocateSeats(dto, auth);
  }

  @Get('admit-card')
  @RequirePermission('academics_setup', 'view')
  @ApiOperation({ summary: 'Get digital admit card for student' })
  async getAdmitCard(
    @Query('studentId') studentId: string,
    @Query('examId') examId: string,
  ) {
    return this.examsService.getAdmitCard(studentId, examId);
  }

  @Post('admit-card/verify')
  @RequirePermission('academics_setup', 'edit')
  @ApiOperation({ summary: 'Invigilator QR verification at exam hall entrance' })
  async verifyAdmitCard(@Body() dto: VerifyAdmitCardDto) {
    return this.examsService.verifyAdmitCard(dto);
  }
}
