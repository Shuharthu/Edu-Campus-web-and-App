import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth, RequirePermission } from '../common/decorators';
import { CreateBookDto, IssueBookDto, ReturnBookDto } from './dto/library.dto';
import { LibraryService } from './library.service';

@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get('catalog')
  async getCatalog(
    @CurrentAuth() auth: AuthContext,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.libraryService.getCatalog(auth.institutionId, category, search);
  }

  @Get('stats')
  async getStats(@CurrentAuth() auth: AuthContext) {
    return this.libraryService.getStats(auth.institutionId);
  }

  @Get('student-loans')
  async getStudentLoans(
    @CurrentAuth() auth: AuthContext,
    @Query('studentId') studentId?: string,
  ) {
    const targetStudentId = studentId || auth.userId;
    return this.libraryService.getStudentLoans(targetStudentId);
  }

  @Get('books/:id')
  async getBookDetails(
    @CurrentAuth() auth: AuthContext,
    @Param('id') bookId: string,
  ) {
    return this.libraryService.getBookDetails(auth.institutionId, bookId);
  }

  @Post('books')
  async createBook(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: CreateBookDto,
  ) {
    return this.libraryService.createBook(auth.institutionId, dto, auth);
  }

  @Post('issue')
  async issueBook(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: IssueBookDto,
  ) {
    return this.libraryService.issueBook(auth.institutionId, dto, auth);
  }

  @Post('return')
  async returnBook(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: ReturnBookDto,
  ) {
    return this.libraryService.returnBook(auth.institutionId, dto, auth);
  }
}
