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
  CreateServiceRequestDto,
  UpdateServiceRequestStatusDto,
  VerifyDigitalIdDto,
} from './services.dto';

@Injectable()
export class UniversityServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getDigitalID(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        program: true,
        batch: true,
        digitalId: true,
        enrollments: {
          where: { deletedAt: null },
          select: { attendancePct: true },
        },
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    const cred = student.digitalId;
    if (!cred) throw new NotFoundException('Digital ID credential not issued for student');

    // Calculate rolling 30s token signature
    const timestamp = Math.floor(Date.now() / 30000);
    const tokenHash = crypto
      .createHmac('sha256', 'smartedu_digital_id_signing_key_secret')
      .update(`${student.id}:${cred.cardUuid}:${timestamp}`)
      .digest('hex')
      .slice(0, 16);

    const rollingQrToken = `smartedu_id_${cred.cardUuid}_${timestamp}_${tokenHash}`;

    // Average attendance
    const validPcts = student.enrollments.filter((e) => e.attendancePct != null).map((e) => Number(e.attendancePct));
    const avgAttendance = validPcts.length > 0 ? Math.round((validPcts.reduce((a, b) => a + b, 0) / validPcts.length) * 10) / 10 : 85.0;

    return {
      card: {
        studentId: student.id,
        fullName: student.user.fullName,
        studentNumber: student.studentNumber,
        programName: student.program.name,
        department: 'Computer Science & Engineering',
        batchCode: student.batch.code,
        cardUuid: cred.cardUuid,
        status: cred.status,
        issuedAt: cred.issuedAt,
        expiresAt: cred.expiresAt,
        bloodGroup: cred.bloodGroup ?? 'A+',
        emergencyPhone: cred.emergencyPhone ?? '+880 1711-234567',
        attendanceStanding: `${avgAttendance}%`,
        accessPermissions: {
          gate: cred.canAccessGate,
          library: cred.canAccessLibrary,
          labs: cred.canAccessLabs,
          hostel: cred.canAccessHostel,
        },
        rollingQrToken,
        refreshSecondsRemaining: 30 - (Math.floor(Date.now() / 1000) % 30),
      },
    };
  }

  async verifyDigitalId(dto: VerifyDigitalIdDto) {
    // Validate format: smartedu_id_<cardUuid>_<timestamp>_<hash>
    const parts = dto.qrToken.split('_');
    if (parts.length < 5 || parts[0] !== 'smartedu' || parts[1] !== 'id') {
      throw new BadRequestException('Invalid digital ID QR format');
    }

    const cardUuid = `${parts[2]}_${parts[3]}_${parts[4]}`;
    const cred = await this.prisma.digitalIDCredential.findFirst({
      where: { cardUuid: { contains: parts[2] } },
      include: {
        student: { include: { user: true, program: true } },
      },
    });

    if (!cred || cred.status !== 'ACTIVE') {
      throw new ForbiddenException('Digital ID is suspended or inactive');
    }

    if (new Date() > cred.expiresAt) {
      throw new ForbiddenException('Digital ID has expired');
    }

    return {
      verified: true,
      studentName: cred.student.user.fullName,
      studentNumber: cred.student.studentNumber,
      program: cred.student.program.name,
      bloodGroup: cred.bloodGroup,
      permissions: {
        gate: cred.canAccessGate,
        library: cred.canAccessLibrary,
        labs: cred.canAccessLabs,
        hostel: cred.canAccessHostel,
      },
      verifiedAt: new Date(),
    };
  }

  async getServiceRequests(institutionId: string, studentId?: string, status?: string) {
    return this.prisma.serviceRequest.findMany({
      where: {
        institutionId,
        ...(studentId ? { studentId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        student: { include: { user: true, program: true, batch: true } },
        assignedTo: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createServiceRequest(dto: CreateServiceRequestDto, auth: AuthContext) {
    const student = await this.prisma.student.findFirst({
      where: { userId: auth.userId },
    });
    if (!student) throw new ForbiddenException('Only students can submit service requests');

    const requestNumber = `SR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const req = await this.prisma.serviceRequest.create({
      data: {
        institutionId: auth.institutionId,
        studentId: student.id,
        requestType: dto.requestType,
        requestNumber,
        purpose: dto.purpose,
        feeAmount: dto.feeAmount ?? 15.0,
        isFeePaid: true,
        status: 'PENDING',
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'services',
      action: 'create',
      entityType: 'ServiceRequest',
      entityId: req.id,
      afterJson: { requestNumber, type: req.requestType },
    });

    return req;
  }

  async updateServiceRequestStatus(
    requestId: string,
    dto: UpdateServiceRequestStatusDto,
    auth: AuthContext,
  ) {
    const req = await this.prisma.serviceRequest.findUnique({
      where: { id: requestId },
    });
    if (!req) throw new NotFoundException('Service request not found');

    const updated = await this.prisma.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: dto.status,
        documentUrl: dto.documentUrl,
        remarks: dto.remarks,
        assignedToId: auth.userId,
        completedAt: dto.status === 'COMPLETED' ? new Date() : undefined,
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'services',
      action: 'edit',
      entityType: 'ServiceRequest',
      entityId: updated.id,
      afterJson: { status: updated.status, remarks: updated.remarks },
    });

    return updated;
  }
}
