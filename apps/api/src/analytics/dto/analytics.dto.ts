import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateSurveyDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  courseOfferingId?: string;

  @IsString()
  @IsOptional()
  @IsIn(['COURSE_EVALUATION', 'CAMPUS_SATISFACTION', 'EVENT_FEEDBACK'])
  surveyType?: string = 'COURSE_EVALUATION';

  @IsDateString()
  @IsNotEmpty()
  endsAt!: string;
}

export class SubmitSurveyResponseDto {
  @IsString()
  @IsNotEmpty()
  surveyId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  clarityRating!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  engagementRating!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  fairnessRating!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  overallRating!: number;

  @IsString()
  @IsOptional()
  feedbackText?: string;
}
