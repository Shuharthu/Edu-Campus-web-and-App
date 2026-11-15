import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import crypto from 'node:crypto';
import { AuditService } from '../audit/audit.service';
import type { AuthContext } from '../common/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AllocateSeatsDto,
  CreateExamDto,
  VerifyAdmitCardDto,
} from './exams.dto';

@Injectable()
export class ExamsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getExams(semesterId?: string, courseId?: string) {
    return this.prisma.exam.findMany({
      where: {
        ...(semesterId ? { semesterId } : {}),
        ...(courseId ? { courseId } : {}),
        deletedAt: null,
      },
      include: {
        course: true,
        semester: true,
        room: true,
        seats: {
          include: {
            student: { include: { user: true } },
          },
        },
      },
      orderBy: { examDate: 'asc' },
    });
  }

  async createExam(dto: CreateExamDto, auth: AuthContext) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    const exam = await this.prisma.exam.create({
      data: {
        semesterId: dto.semesterId,
        courseId: dto.courseId,
        name: dto.name,
        examDate: new Date(dto.examDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        durationMinutes: dto.durationMinutes ?? 120,
        roomId: dto.roomId,
        totalSeats: dto.totalSeats ?? 50,
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'academics_setup',
      action: 'create',
      entityType: 'Exam',
      entityId: exam.id,
      afterJson: { name: exam.name, date: exam.examDate },
    });

    return exam;
  }

  async allocateSeats(dto: AllocateSeatsDto, auth: AuthContext) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: dto.examId },
      include: {
        course: true,
        room: true,
      },
    });
    if (!exam) throw new NotFoundException('Exam not found');

    // Find all students enrolled in sections of this course for this semester
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        section: {
          courseOffering: {
            courseId: exam.courseId,
            semesterId: exam.semesterId,
          },
        },
        deletedAt: null,
      },
      include: {
        student: { include: { user: true } },
      },
    });

    if (enrollments.length === 0) {
      throw new BadRequestException('No enrolled students found for this course and semester');
    }

    // Allocate seats
    let seatNumberIndex = 1;
    const seatsData = enrollments.map((enr) => {
      const seatNumber = `Seat ${seatNumberIndex.toString().padStart(2, '0')}`;
      seatNumberIndex++;

      const isDefaulter = enr.attendancePct != null && Number(enr.attendancePct) < 75;
      const admitToken = `smartedu_admit_${crypto.randomBytes(16).toString('hex')}`;

      return {
        examId: exam.id,
        studentId: enr.student.id,
        seatNumber,
        admitCardQrToken: admitToken,
        isAdmitted: !isDefaulter,
      };
    });

    // Delete existing seats for this exam and replace with newly allocated seats
    await this.prisma.examSeat.deleteMany({
      where: { examId: exam.id },
    });

    await this.prisma.examSeat.createMany({
      data: seatsData,
      skipDuplicates: true,
    });

    return {
      examId: exam.id,
      totalAllocated: seatsData.length,
      admittedCount: seatsData.filter((s) => s.isAdmitted).length,
      barredDefaultersCount: seatsData.filter((s) => !s.isAdmitted).length,
    };
  }

  async getAdmitCard(studentId: string, examId: string) {
    const seat = await this.prisma.examSeat.findUnique({
      where: {
        examId_studentId: {
          examId,
          studentId,
        },
      },
      include: {
        exam: {
          include: {
            course: true,
            semester: true,
            room: true,
          },
        },
        student: {
          include: {
            user: true,
            program: true,
            batch: true,
          },
        },
      },
    });

    if (!seat) {
      throw new NotFoundException('No exam seat or admit card found for this student and exam');
    }

    if (!seat.isAdmitted) {
      throw new ForbiddenException(
        'Admit card is barred due to attendance falling below the mandatory 75% threshold.',
      );
    }

    return {
      admitCard: {
        studentNumber: seat.student.studentNumber,
        studentName: seat.student.user.fullName,
        studentEmail: seat.student.user.email,
        program: seat.student.program.name,
        batch: seat.student.batch.code,
        examName: seat.exam.name,
        courseCode: seat.exam.course.code,
        courseTitle: seat.exam.course.title,
        credits: Number(seat.exam.course.credits),
        date: seat.exam.examDate.toISOString().split('T')[0],
        time: `${seat.exam.startTime} - ${seat.exam.endTime}`,
        duration: `${seat.exam.durationMinutes} mins`,
        venue: seat.exam.room ? `${seat.exam.room.building} - ${seat.exam.room.roomNumber}` : 'Main Hall',
        seatNumber: seat.seatNumber,
        qrToken: seat.admitCardQrToken,
        checkedInAt: seat.checkedInAt,
        rules: [
          'Bring university ID card along with this digital or printed admit card.',
          'Mobile phones, smartwatches, and programmable devices are strictly barred.',
          'Arrive at examination venue at least 15 minutes prior to scheduled start.',
          'Entry will not be permitted 30 minutes after commencement.',
        ],
      },
    };
  }

  async verifyAdmitCard(dto: VerifyAdmitCardDto) {
    const seat = await this.prisma.examSeat.findFirst({
      where: { admitCardQrToken: dto.token },
      include: {
        exam: { include: { course: true, room: true } },
        student: { include: { user: true } },
      },
    });

    if (!seat) {
      throw new NotFoundException('Invalid admit card QR token');
    }

    if (!seat.isAdmitted) {
      throw new ForbiddenException('Student is marked as ineligible / barred for this exam');
    }

    const updated = await this.prisma.examSeat.update({
      where: { id: seat.id },
      data: { checkedInAt: new Date() },
    });

    return {
      verified: true,
      studentName: seat.student.user.fullName,
      studentNumber: seat.student.studentNumber,
      courseCode: seat.exam.course.code,
      seatNumber: seat.seatNumber,
      checkedInAt: updated.checkedInAt,
    };
  }
}
