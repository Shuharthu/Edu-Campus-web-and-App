import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { detectTimetableClashes } from './clash-detector';
import { CreateTimetableSlotDto } from './dto/timetable.dto';

@Injectable()
export class AcademicService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  async getCatalog(campusId: string) {
    const [faculties, departments, programs, batches, semesters, rooms] = await Promise.all([
      this.prisma.faculty.findMany({
        where: { campusId, deletedAt: null },
        include: {
          deanUser: { select: { id: true, fullName: true, email: true } },
          departments: {
            where: { deletedAt: null },
            select: { id: true, code: true, name: true },
          },
        },
        orderBy: { code: 'asc' },
      }),
      this.prisma.department.findMany({
        where: { campusId, deletedAt: null },
        include: {
          headUser: { select: { id: true, fullName: true, email: true } },
          faculty: { select: { id: true, code: true, name: true } },
          programs: {
            where: { deletedAt: null },
            select: { id: true, code: true, name: true, degreeLevel: true, totalCredits: true },
          },
        },
        orderBy: { code: 'asc' },
      }),
      this.prisma.program.findMany({
        where: { campusId, deletedAt: null },
        include: {
          department: { select: { id: true, code: true, name: true } },
          batches: {
            where: { deletedAt: null },
            select: { id: true, code: true, intakeYear: true, status: true },
          },
        },
        orderBy: { code: 'asc' },
      }),
      this.prisma.batch.findMany({
        where: { campusId, deletedAt: null },
        include: {
          program: { select: { id: true, code: true, name: true } },
        },
        orderBy: { intakeYear: 'desc' },
      }),
      this.prisma.semester.findMany({
        where: { campusId, deletedAt: null },
        orderBy: { startsAt: 'desc' },
      }),
      this.prisma.room.findMany({
        where: { campusId, deletedAt: null },
        orderBy: [{ building: 'asc' }, { roomNumber: 'asc' }],
      }),
    ]);

    return { faculties, departments, programs, batches, semesters, rooms };
  }

  async getTimetableSlots(campusId: string, semesterId?: string, departmentId?: string) {
    const where: any = {
      campusId,
      deletedAt: null,
    };

    if (semesterId) {
      where.section = {
        courseOffering: {
          semesterId,
        },
      };
    }

    if (departmentId) {
      where.section = {
        ...where.section,
        courseOffering: {
          ...where.section?.courseOffering,
          course: {
            departmentId,
          },
        },
      };
    }

    const slots = await this.prisma.timetableSlot.findMany({
      where,
      include: {
        room: true,
        facultyMember: {
          include: {
            user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
            department: { select: { id: true, code: true, name: true } },
          },
        },
        section: {
          include: {
            batch: true,
            courseOffering: {
              include: {
                course: true,
                semester: true,
              },
            },
            _count: {
              select: { enrollments: true },
            },
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return slots;
  }

  async checkClashes(campusId: string, semesterId?: string) {
    const slots = await this.getTimetableSlots(campusId, semesterId);
    const clashes = detectTimetableClashes(slots as any);
    return {
      hasClashes: clashes.length > 0,
      totalClashes: clashes.length,
      clashes,
    };
  }

  async createSlot(dto: CreateTimetableSlotDto) {
    const section = await this.prisma.section.findUnique({
      where: { id: dto.sectionId },
      include: { courseOffering: true },
    });
    if (!section) throw new NotFoundException('Section not found');

    const room = await this.prisma.room.findUnique({ where: { id: dto.roomId } });
    if (!room) throw new NotFoundException('Room not found');

    const faculty = await this.prisma.facultyMember.findUnique({
      where: { id: dto.facultyMemberId },
    });
    if (!faculty) throw new NotFoundException('Faculty member not found');

    const slot = await this.prisma.timetableSlot.create({
      data: {
        institutionId: section.institutionId,
        campusId: dto.campusId,
        sectionId: dto.sectionId,
        roomId: dto.roomId,
        facultyMemberId: dto.facultyMemberId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        slotStatus: dto.slotStatus ?? 'CONFIRMED',
        isPublished: true,
      },
      include: {
        room: true,
        facultyMember: { include: { user: true } },
        section: {
          include: {
            courseOffering: { include: { course: true } },
          },
        },
      },
    });

    // Emit event
    this.realtime.server?.emit('class.rescheduled', {
      slotId: slot.id,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      room: slot.room.roomNumber,
      courseCode: slot.section.courseOffering.course.code,
    });

    return slot;
  }

  async publishTimetable(campusId: string, semesterId?: string) {
    const where: any = { campusId };
    if (semesterId) {
      where.section = { courseOffering: { semesterId } };
    }

    const result = await this.prisma.timetableSlot.updateMany({
      where,
      data: { isPublished: true },
    });

    // Emit live WebSocket notification across campus
    this.realtime.server?.emit('timetable.published', {
      campusId,
      semesterId,
      publishedAt: new Date().toISOString(),
      updatedCount: result.count,
    });

    return {
      success: true,
      publishedCount: result.count,
      message: `Successfully published ${result.count} timetable slots.`,
    };
  }
}
