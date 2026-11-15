import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsUrl } from 'class-validator';

export class IssueBookDto {
  @IsString()
  @IsNotEmpty()
  bookId!: string;

  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  loanDurationDays?: number = 14;
}

export class ReturnBookDto {
  @IsString()
  @IsNotEmpty()
  loanId!: string;
}

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  isbn!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  author!: string;

  @IsString()
  @IsOptional()
  publisher?: string;

  @IsString()
  @IsOptional()
  edition?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  shelfLocation?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  totalCopies?: number = 1;

  @IsUrl()
  @IsOptional()
  coverUrl?: string;

  @IsUrl()
  @IsOptional()
  ebookUrl?: string;
}
