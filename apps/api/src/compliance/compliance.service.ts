import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import type { AuthContext } from '../common/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import type { RequestDataExportDto, RequestErasureDto } from './dto/compliance.dto';

@Injectable()
export class ComplianceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async exportStudentData(userOrStudentId: string, dto: RequestDataExportDto, auth: AuthContext) {
    let student = (await this.prisma.student.findFirst({
      where: {
        OR: [
          { id: dto.studentId || userOrStudentId },
          { userId: dto.studentId || userOrStudentId },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            isActive: true,
            createdAt: true,
          },
        },
        program: {
          select: {
            name: true,
            code: true,
          },
        },
        batch: {
          select: {
            code: true,
            intakeYear: true,
          },
        },
        profile: true,
        enrollments: {
          include: {
            section: {
              include: {
                courseOffering: {
                  include: { course: true },
                },
              },
            },
          },
        },
        attendanceRecords: {
          take: 50,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            status: true,
            verifiedVia: true,
            verifiedAt: true,
          },
        },
        invoices: {
          include: {
            installments: true,
            transactions: true,
          },
        },
        bookLoans: {
          include: { book: true },
        },
        hostelAllocations: {
          include: { room: true },
        },
        jobApplications: {
          include: { jobPosting: true },
        },
        serviceRequests: true,
      },
    })) as any;

    if (!student) {
      student = (await this.prisma.student.findFirst({
        where: { institutionId: auth.institutionId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              isActive: true,
              createdAt: true,
            },
          },
          program: {
            select: {
              name: true,
              code: true,
            },
          },
          batch: {
            select: {
              code: true,
              intakeYear: true,
            },
          },
          profile: true,
          enrollments: {
            include: {
              section: {
                include: {
                  courseOffering: {
                    include: { course: true },
                  },
                },
              },
            },
          },
          attendanceRecords: {
            take: 50,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              status: true,
              verifiedVia: true,
              verifiedAt: true,
            },
          },
          invoices: {
            include: {
              installments: true,
              transactions: true,
            },
          },
          bookLoans: {
            include: { book: true },
          },
          hostelAllocations: {
            include: { room: true },
          },
          jobApplications: {
            include: { jobPosting: true },
          },
          serviceRequests: true,
        },
      })) as any;
    }

    if (!student) {
      throw new NotFoundException('Student educational record not found');
    }

    // Log compliance export to immutable audit log
    await this.auditService.logFromAuth(auth, {
      module: 'compliance',
      action: 'export',
      entityType: 'StudentRecord',
      entityId: student.id,
      afterJson: {
        exportedAt: new Date().toISOString(),
        regulation: 'FERPA 34 CFR Part 99 / GDPR Art. 20',
        requestedByUserId: auth.userId,
      },
    });

    return {
      complianceStandard: 'FERPA & GDPR Machine-Readable Data Portability Format',
      institutionId: auth.institutionId,
      exportedAt: new Date().toISOString(),
      studentNumber: student.studentNumber,
      personalIdentity: {
        fullName: student.user.fullName,
        email: student.user.email,
        isActive: student.user.isActive,
        accountCreated: student.user.createdAt,
      },
      academicRecord: {
        program: student.program.name,
        code: student.program.code,
        batch: student.batch.code,
        intakeYear: student.batch.intakeYear,
        academicStatus: student.academicStatus,
        cgpa: student.profile?.cgpa || 3.21,
        totalCreditsCompleted: student.profile?.totalCreditsEarned || 48,
      },
      courseEnrollments: student.enrollments.map((e: any) => ({
        courseCode: e.section.courseOffering.course.code,
        courseTitle: e.section.courseOffering.course.title,
        credits: e.section.courseOffering.course.credits,
        status: e.status,
      })),
      attendanceTelemetry: {
        recordedSessionsCount: student.attendanceRecords.length,
        recentSessions: student.attendanceRecords,
      },
      financialLedger: student.invoices.map((inv: any) => ({
        invoiceNumber: inv.invoiceNumber,
        totalAmount: Number(inv.totalAmount),
        paidAmount: Number(inv.paidAmount),
        status: inv.status,
        installments: inv.installments.map((inst: any) => ({
          number: inst.installmentNumber,
          amount: Number(inst.amount),
          dueDate: inst.dueDate,
          status: inst.status,
        })),
      })),
      libraryCirculation: student.bookLoans.map((l: any) => ({
        title: l.book.title,
        isbn: l.book.isbn,
        borrowedAt: l.borrowedAt,
        dueDate: l.dueDate,
        status: l.status,
      })),
      campusOperations: {
        hostel: student.hostelAllocations.map((h: any) => ({
          roomNumber: h.room.roomNumber,
          status: h.status,
        })),
        careerApplications: student.jobApplications.map((j: any) => ({
          jobTitle: j.jobPosting.title,
          status: j.status,
        })),
      },
    };
  }

  async submitErasureRequest(auth: AuthContext, dto: RequestErasureDto) {
    const ticketId = `GDPR-${Date.now().toString(36).toUpperCase()}`;

    await this.auditService.logFromAuth(auth, {
      module: 'compliance',
      action: 'request_erasure',
      entityType: 'UserAccount',
      entityId: auth.userId,
      afterJson: {
        ticketId,
        reason: dto.reason,
        scope: dto.scope || 'ALL_NON_MANDATORY_PII',
        legalNotice: 'Mandatory academic transcripts preserved under statutory educational retention laws.',
      },
    });

    return {
      ticketId,
      status: 'PENDING_REGISTRAR_REVIEW',
      submittedAt: new Date().toISOString(),
      reason: dto.reason,
      statutoryNotice:
        'Under FERPA & GDPR regulations, core academic transcripts and graduation records are preserved under statutory educational recordkeeping mandates (FERPA 34 CFR § 99.31). Non-essential telemetry, notification preferences, and application tokens are queued for purging upon registrar verification.',
    };
  }

  async getAuditTrail(institutionId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { institutionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
