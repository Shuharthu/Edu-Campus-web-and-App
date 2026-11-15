import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExamDto {
  @ApiProperty({ description: 'Semester UUID' })
  @IsUUID()
  semesterId!: string;

  @ApiProperty({ description: 'Course UUID' })
  @IsUUID()
  courseId!: string;

  @ApiProperty({ description: 'Exam name', example: 'Midterm Examination' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Exam date', example: '2026-11-25T00:00:00Z' })
  @IsDateString()
  examDate!: string;

  @ApiProperty({ description: 'Start time (HH:MM)', example: '09:00' })
  @IsString()
  startTime!: string;

  @ApiProperty({ description: 'End time (HH:MM)', example: '11:00' })
  @IsString()
  endTime!: string;

  @ApiPropertyOptional({ description: 'Duration in minutes', default: 120 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  durationMinutes?: number;

  @ApiPropertyOptional({ description: 'Room UUID' })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @ApiPropertyOptional({ description: 'Total seats capacity', default: 50 })
  @IsOptional()
  @IsNumber()
  totalSeats?: number;
}

export class AllocateSeatsDto {
  @ApiProperty({ description: 'Exam UUID' })
  @IsUUID()
  examId!: string;

  @ApiPropertyOptional({ description: 'Room UUID for allocation' })
  @IsOptional()
  @IsUUID()
  roomId?: string;
}

export class VerifyAdmitCardDto {
  @ApiProperty({ description: 'Anti-fraud QR token string' })
  @IsString()
  token!: string;
}
