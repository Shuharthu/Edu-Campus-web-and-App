import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import type { AuthContext } from '../common/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import type {
  AllocateHostelDto,
  CreateMaintenanceTicketDto,
  UpdateMaintenanceTicketDto,
} from './dto/operations.dto';

@Injectable()
export class OperationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // 1. Hostel Allocations
  async getHostelRooms(institutionId: string) {
    return this.prisma.hostelRoom.findMany({
      where: { institutionId },
      include: {
        allocations: {
          where: { status: 'ACTIVE' },
          include: {
            student: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: [{ buildingName: 'asc' }, { roomNumber: 'asc' }],
    });
  }

  async getStudentHostelAllocation(studentId: string) {
    return this.prisma.hostelAllocation.findFirst({
      where: { studentId, status: 'ACTIVE' },
      include: {
        room: true,
      },
    });
  }

  async allocateHostel(institutionId: string, dto: AllocateHostelDto, auth: AuthContext) {
    const room = await this.prisma.hostelRoom.findFirst({
      where: { id: dto.roomId, institutionId },
    });

    if (!room) {
      throw new NotFoundException('Hostel room not found');
    }

    if (room.occupied >= room.capacity) {
      throw new BadRequestException('Hostel room is already at full capacity');
    }

    const student = await this.prisma.student.findFirst({
      where: { id: dto.studentId, institutionId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const [allocation, updatedRoom] = await this.prisma.$transaction([
      this.prisma.hostelAllocation.create({
        data: {
          roomId: room.id,
          studentId: student.id,
          status: 'ACTIVE',
        },
        include: {
          room: true,
          student: { include: { user: true } },
        },
      }),
      this.prisma.hostelRoom.update({
        where: { id: room.id },
        data: {
          occupied: { increment: 1 },
        },
      }),
    ]);

    await this.auditService.logFromAuth(auth, {
      module: 'operations',
      action: 'create',
      entityType: 'HostelAllocation',
      entityId: allocation.id,
      afterJson: { building: room.buildingName, roomNumber: room.roomNumber, studentId: student.id },
    });

    return { allocation, updatedRoom };
  }

  // 2. Transport Routes
  async getTransportRoutes(institutionId: string) {
    return this.prisma.transportRoute.findMany({
      where: { institutionId },
      orderBy: { routeNumber: 'asc' },
    });
  }

  // 3. Maintenance Tickets
  async getMaintenanceTickets(institutionId: string, status?: string) {
    const where: any = { institutionId };
    if (status && status !== 'ALL') {
      where.status = status;
    }

    return this.prisma.maintenanceTicket.findMany({
      where,
      include: {
        reportedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createMaintenanceTicket(
    institutionId: string,
    dto: CreateMaintenanceTicketDto,
    auth: AuthContext,
  ) {
    const ticket = await this.prisma.maintenanceTicket.create({
      data: {
        institutionId,
        reportedById: auth.userId,
        location: dto.location,
        category: dto.category,
        description: dto.description,
        priority: dto.priority ?? 'MEDIUM',
        status: 'OPEN',
      },
      include: {
        reportedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'operations',
      action: 'create',
      entityType: 'MaintenanceTicket',
      entityId: ticket.id,
      afterJson: { location: ticket.location, category: ticket.category, priority: ticket.priority },
    });

    return ticket;
  }

  async updateMaintenanceTicket(
    institutionId: string,
    ticketId: string,
    dto: UpdateMaintenanceTicketDto,
    auth: AuthContext,
  ) {
    const ticket = await this.prisma.maintenanceTicket.findFirst({
      where: { id: ticketId, institutionId },
    });

    if (!ticket) {
      throw new NotFoundException('Maintenance ticket not found');
    }

    const data: any = {};
    if (dto.status) {
      data.status = dto.status;
      if (dto.status === 'RESOLVED') {
        data.resolvedAt = new Date();
      }
    }
    if (dto.assignedTo !== undefined) {
      data.assignedTo = dto.assignedTo;
    }

    const updated = await this.prisma.maintenanceTicket.update({
      where: { id: ticket.id },
      data,
      include: {
        reportedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'operations',
      action: 'update',
      entityType: 'MaintenanceTicket',
      entityId: updated.id,
      afterJson: { status: updated.status, assignedTo: updated.assignedTo },
    });

    return updated;
  }

  // 4. Operations Overview Telemetry
  async getOperationsStats(institutionId: string) {
    const [totalBeds, occupiedBeds, activeRoutes, openTickets] = await Promise.all([
      this.prisma.hostelRoom.aggregate({
        where: { institutionId },
        _sum: { capacity: true },
      }),
      this.prisma.hostelRoom.aggregate({
        where: { institutionId },
        _sum: { occupied: true },
      }),
      this.prisma.transportRoute.count({
        where: { institutionId },
      }),
      this.prisma.maintenanceTicket.count({
        where: { institutionId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
    ]);

    const totalCapacity = totalBeds._sum.capacity ?? 0;
    const occupied = occupiedBeds._sum.occupied ?? 0;
    const occupancyRate = totalCapacity > 0 ? (occupied / totalCapacity) * 100 : 0;

    return {
      hostelCapacity: totalCapacity,
      hostelOccupied: occupied,
      hostelOccupancyRate: Math.round(occupancyRate * 10) / 10,
      activeRoutes,
      openTickets,
    };
  }

  // 5. Campus Management
  async getCampuses(institutionId: string) {
    const campuses = await this.prisma.campus.findMany({
      where: { institutionId, deletedAt: null },
      include: {
        _count: {
          select: {
            departments: true,
            programs: true,
            rooms: true,
            students: true,
            roleAssignments: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return campuses.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      address: c.address,
      timezone: c.timezone,
      isActive: c.isActive,
      createdAt: c.createdAt,
      stats: {
        departments: c._count.departments,
        programs: c._count.programs,
        rooms: c._count.rooms,
        students: c._count.students,
        staff: c._count.roleAssignments,
      },
    }));
  }

  async createCampus(
    institutionId: string,
    data: { code: string; name: string; address?: string; timezone?: string },
    auth: AuthContext,
  ) {
    const campus = await this.prisma.campus.create({
      data: {
        institutionId,
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        address: data.address?.trim() || null,
        timezone: data.timezone || 'UTC',
        isActive: true,
      },
    });

    await this.auditService.log({
      institutionId,
      actorId: auth.userId,
      roleSlug: auth.roleSlug,
      scopeUsed: auth.scopeType,
      module: 'campus',
      action: 'create_campus',
      entityType: 'Campus',
      entityId: campus.id,
      afterJson: { code: campus.code, name: campus.name },
    });

    return campus;
  }

  async updateCampus(
    id: string,
    data: { name?: string; address?: string; timezone?: string; isActive?: boolean },
    auth: AuthContext,
  ) {
    const campus = await this.prisma.campus.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name.trim() } : {}),
        ...(data.address !== undefined ? { address: data.address?.trim() || null } : {}),
        ...(data.timezone !== undefined ? { timezone: data.timezone } : {}),
        ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      },
    });

    await this.auditService.log({
      institutionId: auth.institutionId,
      actorId: auth.userId,
      roleSlug: auth.roleSlug,
      scopeUsed: auth.scopeType,
      module: 'campus',
      action: 'update_campus',
      entityType: 'Campus',
      entityId: campus.id,
      afterJson: data,
    });

    return campus;
  }
}
