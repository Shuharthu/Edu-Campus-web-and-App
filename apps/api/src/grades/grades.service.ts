import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import type { AuthContext } from '../common/auth.types';
import { PrismaService } from '../prisma/prisma.service';
import {
  calculateCourseGrade,
  calculateCumulativeGpa,
  calculateTermGpa,
  checkExamEligibility,
  DEFAULT_GRADE_SCALE,
  type GradeScaleItemDef,
} from './cgpa-calculator';
import type {
  ApproveModerationDto,
  CreateAssessmentDto,
  EnterScoreDto,
  PublishGradesDto,
  SubmitModerationDto,
} from './grades.dto';

@Injectable()
export class GradesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getGradeScale(institutionId: string): Promise<GradeScaleItemDef[]> {
    const scale = await this.prisma.gradeScale.findFirst({
      where: { institutionId, isDefault: true },
      include: {
        items: {
          orderBy: { minPercent: 'desc' },
        },
      },
    });

    if (!scale || scale.items.length === 0) {
      return DEFAULT_GRADE_SCALE;
    }

    return scale.items.map((item) => ({
      letter: item.letter,
      minPercent: item.minPercent,
      maxPercent: item.maxPercent,
      gradePoint: item.gradePoint,
    }));
  }

  async getSectionGradeSheet(sectionId: string) {
    const section = await this.prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        courseOffering: {
          include: {
            course: true,
            semester: true,
          },
        },
        enrollments: {
          where: { deletedAt: null },
          include: {
            student: {
              include: {
                user: true,
                program: true,
                batch: true,
              },
            },
          },
        },
        assessments: {
          where: { deletedAt: null },
          include: {
            scores: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    const cutoffs = await this.getGradeScale(section.institutionId);

    // Get moderation status
    const moderation = await this.prisma.gradeModeration.findUnique({
      where: {
        sectionId_semesterId: {
          sectionId: section.id,
          semesterId: section.courseOffering.semesterId,
        },
      },
      include: {
        submittedBy: { select: { fullName: true, email: true } },
        approvedBy: { select: { fullName: true, email: true } },
      },
    });

    // Compute grades for all enrolled students
    const studentRows = section.enrollments.map((enr) => {
      const student = enr.student;
      const scoresMap: Record<string, { score: number; isAbsent: boolean; remarks?: string | null }> = {};
      const assessmentInputs: { score: number; maxScore: number; weightagePct: number }[] = [];

      let hasMidtermRisk = false;

      for (const assessment of section.assessments) {
        const scoreRecord = assessment.scores.find((s) => s.studentId === student.id);
        const score = scoreRecord ? scoreRecord.score : 0;
        const isAbsent = scoreRecord ? scoreRecord.isAbsent : false;

        scoresMap[assessment.id] = {
          score,
          isAbsent,
          remarks: scoreRecord?.remarks,
        };

        assessmentInputs.push({
          score,
          maxScore: assessment.maxScore,
          weightagePct: assessment.weightagePct,
        });

        // Mockup risk indicator: Midterm under 60%
        if (
          assessment.name.toLowerCase().includes('midterm') &&
          assessment.maxScore > 0 &&
          (score / assessment.maxScore) * 100 < 60
        ) {
          hasMidtermRisk = true;
        }
      }

      const calculated = calculateCourseGrade(assessmentInputs, cutoffs);

      return {
        studentId: student.id,
        studentNumber: student.studentNumber,
        studentName: student.user.fullName,
        studentEmail: student.user.email,
        programCode: student.program.code,
        batchCode: student.batch.code,
        attendancePct: enr.attendancePct ? Number(enr.attendancePct) : 100,
        scores: scoresMap,
        totalPercentage: calculated.totalPercentage,
        letterGrade: calculated.letter,
        gradePoint: calculated.gradePoint,
        hasRiskWarning: hasMidtermRisk || calculated.totalPercentage < 60,
        riskReason: hasMidtermRisk ? 'Midterm score < 60%' : undefined,
      };
    });

    // Score distribution calculation
    const distribution: Record<string, number> = {};
    for (const c of cutoffs) {
      distribution[c.letter] = 0;
    }

    let sumPercent = 0;
    let highestPercent = 0;
    let lowestPercent = 100;

    for (const row of studentRows) {
      const letter = row.letterGrade;
      distribution[letter] = (distribution[letter] || 0) + 1;
      sumPercent += row.totalPercentage;
      if (row.totalPercentage > highestPercent) highestPercent = row.totalPercentage;
      if (row.totalPercentage < lowestPercent) lowestPercent = row.totalPercentage;
    }

    const averagePercent = studentRows.length > 0 ? Math.round((sumPercent / studentRows.length) * 10) / 10 : 0;

    return {
      section: {
        id: section.id,
        sectionCode: section.sectionCode,
        courseCode: section.courseOffering.course.code,
        courseTitle: section.courseOffering.course.title,
        credits: Number(section.courseOffering.course.credits),
        semesterName: section.courseOffering.semester.name,
        semesterId: section.courseOffering.semesterId,
      },
      assessments: section.assessments.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        maxScore: a.maxScore,
        weightagePct: a.weightagePct,
      })),
      moderation: moderation
        ? {
            id: moderation.id,
            status: moderation.status,
            submittedBy: moderation.submittedBy?.fullName,
            approvedBy: moderation.approvedBy?.fullName,
            publishedAt: moderation.publishedAt,
            comments: moderation.comments,
          }
        : {
            status: 'DRAFT',
            submittedBy: null,
            approvedBy: null,
            publishedAt: null,
            comments: null,
          },
      students: studentRows,
      stats: {
        totalEnrolled: studentRows.length,
        averagePercent,
        highestPercent,
        lowestPercent: studentRows.length > 0 ? lowestPercent : 0,
        distribution,
      },
    };
  }

  async createAssessment(dto: CreateAssessmentDto, auth: AuthContext) {
    const section = await this.prisma.section.findUnique({
      where: { id: dto.sectionId },
      include: {
        assessments: { where: { deletedAt: null } },
      },
    });
    if (!section) throw new NotFoundException('Section not found');

    const currentTotalWeight = section.assessments.reduce((sum, a) => sum + a.weightagePct, 0);
    if (currentTotalWeight + dto.weightagePct > 100.01) {
      throw new BadRequestException(
        `Total weightage cannot exceed 100%. Current total: ${currentTotalWeight}%, added: ${dto.weightagePct}%`,
      );
    }

    const assessment = await this.prisma.assessment.create({
      data: {
        sectionId: dto.sectionId,
        name: dto.name,
        type: dto.type,
        maxScore: dto.maxScore,
        weightagePct: dto.weightagePct,
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'grades',
      action: 'create',
      entityType: 'Assessment',
      entityId: assessment.id,
      afterJson: { name: assessment.name, weightagePct: assessment.weightagePct },
    });

    return assessment;
  }

  async enterScore(dto: EnterScoreDto, auth: AuthContext) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: dto.assessmentId },
      include: { section: true },
    });
    if (!assessment) throw new NotFoundException('Assessment not found');

    if (dto.score > assessment.maxScore) {
      throw new BadRequestException(`Score (${dto.score}) cannot exceed maximum score (${assessment.maxScore})`);
    }

    const faculty = await this.prisma.facultyMember.findFirst({
      where: { userId: auth.userId },
    });

    const scoreRecord = await this.prisma.studentAssessmentScore.upsert({
      where: {
        assessmentId_studentId: {
          assessmentId: dto.assessmentId,
          studentId: dto.studentId,
        },
      },
      update: {
        score: dto.score,
        isAbsent: dto.isAbsent ?? false,
        remarks: dto.remarks,
        enteredById: faculty?.id,
      },
      create: {
        assessmentId: dto.assessmentId,
        studentId: dto.studentId,
        score: dto.score,
        isAbsent: dto.isAbsent ?? false,
        remarks: dto.remarks,
        enteredById: faculty?.id,
      },
    });

    return scoreRecord;
  }

  async submitModeration(dto: SubmitModerationDto, auth: AuthContext) {
    const moderation = await this.prisma.gradeModeration.upsert({
      where: {
        sectionId_semesterId: {
          sectionId: dto.sectionId,
          semesterId: dto.semesterId,
        },
      },
      update: {
        status: 'SUBMITTED_TO_HEAD',
        submittedById: auth.userId,
        comments: dto.comments,
      },
      create: {
        sectionId: dto.sectionId,
        semesterId: dto.semesterId,
        status: 'SUBMITTED_TO_HEAD',
        submittedById: auth.userId,
        comments: dto.comments,
      },
    });

    return moderation;
  }

  async approveModeration(dto: ApproveModerationDto, auth: AuthContext) {
    const moderation = await this.prisma.gradeModeration.findUnique({
      where: {
        sectionId_semesterId: {
          sectionId: dto.sectionId,
          semesterId: dto.semesterId,
        },
      },
    });
    if (!moderation) throw new NotFoundException('Grade sheet has not been submitted for moderation');

    const updated = await this.prisma.gradeModeration.update({
      where: { id: moderation.id },
      data: {
        status: 'APPROVED_BY_DEAN',
        approvedById: auth.userId,
        comments: dto.comments ?? moderation.comments,
      },
    });

    return updated;
  }

  async publishGrades(dto: PublishGradesDto, auth: AuthContext) {
    const moderation = await this.prisma.gradeModeration.findUnique({
      where: {
        sectionId_semesterId: {
          sectionId: dto.sectionId,
          semesterId: dto.semesterId,
        },
      },
      include: {
        section: {
          include: {
            enrollments: true,
            courseOffering: { include: { course: true } },
          },
        },
      },
    });
    if (!moderation) throw new NotFoundException('Grade moderation record not found');

    const updatedModeration = await this.prisma.gradeModeration.update({
      where: { id: moderation.id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    // Update semester results for all enrolled students
    const cutoffs = await this.getGradeScale(moderation.section.institutionId);

    for (const enrollment of moderation.section.enrollments) {
      await this.recalculateSemesterResult(enrollment.studentId, dto.semesterId, cutoffs);
    }

    return updatedModeration;
  }

  async recalculateSemesterResult(studentId: string, semesterId: string, cutoffs: GradeScaleItemDef[]) {
    // Find all sections enrolled in this semester
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        studentId,
        section: { courseOffering: { semesterId } },
        deletedAt: null,
      },
      include: {
        section: {
          include: {
            courseOffering: { include: { course: true } },
            assessments: {
              where: { deletedAt: null },
              include: { scores: { where: { studentId } } },
            },
          },
        },
      },
    });

    if (enrollments.length === 0) return null;

    const termCourses: { credits: number; gradePoint: number }[] = [];

    for (const enr of enrollments) {
      const assessmentInputs = enr.section.assessments.map((a) => ({
        score: a.scores[0]?.score ?? 0,
        maxScore: a.maxScore,
        weightagePct: a.weightagePct,
      }));

      const courseGrade = calculateCourseGrade(assessmentInputs, cutoffs);
      termCourses.push({
        credits: Number(enr.section.courseOffering.course.credits),
        gradePoint: courseGrade.gradePoint,
      });
    }

    const termGpa = calculateTermGpa(termCourses);
    const termCredits = termCourses.reduce((sum, c) => sum + c.credits, 0);

    // Compute cumulative across all completed semesters
    const pastResults = await this.prisma.semesterResult.findMany({
      where: {
        studentId,
        semesterId: { not: semesterId },
      },
    });

    const historicalTerms = pastResults.map((r) => ({
      termCredits: r.termCredits,
      termGpa: r.termGpa,
    }));
    historicalTerms.push({ termCredits, termGpa });

    const cumulativeCgpa = calculateCumulativeGpa(historicalTerms);
    const totalCredits = historicalTerms.reduce((sum, t) => sum + t.termCredits, 0);

    const result = await this.prisma.semesterResult.upsert({
      where: {
        studentId_semesterId: {
          studentId,
          semesterId,
        },
      },
      update: {
        termGpa,
        cgpa: cumulativeCgpa,
        termCredits,
        totalCreditsEarned: totalCredits,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
      create: {
        studentId,
        semesterId,
        termGpa,
        cgpa: cumulativeCgpa,
        termCredits,
        totalCreditsEarned: totalCredits,
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });

    return result;
  }

  async getStudentResults(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        program: true,
        batch: true,
        institution: true,
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    const results = await this.prisma.semesterResult.findMany({
      where: { studentId },
      include: { semester: true },
      orderBy: { createdAt: 'desc' },
    });

    // Also get active enrolled sections and their attendance sessions
    const activeEnrollments = await this.prisma.enrollment.findMany({
      where: { studentId, deletedAt: null },
      include: {
        section: {
          include: {
            courseOffering: { include: { course: true, semester: true } },
            attendanceSessions: {
              include: {
                records: { where: { studentId } },
              },
            },
          },
        },
      },
    });

    const cutoffs = await this.getGradeScale(student.institutionId);

    const coursesBreakdown = activeEnrollments.map((enr) => {
      const course = enr.section.courseOffering.course;
      const totalHeld = enr.section.attendanceSessions.length;
      const attended = enr.section.attendanceSessions.filter((s) =>
        s.records.some((r) => r.status === 'PRESENT' || r.status === 'EXCUSED'),
      ).length;

      const eligibility = checkExamEligibility(attended, totalHeld, 75);

      return {
        sectionId: enr.section.id,
        courseCode: course.code,
        courseTitle: course.title,
        credits: Number(course.credits),
        semester: enr.section.courseOffering.semester.name,
        attendance: {
          attended,
          totalHeld,
          attendancePct: eligibility.attendancePct,
          isEligible: eligibility.isEligible,
          canMissUpcoming: eligibility.canMissClassesToRemainEligible,
          shortfallPct: eligibility.shortfallPct,
        },
      };
    });

    const latestResult = results[0];

    return {
      student: {
        id: student.id,
        studentNumber: student.studentNumber,
        name: student.user.fullName,
        email: student.user.email,
        program: student.program.name,
        programCode: student.program.code,
        batch: student.batch.code,
      },
      currentCgpa: latestResult ? latestResult.cgpa : 0.0,
      totalCreditsEarned: latestResult ? latestResult.totalCreditsEarned : 0,
      semesterResults: results.map((r) => ({
        id: r.id,
        semesterId: r.semesterId,
        semesterName: r.semester.name,
        termGpa: r.termGpa,
        cgpa: r.cgpa,
        termCredits: r.termCredits,
        totalCredits: r.totalCreditsEarned,
        status: r.status,
      })),
      enrolledCourses: coursesBreakdown,
      gradeScale: cutoffs,
    };
  }
}
