import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class QueryStudentsDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: 'ALL' | 'AT_RISK' | 'FEE_DUE' | 'ON_PROBATION';

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  programId?: string;

  @IsOptional()
  @IsString()
  batchId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

export class BulkImportStudentItemDto {
  @IsString()
  @IsNotEmpty()
  studentNumber!: string;

  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  programCode!: string;

  @IsString()
  @IsNotEmpty()
  batchCode!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class BulkImportStudentsDto {
  @IsArray()
  items!: BulkImportStudentItemDto[];
}
