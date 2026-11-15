import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceRequestDto {
  @ApiProperty({ description: 'Request type', example: 'TRANSCRIPT' })
  @IsString()
  requestType!: string;

  @ApiPropertyOptional({ description: 'Purpose / justification', example: 'Graduate School Application' })
  @IsOptional()
  @IsString()
  purpose?: string;

  @ApiPropertyOptional({ description: 'Application fee', default: 15.0 })
  @IsOptional()
  @IsNumber()
  feeAmount?: number;
}

export class UpdateServiceRequestStatusDto {
  @ApiProperty({ description: 'New status', example: 'APPROVED' })
  @IsString()
  status!: string;

  @ApiPropertyOptional({ description: 'Signed document download URL' })
  @IsOptional()
  @IsString()
  documentUrl?: string;

  @ApiPropertyOptional({ description: 'Staff remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class VerifyDigitalIdDto {
  @ApiProperty({ description: 'Dynamic QR token string' })
  @IsString()
  qrToken!: string;
}
