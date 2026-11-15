import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  priority?: 'NORMAL' | 'URGENT' | 'EMERGENCY';

  @IsString()
  @IsOptional()
  targetScope?: 'ALL' | 'DEPARTMENT' | 'BATCH' | 'SECTION';

  @IsUUID()
  @IsOptional()
  targetDepartmentId?: string;

  @IsUUID()
  @IsOptional()
  targetBatchId?: string;

  @IsUUID()
  @IsOptional()
  targetSectionId?: string;

  @IsBoolean()
  @IsOptional()
  sendPush?: boolean;

  @IsBoolean()
  @IsOptional()
  sendEmail?: boolean;

  @IsBoolean()
  @IsOptional()
  sendSms?: boolean;

  @IsBoolean()
  @IsOptional()
  isPinned?: boolean;
}

export class CreateThreadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsOptional()
  threadType?: 'COURSE_DISCUSSION' | 'DEPARTMENT_CHANNEL' | 'DIRECT_MESSAGE';

  @IsUUID()
  @IsOptional()
  sectionId?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsArray()
  @IsOptional()
  attachments?: any[];
}

export class UpdateNotificationPreferenceDto {
  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  smsUrgentOnly?: boolean;

  @IsString()
  @IsOptional()
  quietHoursStart?: string;

  @IsString()
  @IsOptional()
  quietHoursEnd?: string;
}
