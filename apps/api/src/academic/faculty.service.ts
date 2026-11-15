import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacultyService {
  constructor(private readonly prisma: PrismaService) {}

  async listFaculty(campusId: string, departmentId?: string) {
    const where: any = {
      campusId,
      deletedAt: null,
    };
    if (departmentId) {
      where.departmentId = departmentId;
    }

    const members = await this.prisma.facultyMember.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        department: { select: { id: true, code: true, name: true } },
        sections: {
          where: { deletedAt: null },
          include: {
            courseOffering: { include: { course: true } },
            _count: { select: { enrollments: true } },
          },
        },
      },
      orderBy: [{ department: { code: 'asc' } }, { designation: 'asc' }],
    });

    return members.map((m) => {
      const activeSections = m.sections.map((s) => ({
        sectionId: s.id,
        sectionCode: s.sectionCode,
        courseCode: s.courseOffering.course.code,
        courseTitle: s.courseOffering.course.title,
        enrolledCount: s._count.enrollments,
      }));

      return {
        id: m.id,
        employeeNumber: m.employeeNumber,
        fullName: m.user.fullName,
        email: m.user.email,
        avatarUrl: m.user.avatarUrl,
        departmentCode: m.department.code,
        departmentName: m.department.name,
        designation: m.designation,
        officeRoom: m.officeRoom ?? 'N/A',
        maxWeeklyHours: m.maxWeeklyHours,
        assignedSectionsCount: activeSections.length,
        activeSections,
      };
    });
  }

  async getFacultySchedule(facultyMemberId: string) {
    const member = await this.prisma.facultyMember.findUnique({
      where: { id: facultyMemberId },
      include: {
        user: { select: { fullName: true } },
      },
    });
    if (!member) throw new NotFoundException('Faculty member not found');

    const slots = await this.prisma.timetableSlot.findMany({
      where: {
        facultyMemberId,
        deletedAt: null,
      },
      include: {
        room: true,
        section: {
          include: {
            batch: true,
            courseOffering: {
              include: { course: true },
            },
            _count: { select: { enrollments: true } },
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return {
      facultyMemberId,
      fullName: member.user.fullName,
      slots: slots.map((s) => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        roomNumber: s.room.roomNumber,
        building: s.room.building,
        courseCode: s.section.courseOffering.course.code,
        courseTitle: s.section.courseOffering.course.title,
        sectionCode: s.section.sectionCode,
        enrolledCount: s.section._count.enrollments,
      })),
    };
  }
}
