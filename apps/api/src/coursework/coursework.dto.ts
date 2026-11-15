import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMaterialDto {
  @ApiProperty({ description: 'Course UUID' })
  @IsUUID()
  courseId!: string;

  @ApiPropertyOptional({ description: 'Optional Section UUID' })
  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @ApiProperty({ description: 'Material title', example: 'Lecture 1: Introduction to Data Structures' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Material description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'URL to document or slide', example: 'https://supabase.co/storage/slides1.pdf' })
  @IsString()
  fileUrl!: string;

  @ApiPropertyOptional({ description: 'MIME type of file', example: 'application/pdf' })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiPropertyOptional({ description: 'Week number', example: 1 })
  @IsOptional()
  @IsNumber()
  weekNumber?: number;

  @ApiPropertyOptional({ description: 'Publish immediately flag', default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class CreateAssignmentDto {
  @ApiProperty({ description: 'Section UUID' })
  @IsUUID()
  sectionId!: string;

  @ApiProperty({ description: 'Assignment title', example: 'Binary Search Tree Implementation' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ description: 'Assignment problem statement and guidelines' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Submission due datetime', example: '2026-11-20T23:59:59Z' })
  @IsDateString()
  dueAt!: string;

  @ApiPropertyOptional({ description: 'Max points', default: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxPoints?: number;

  @ApiPropertyOptional({ description: 'Weightage in percentage', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weightagePct?: number;

  @ApiPropertyOptional({ description: 'Late policy', example: 'REJECT' })
  @IsOptional()
  @IsString()
  latePolicy?: string;
}

export class SubmitAssignmentDto {
  @ApiProperty({ description: 'Assignment UUID' })
  @IsUUID()
  assignmentId!: string;

  @ApiPropertyOptional({ description: 'Uploaded file URL' })
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'Text or code content' })
  @IsOptional()
  @IsString()
  content?: string;
}

export class GradeSubmissionDto {
  @ApiProperty({ description: 'Score awarded' })
  @IsNumber()
  @Min(0)
  score!: number;

  @ApiPropertyOptional({ description: 'Feedback comments' })
  @IsOptional()
  @IsString()
  feedback?: string;
}
