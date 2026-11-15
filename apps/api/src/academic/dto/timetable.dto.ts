import { IsInt, IsNotEmpty, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

export class CreateTimetableSlotDto {
  @IsString()
  @IsNotEmpty()
  campusId!: string;

  @IsString()
  @IsNotEmpty()
  sectionId!: string;

  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  facultyMemberId!: string;

  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek!: number;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime must be in HH:MM format' })
  startTime!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'endTime must be in HH:MM format' })
  endTime!: string;

  @IsString()
  @IsOptional()
  slotStatus?: string;
}

export class ClashCheckQueryDto {
  @IsString()
  @IsOptional()
  campusId?: string;

  @IsString()
  @IsOptional()
  semesterId?: string;

  @IsString()
  @IsOptional()
  departmentId?: string;
}
