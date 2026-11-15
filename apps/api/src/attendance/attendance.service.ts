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
  AttendanceCheckInDto,
  AttendanceCorrectionDto,
  CreateAttendanceSessionDto,
  DecideCorrectionDto,
} from './attendance.dto';

// Haversine formula to calculate distance in meters between two coordinates
function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createSession(dto: CreateAttendanceSessionDto, auth: AuthContext) {
    const faculty = await this.prisma.facultyMember.findFirst({
      where: { userId: auth.userId },
    });
    if (!faculty) {
      throw new ForbiddenException('Only faculty members can launch attendance sessions');
    }

    const section = await this.prisma.section.findUnique({
      where: { id: dto.sectionId },
      include: { courseOffering: { include: { course: true } } },
    });
    if (!section) throw new NotFoundException('Section not found');

    // Close any previous open session for this section
    await this.prisma.attendanceSession.updateMany({
      where: { sectionId: dto.sectionId, status: 'OPEN' },
      data: { status: 'CLOSED', closedAt: new Date() },
    });

    // Generate rotating token and 6-digit random short code
    const token = `smartedu_att_${crypto.randomBytes(16).toString('hex')}`;
    const shortCode = Math.floor(100000 + Math.random() * 900000).toString();

    const session = await this.prisma.attendanceSession.create({
      data: {
        sectionId: dto.sectionId,
        facultyId: faculty.id,
        slotId: dto.slotId,
        token,
        shortCode,
        status: 'OPEN',
        geofenceLat: dto.geofenceLat,
        geofenceLng: dto.geofenceLng,
        geofenceRadiusMeters: dto.geofenceRadiusMeters ?? 50,
        bleUuid: dto.bleUuid,
        startedAt: new Date(),
      },
      include: {
        section: { include: { courseOffering: { include: { course: true } } } },
        faculty: { include: { user: true } },
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'attendance',
      action: 'create',
      entityType: 'AttendanceSession',
      entityId: session.id,
      afterJson: {
        sectionCode: section.sectionCode,
        courseCode: section.courseOffering.course.code,
        shortCode,
      },
    });

    return session;
  }

  async getActiveSession(sectionId: string) {
    const session = await this.prisma.attendanceSession.findFirst({
      where: { sectionId, status: 'OPEN' },
      include: {
        section: {
          include: {
            courseOffering: { include: { course: true } },
            enrollments: { include: { student: { include: { user: true } } } },
          },
        },
        records: { include: { student: { include: { user: true } } } },
        faculty: { include: { user: true } },
      },
    });

    if (!session) return null;

    const totalEnrolled = session.section.enrollments.length;
    const presentCount = session.records.filter((r) => r.status === 'PRESENT').length;
    const attendancePct = totalEnrolled > 0 ? Math.round((presentCount / totalEnrolled) * 1000) / 10 : 0;

    return {
      session,
      tally: {
        totalEnrolled,
        presentCount,
        attendancePct,
      },
    };
  }

  async checkIn(dto: AttendanceCheckInDto, auth: AuthContext) {
    if (!dto.token && !dto.shortCode) {
      throw new BadRequestException('Either QR token or 6-digit short code is required');
    }

    const student = await this.prisma.student.findFirst({
      where: { userId: auth.userId },
    });
    if (!student) {
      throw new ForbiddenException('Only registered students can check in to attendance sessions');
    }

    // Find matching open session
    const session = await this.prisma.attendanceSession.findFirst({
      where: {
        status: 'OPEN',
        OR: [
          ...(dto.token ? [{ token: dto.token }] : []),
          ...(dto.shortCode ? [{ shortCode: dto.shortCode }] : []),
        ],
      },
      include: {
        section: { include: { courseOffering: { include: { course: true } } } },
      },
    });

    if (!session) {
      throw new NotFoundException('No active attendance session matches the provided code or token');
    }

    // Verify student is enrolled in this section
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        studentId_sectionId: {
          studentId: student.id,
          sectionId: session.sectionId,
        },
      },
    });
    if (!enrollment) {
      throw new ForbiddenException('You are not registered in this class section');
    }

    // Optional geofence validation
    if (
      session.geofenceLat != null &&
      session.geofenceLng != null &&
      dto.latitude != null &&
      dto.longitude != null
    ) {
      const distance = calculateDistanceMeters(
        session.geofenceLat,
        session.geofenceLng,
        dto.latitude,
        dto.longitude,
      );
      const radius = session.geofenceRadiusMeters ?? 50;
      if (distance > radius) {
        throw new BadRequestException(
          `Location check failed. You are ${Math.round(distance)}m away from classroom (allowed radius: ${radius}m).`,
        );
      }
    }

    // Create or update AttendanceRecord
    const record = await this.prisma.attendanceRecord.upsert({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId: student.id,
        },
      },
      update: {
        status: 'PRESENT',
        verifiedVia: dto.token ? 'QR_ROTATING' : 'SHORT_CODE',
        verifiedAt: new Date(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        notes: dto.notes,
      },
      create: {
        sessionId: session.id,
        studentId: student.id,
        status: 'PRESENT',
        verifiedVia: dto.token ? 'QR_ROTATING' : 'SHORT_CODE',
        verifiedAt: new Date(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        notes: dto.notes,
      },
    });

    // Recalculate student's section attendance percentage
    await this.recalculateStudentAttendance(student.id, session.sectionId);

    return {
      success: true,
      message: `Checked in to ${session.section.courseOffering.course.code} (${session.section.sectionCode})`,
      verifiedVia: record.verifiedVia,
      verifiedAt: record.verifiedAt,
    };
  }

  async closeSession(sessionId: string, auth: AuthContext) {
    const session = await this.prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        section: {
          include: {
            enrollments: true,
            courseOffering: { include: { course: true } },
          },
        },
      },
    });
    if (!session) throw new NotFoundException('Session not found');

    await this.prisma.attendanceSession.update({
      where: { id: sessionId },
      data: { status: 'CLOSED', closedAt: new Date() },
    });

    // Mark all enrolled students without a record as ABSENT
    const existingRecords = await this.prisma.attendanceRecord.findMany({
      where: { sessionId },
      select: { studentId: true },
    });
    const recordedIds = new Set(existingRecords.map((r) => r.studentId));

    const absentStudentIds = session.section.enrollments
      .filter((e) => !recordedIds.has(e.studentId))
      .map((e) => e.studentId);

    if (absentStudentIds.length > 0) {
      await this.prisma.attendanceRecord.createMany({
        data: absentStudentIds.map((studentId) => ({
          sessionId,
          studentId,
          status: 'ABSENT',
          verifiedVia: 'MANUAL_OVERRIDE',
        })),
        skipDuplicates: true,
      });

      // Recalculate attendance for newly marked absent students
      for (const stId of absentStudentIds) {
        await this.recalculateStudentAttendance(stId, session.sectionId);
      }
    }

    return {
      sessionId,
      status: 'CLOSED',
      totalEnrolled: session.section.enrollments.length,
      absentMarkedCount: absentStudentIds.length,
    };
  }

  async getDefaulters(threshold = 75, campusId?: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        deletedAt: null,
        ...(campusId ? { campusId } : {}),
      },
      include: {
        student: { include: { user: true, program: true, batch: true } },
        section: { include: { courseOffering: { include: { course: true } } } },
      },
    });

    const defaulters = enrollments
      .filter((e) => {
        const pct = e.attendancePct ? Number(e.attendancePct) : 100;
        return pct < threshold;
      })
      .map((e) => ({
        enrollmentId: e.id,
        studentId: e.student.id,
        studentNumber: e.student.studentNumber,
        studentName: e.student.user.fullName,
        studentEmail: e.student.user.email,
        programCode: e.student.program.code,
        batchCode: e.student.batch.code,
        courseCode: e.section.courseOffering.course.code,
        courseTitle: e.section.courseOffering.course.title,
        sectionCode: e.section.sectionCode,
        attendancePct: e.attendancePct ? Number(e.attendancePct) : 0,
        shortfallPct: Math.round((threshold - (e.attendancePct ? Number(e.attendancePct) : 0)) * 10) / 10,
        isCritical: (e.attendancePct ? Number(e.attendancePct) : 0) < 65,
      }));

    return {
      threshold,
      totalDefaulters: defaulters.length,
      defaulters,
    };
  }

  async submitCorrection(dto: AttendanceCorrectionDto, auth: AuthContext) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id: dto.recordId },
    });
    if (!record) throw new NotFoundException('Attendance record not found');

    const correction = await this.prisma.attendanceCorrection.create({
      data: {
        recordId: dto.recordId,
        previousStatus: dto.previousStatus,
        newStatus: dto.newStatus,
        reason: dto.reason,
        requestedById: auth.userId,
        status: 'PENDING',
      },
    });

    return correction;
  }

  async decideCorrection(correctionId: string, dto: DecideCorrectionDto, auth: AuthContext) {
    const correction = await this.prisma.attendanceCorrection.findUnique({
      where: { id: correctionId },
      include: { record: { include: { session: true } } },
    });
    if (!correction) throw new NotFoundException('Correction request not found');

    const updated = await this.prisma.attendanceCorrection.update({
      where: { id: correctionId },
      data: {
        status: dto.approved ? 'APPROVED' : 'REJECTED',
        approvedById: auth.userId,
      },
    });

    if (dto.approved) {
      await this.prisma.attendanceRecord.update({
        where: { id: correction.recordId },
        data: { status: correction.newStatus },
      });

      await this.recalculateStudentAttendance(
        correction.record.studentId,
        correction.record.session.sectionId,
      );
    }

    return updated;
  }

  private async recalculateStudentAttendance(studentId: string, sectionId: string) {
    const totalSessions = await this.prisma.attendanceSession.count({
      where: { sectionId },
    });
    if (totalSessions === 0) return;

    const presentCount = await this.prisma.attendanceRecord.count({
      where: {
        studentId,
        session: { sectionId },
        status: { in: ['PRESENT', 'EXCUSED'] },
      },
    });

    const attendancePct = Math.round((presentCount / totalSessions) * 1000) / 10;

    await this.prisma.enrollment.updateMany({
      where: { studentId, sectionId },
      data: { attendancePct },
    });
  }
}
