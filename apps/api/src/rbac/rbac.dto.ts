import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'department_coordinator' })
  @IsString()
  @MinLength(2)
  slug!: string;

  @ApiProperty({ example: 'Department coordinator' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiPropertyOptional({ example: 'SUB_ADMIN' })
  @IsOptional()
  @IsEnum(['SUB_ADMIN', 'FACULTY'])
  tier?: 'SUB_ADMIN' | 'FACULTY';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds!: string[];
}

export class UpdateRolePermissionsDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds!: string[];
}

export class AssignUserRoleDto {
  @ApiProperty()
  @IsUUID('4')
  userId!: string;

  @ApiProperty()
  @IsUUID('4')
  roleId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4')
  campusId?: string;

  @ApiPropertyOptional({ example: 'CSE' })
  @IsOptional()
  @IsString()
  departmentCode?: string;

  @ApiPropertyOptional({ example: 'BSC-CSE' })
  @IsOptional()
  @IsString()
  programCode?: string;

  @ApiProperty({ enum: ['own', 'section', 'department', 'program', 'campus', 'institution'] })
  @IsEnum(['own', 'section', 'department', 'program', 'campus', 'institution'])
  scopeType!: 'own' | 'section' | 'department' | 'program' | 'campus' | 'institution';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActing?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  validTo?: string;
}

export class DecideApprovalDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsEnum(['APPROVED', 'REJECTED'])
  decision!: 'APPROVED' | 'REJECTED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comment?: string;
}
