import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttendanceSessionDto {
  @ApiProperty({ description: 'Section UUID' })
  @IsUUID()
  sectionId!: string;

  @ApiPropertyOptional({ description: 'Timetable Slot UUID' })
  @IsOptional()
  @IsUUID()
  slotId?: string;

  @ApiPropertyOptional({ description: 'Classroom latitude for geofence validation' })
  @IsOptional()
  @IsNumber()
  geofenceLat?: number;

  @ApiPropertyOptional({ description: 'Classroom longitude for geofence validation' })
  @IsOptional()
  @IsNumber()
  geofenceLng?: number;

  @ApiPropertyOptional({ description: 'Geofence radius in meters (default 50m)' })
  @IsOptional()
  @IsNumber()
  geofenceRadiusMeters?: number;

  @ApiPropertyOptional({ description: 'Bluetooth BLE beacon UUID for proximity check' })
  @IsOptional()
  @IsString()
  bleUuid?: string;
}

export class AttendanceCheckInDto {
  @ApiPropertyOptional({ description: 'Rotating session token from QR code' })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiPropertyOptional({ description: '6-digit short fallback code' })
  @IsOptional()
  @IsString()
  shortCode?: string;

  @ApiPropertyOptional({ description: 'Student device latitude' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Student device longitude' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Student notes or device check info' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class AttendanceCorrectionDto {
  @ApiProperty({ description: 'Attendance Record UUID' })
  @IsUUID()
  recordId!: string;

  @ApiProperty({ description: 'Previous attendance status', example: 'ABSENT' })
  @IsString()
  previousStatus!: string;

  @ApiProperty({ description: 'Requested new status', example: 'PRESENT' })
  @IsString()
  newStatus!: string;

  @ApiProperty({ description: 'Justification reason' })
  @IsString()
  reason!: string;
}

export class DecideCorrectionDto {
  @ApiProperty({ description: 'Approval decision' })
  @IsBoolean()
  approved!: boolean;

  @ApiPropertyOptional({ description: 'Approver review comment' })
  @IsOptional()
  @IsString()
  comment?: string;
}
