import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnterScoreDto {
  @ApiProperty({ description: 'Assessment UUID' })
  @IsUUID()
  assessmentId!: string;

  @ApiProperty({ description: 'Student UUID' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Score obtained', example: 85 })
  @IsNumber()
  @Min(0)
  score!: number;

  @ApiPropertyOptional({ description: 'Flag if student was absent' })
  @IsOptional()
  @IsBoolean()
  isAbsent?: boolean;

  @ApiPropertyOptional({ description: 'Faculty remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateAssessmentDto {
  @ApiProperty({ description: 'Section UUID' })
  @IsUUID()
  sectionId!: string;

  @ApiProperty({ description: 'Assessment title', example: 'Midterm Examination' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Assessment type', example: 'EXAM' })
  @IsString()
  type!: string;

  @ApiProperty({ description: 'Maximum score possible', example: 100 })
  @IsNumber()
  @Min(1)
  maxScore!: number;

  @ApiProperty({ description: 'Weightage in percentage (0-100)', example: 25 })
  @IsNumber()
  @Min(1)
  @Max(100)
  weightagePct!: number;
}

export class SubmitModerationDto {
  @ApiProperty({ description: 'Section UUID' })
  @IsUUID()
  sectionId!: string;

  @ApiProperty({ description: 'Semester UUID' })
  @IsUUID()
  semesterId!: string;

  @ApiPropertyOptional({ description: 'Faculty submission notes' })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class ApproveModerationDto {
  @ApiProperty({ description: 'Section UUID' })
  @IsUUID()
  sectionId!: string;

  @ApiProperty({ description: 'Semester UUID' })
  @IsUUID()
  semesterId!: string;

  @ApiPropertyOptional({ description: 'Approver review notes' })
  @IsOptional()
  @IsString()
  comments?: string;
}

export class PublishGradesDto {
  @ApiProperty({ description: 'Section UUID' })
  @IsUUID()
  sectionId!: string;

  @ApiProperty({ description: 'Semester UUID' })
  @IsUUID()
  semesterId!: string;
}
