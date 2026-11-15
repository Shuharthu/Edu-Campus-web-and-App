import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RequestDataExportDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RequestErasureDto {
  @IsNotEmpty()
  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  scope?: string;
}
