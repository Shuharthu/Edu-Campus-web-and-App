import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeeStructureDto {
  @ApiProperty({ description: 'Program UUID' })
  @IsUUID()
  programId!: string;

  @ApiProperty({ description: 'Semester UUID' })
  @IsUUID()
  semesterId!: string;

  @ApiProperty({ description: 'Name of the fee schedule' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Tuition per credit hour', example: 200 })
  @IsNumber()
  @Min(0)
  tuitionPerCredit!: number;

  @ApiPropertyOptional({ description: 'Lab fee', default: 0 })
  @IsOptional()
  @IsNumber()
  labFee?: number;

  @ApiPropertyOptional({ description: 'Library fee', default: 0 })
  @IsOptional()
  @IsNumber()
  libraryFee?: number;

  @ApiPropertyOptional({ description: 'Student activity fee', default: 0 })
  @IsOptional()
  @IsNumber()
  activityFee?: number;
}

export class CreateScholarshipDto {
  @ApiProperty({ description: 'Scholarship title', example: "Dean's Merit Scholarship" })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Code', example: 'DEAN-MERIT' })
  @IsString()
  code!: string;

  @ApiProperty({ description: 'Percentage discount (0-100)', example: 25 })
  @IsNumber()
  @Min(1)
  discountPct!: number;

  @ApiPropertyOptional({ description: 'Eligibility criteria' })
  @IsOptional()
  @IsString()
  criteria?: string;
}

export class AwardScholarshipDto {
  @ApiProperty({ description: 'Scholarship UUID' })
  @IsUUID()
  scholarshipId!: string;

  @ApiProperty({ description: 'Student UUID' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Semester UUID' })
  @IsUUID()
  semesterId!: string;
}

export class CreateInvoiceDto {
  @ApiProperty({ description: 'Student UUID' })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ description: 'Semester UUID' })
  @IsUUID()
  semesterId!: string;

  @ApiProperty({ description: 'Total tuition amount', example: 3600 })
  @IsNumber()
  @Min(0)
  tuitionAmount!: number;

  @ApiPropertyOptional({ description: 'Additional fees (lab, library)', default: 0 })
  @IsOptional()
  @IsNumber()
  additionalFees?: number;

  @ApiProperty({ description: 'Due date in ISO format', example: '2026-11-30T23:59:59Z' })
  @IsString()
  dueDate!: string;

  @ApiPropertyOptional({ description: 'Number of installment tiers', default: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  installmentCount?: number;
}

export class ProcessPaymentIntentDto {
  @ApiProperty({ description: 'Invoice UUID' })
  @IsUUID()
  invoiceId!: string;

  @ApiPropertyOptional({ description: 'Installment UUID' })
  @IsOptional()
  @IsUUID()
  installmentId?: string;

  @ApiProperty({ description: 'Payment amount', example: 1023.33 })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ description: 'Currency', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;
}
