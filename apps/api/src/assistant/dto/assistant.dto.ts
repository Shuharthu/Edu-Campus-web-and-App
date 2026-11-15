import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';

export class AskAssistantDto {
  @IsString()
  @IsNotEmpty()
  query!: string;

  @IsString()
  @IsOptional()
  conversationId?: string;
}

export class CreateStudyBlockDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  targetTopic?: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsNumber()
  @Min(0.5)
  @IsOptional()
  allocatedHours?: number = 1.5;

  @IsDateString()
  @IsNotEmpty()
  targetDate!: string;
}
