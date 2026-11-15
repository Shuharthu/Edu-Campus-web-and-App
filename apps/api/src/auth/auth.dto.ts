import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'nusrat.jahan@university.edu' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SmartEdu#2026' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ example: 'web' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ example: 'Chrome on Windows' })
  @IsOptional()
  @IsString()
  deviceName?: string;
}

export class VerifyMfaDto {
  @ApiProperty()
  @IsString()
  mfaToken!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Length(6, 16)
  code!: string;

  @ApiPropertyOptional({ example: 'web' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ example: 'Chrome on Windows' })
  @IsOptional()
  @IsString()
  deviceName?: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken!: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: 'john.doe@university.edu' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MyPassword#2026' })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiPropertyOptional({ example: 'student', enum: ['student', 'faculty', 'admin', 'registrar', 'parent'] })
  @IsOptional()
  @IsString()
  roleSlug?: string;

  @ApiPropertyOptional({ example: '2026-CSE-9999' })
  @IsOptional()
  @IsString()
  studentNumber?: string;

  @ApiPropertyOptional({ example: 'CSE' })
  @IsOptional()
  @IsString()
  departmentCode?: string;

  @ApiPropertyOptional({ example: 'web' })
  @IsOptional()
  @IsString()
  platform?: string;

  @ApiPropertyOptional({ example: 'Chrome on Windows' })
  @IsOptional()
  @IsString()
  deviceName?: string;
}

export class SwitchRoleDto {
  @ApiProperty()
  @IsString()
  assignmentId!: string;
}

export class PreviewRoleDto {
  @ApiProperty()
  @IsString()
  roleId!: string;
}

export class SsoCallbackDto {
  @ApiProperty()
  @IsString()
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;
}
