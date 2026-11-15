import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsIn,
  IsUrl,
} from 'class-validator';

export class CreateJobPostingDto {
  @IsString()
  @IsNotEmpty()
  companyName!: string;

  @IsUrl()
  @IsOptional()
  companyLogoUrl?: string;

  @IsString()
  @IsNotEmpty()
  roleTitle!: string;

  @IsString()
  @IsOptional()
  @IsIn(['INTERNSHIP', 'FULL_TIME', 'PART_TIME', 'CONTRACT'])
  jobType?: string = 'INTERNSHIP';

  @IsString()
  @IsOptional()
  stipendSalary?: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsNumber()
  @IsOptional()
  minCgpa?: number = 3.0;

  @IsDateString()
  @IsNotEmpty()
  applicationDeadline!: string;

  @IsString()
  @IsNotEmpty()
  requirements!: string;
}

export class ApplyJobDto {
  @IsString()
  @IsNotEmpty()
  jobPostingId!: string;

  @IsString()
  @IsNotEmpty()
  studentId!: string;
}

export class UpdateApplicationStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['APPLIED', 'REVIEWING', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED'])
  status!: string;

  @IsDateString()
  @IsOptional()
  interviewDate?: string;
}
