import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateMaintenanceTicketDto {
  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: string = 'MEDIUM';
}

export class UpdateMaintenanceTicketDto {
  @IsString()
  @IsOptional()
  @IsIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'])
  status?: string;

  @IsString()
  @IsOptional()
  assignedTo?: string;
}

export class AllocateHostelDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  studentId!: string;
}
