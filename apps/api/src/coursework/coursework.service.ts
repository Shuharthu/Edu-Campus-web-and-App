import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import type { AuthContext } from '../common/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateAssignmentDto,
  CreateMaterialDto,
  GradeSubmissionDto,
  SubmitAssignmentDto,
} from './coursework.dto';

@Injectable()
export class CourseworkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getMaterials(courseId: string, sectionId?: string) {
    return this.prisma.courseMaterial.findMany({
      where: {
        courseId,
        ...(sectionId ? { OR: [{ sectionId }, { sectionId: null }] } : {}),
        deletedAt: null,
      },
      orderBy: [{ weekNumber: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async createMaterial(dto: CreateMaterialDto, auth: AuthContext) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) throw new NotFoundException('Course not found');

    const material = await this.prisma.courseMaterial.create({
      data: {
        courseId: dto.courseId,
        sectionId: dto.sectionId,
        title: dto.title,
        description: dto.description,
        fileUrl: dto.fileUrl,
        mimeType: dto.mimeType,
        weekNumber: dto.weekNumber,
        isPublished: dto.isPublished ?? true,
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'academics_setup',
      action: 'create',
      entityType: 'CourseMaterial',
      entityId: material.id,
      afterJson: { title: material.title, week: material.weekNumber },
    });

    return material;
  }

  async getAssignments(sectionId: string, studentId?: string) {
    const assignments = await this.prisma.assignment.findMany({
      where: { sectionId, deletedAt: null },
      include: {
        submissions: studentId
          ? {
              where: { studentId },
              include: { gradedBy: { include: { user: true } } },
            }
          : {
              include: {
                student: { include: { user: true } },
                gradedBy: { include: { user: true } },
              },
            },
      },
      orderBy: { dueAt: 'asc' },
    });

    return assignments;
  }

  async createAssignment(dto: CreateAssignmentDto, auth: AuthContext) {
    const section = await this.prisma.section.findUnique({
      where: { id: dto.sectionId },
    });
    if (!section) throw new NotFoundException('Section not found');

    const assignment = await this.prisma.assignment.create({
      data: {
        sectionId: dto.sectionId,
        title: dto.title,
        description: dto.description,
        dueAt: new Date(dto.dueAt),
        maxPoints: dto.maxPoints ?? 100,
        weightagePct: dto.weightagePct ?? 10,
        latePolicy: dto.latePolicy ?? 'REJECT',
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'academics_setup',
      action: 'create',
      entityType: 'Assignment',
      entityId: assignment.id,
      afterJson: { title: assignment.title, dueAt: assignment.dueAt },
    });

    return assignment;
  }

  async submitAssignment(dto: SubmitAssignmentDto, auth: AuthContext) {
    const student = await this.prisma.student.findFirst({
      where: { userId: auth.userId },
    });
    if (!student) throw new ForbiddenException('Only students can submit assignments');

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: dto.assignmentId },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    const isLate = new Date() > assignment.dueAt;
    if (isLate && assignment.latePolicy === 'REJECT') {
      throw new BadRequestException('The deadline for this assignment has passed and late submissions are rejected.');
    }

    const submission = await this.prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: dto.assignmentId,
          studentId: student.id,
        },
      },
      update: {
        fileUrl: dto.fileUrl,
        content: dto.content,
        submittedAt: new Date(),
        isLate,
      },
      create: {
        assignmentId: dto.assignmentId,
        studentId: student.id,
        fileUrl: dto.fileUrl,
        content: dto.content,
        submittedAt: new Date(),
        isLate,
      },
    });

    return submission;
  }

  async gradeSubmission(submissionId: string, dto: GradeSubmissionDto, auth: AuthContext) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: true },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    if (dto.score > submission.assignment.maxPoints) {
      throw new BadRequestException(`Score cannot exceed max points (${submission.assignment.maxPoints})`);
    }

    const faculty = await this.prisma.facultyMember.findFirst({
      where: { userId: auth.userId },
    });

    const graded = await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: dto.score,
        feedback: dto.feedback,
        gradedById: faculty?.id,
        gradedAt: new Date(),
      },
    });

    return graded;
  }
}
