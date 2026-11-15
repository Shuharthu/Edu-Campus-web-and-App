import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import type { AuthContext } from '../common/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateBookDto, IssueBookDto, ReturnBookDto } from './dto/library.dto';

@Injectable()
export class LibraryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getCatalog(institutionId: string, category?: string, search?: string) {
    const where: any = { institutionId };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { isbn: { contains: search, mode: 'insensitive' } },
        { shelfLocation: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.book.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        loans: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              include: { user: true },
            },
          },
        },
      },
    });
  }

  async getStats(institutionId: string) {
    const totalTitles = await this.prisma.book.count({
      where: { institutionId },
    });

    const activeLoans = await this.prisma.bookLoan.count({
      where: {
        book: { institutionId },
        status: 'ACTIVE',
      },
    });

    const overdueLoans = await this.prisma.bookLoan.count({
      where: {
        book: { institutionId },
        status: 'ACTIVE',
        dueDate: { lt: new Date() },
      },
    });

    const digitalTitles = await this.prisma.book.count({
      where: {
        institutionId,
        ebookUrl: { not: null },
      },
    });

    return {
      totalTitles,
      activeLoans,
      overdueLoans,
      digitalTitles,
      totalFinesAssessed: overdueLoans * 0.5,
    };
  }

  async getBookDetails(institutionId: string, bookId: string) {
    const book = await this.prisma.book.findFirst({
      where: { id: bookId, institutionId },
      include: {
        loans: {
          include: {
            student: {
              include: { user: true },
            },
          },
        },
      },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async createBook(institutionId: string, dto: CreateBookDto, auth: AuthContext) {
    const book = await this.prisma.book.create({
      data: {
        institutionId,
        isbn: dto.isbn,
        title: dto.title,
        author: dto.author,
        publisher: dto.publisher,
        edition: dto.edition,
        category: dto.category ?? 'GENERAL',
        shelfLocation: dto.shelfLocation,
        totalCopies: dto.totalCopies ?? 1,
        availableCopies: dto.totalCopies ?? 1,
        coverUrl: dto.coverUrl,
        ebookUrl: dto.ebookUrl,
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'library',
      action: 'create',
      entityType: 'Book',
      entityId: book.id,
      afterJson: { title: book.title, isbn: book.isbn },
    });

    return book;
  }

  async issueBook(institutionId: string, dto: IssueBookDto, auth: AuthContext) {
    const book = await this.prisma.book.findFirst({
      where: { id: dto.bookId, institutionId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.availableCopies <= 0) {
      throw new BadRequestException('No copies available for loan');
    }

    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, institutionId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const duration = dto.loanDurationDays || 14;
    const dueDate = new Date(Date.now() + duration * 24 * 60 * 60 * 1000);

    const [loan, updatedBook] = await this.prisma.$transaction([
      this.prisma.bookLoan.create({
        data: {
          bookId: book.id,
          studentId: student.id,
          dueDate,
          status: 'ACTIVE',
          fineAmount: 0.0,
          isFinePaid: true,
        },
        include: {
          book: true,
          student: {
            include: { user: true },
          },
        },
      }),
      this.prisma.book.update({
        where: { id: book.id },
        data: {
          availableCopies: { decrement: 1 },
        },
      }),
    ]);

    await this.auditService.logFromAuth(auth, {
      module: 'library',
      action: 'create',
      entityType: 'BookLoan',
      entityId: loan.id,
      afterJson: { bookTitle: book.title, studentId: student.id, dueDate },
    });

    return { loan, remainingAvailable: updatedBook.availableCopies };
  }

  async returnBook(institutionId: string, dto: ReturnBookDto, auth: AuthContext) {
    const loan = await this.prisma.bookLoan.findFirst({
      where: {
        id: dto.loanId,
        book: { institutionId },
      },
      include: { book: true, student: true },
    });

    if (!loan) {
      throw new NotFoundException('Loan record not found');
    }

    if (loan.status === 'RETURNED') {
      throw new BadRequestException('Book is already returned');
    }

    const now = new Date();
    let fineAmount = 0;
    if (now > loan.dueDate) {
      const diffMs = now.getTime() - loan.dueDate.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      fineAmount = diffDays * 0.5; // $0.50/day
    }

    const [updatedLoan] = await this.prisma.$transaction([
      this.prisma.bookLoan.update({
        where: { id: loan.id },
        data: {
          status: 'RETURNED',
          returnedAt: now,
          fineAmount,
          isFinePaid: fineAmount === 0,
        },
      }),
      this.prisma.book.update({
        where: { id: loan.bookId },
        data: {
          availableCopies: { increment: 1 },
        },
      }),
    ]);

    await this.auditService.logFromAuth(auth, {
      module: 'library',
      action: 'update',
      entityType: 'BookLoan',
      entityId: loan.id,
      afterJson: { returnDate: now, fineAmount },
    });

    return updatedLoan;
  }

  async getStudentLoans(studentId: string) {
    return this.prisma.bookLoan.findMany({
      where: { studentId },
      include: {
        book: true,
      },
      orderBy: { borrowedAt: 'desc' },
    });
  }
}
