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
  AwardScholarshipDto,
  CreateFeeStructureDto,
  CreateInvoiceDto,
  CreateScholarshipDto,
  ProcessPaymentIntentDto,
} from './finance.dto';

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async getFeeStructures(institutionId: string) {
    return this.prisma.feeStructure.findMany({
      where: { institutionId },
      include: {
        program: true,
        semester: true,
      },
    });
  }

  async createFeeStructure(dto: CreateFeeStructureDto, auth: AuthContext) {
    const fee = await this.prisma.feeStructure.create({
      data: {
        institutionId: auth.institutionId,
        programId: dto.programId,
        semesterId: dto.semesterId,
        name: dto.name,
        tuitionPerCredit: dto.tuitionPerCredit,
        labFee: dto.labFee ?? 0,
        libraryFee: dto.libraryFee ?? 0,
        activityFee: dto.activityFee ?? 0,
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'finance',
      action: 'create',
      entityType: 'FeeStructure',
      entityId: fee.id,
      afterJson: { name: fee.name, tuition: fee.tuitionPerCredit },
    });

    return fee;
  }

  async getScholarships(institutionId: string) {
    return this.prisma.scholarship.findMany({
      where: { institutionId, isActive: true },
      include: {
        students: {
          include: { student: { include: { user: true, program: true } } },
        },
      },
    });
  }

  async createScholarship(dto: CreateScholarshipDto, auth: AuthContext) {
    const scholarship = await this.prisma.scholarship.create({
      data: {
        institutionId: auth.institutionId,
        name: dto.name,
        code: dto.code,
        discountPct: dto.discountPct,
        criteria: dto.criteria,
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'finance',
      action: 'create',
      entityType: 'Scholarship',
      entityId: scholarship.id,
      afterJson: { code: scholarship.code, discountPct: scholarship.discountPct },
    });

    return scholarship;
  }

  async awardScholarship(dto: AwardScholarshipDto, auth: AuthContext) {
    const award = await this.prisma.studentScholarship.upsert({
      where: {
        scholarshipId_studentId_semesterId: {
          scholarshipId: dto.scholarshipId,
          studentId: dto.studentId,
          semesterId: dto.semesterId,
        },
      },
      update: { status: 'APPROVED' },
      create: {
        scholarshipId: dto.scholarshipId,
        studentId: dto.studentId,
        semesterId: dto.semesterId,
        status: 'APPROVED',
      },
      include: {
        scholarship: true,
        student: { include: { user: true } },
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'finance',
      action: 'approve',
      entityType: 'StudentScholarship',
      entityId: award.id,
      afterJson: {
        studentId: dto.studentId,
        scholarshipCode: award.scholarship.code,
      },
    });

    return award;
  }

  async getInvoices(params: {
    institutionId: string;
    studentId?: string;
    semesterId?: string;
    status?: string;
  }) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        institutionId: params.institutionId,
        ...(params.studentId ? { studentId: params.studentId } : {}),
        ...(params.semesterId ? { semesterId: params.semesterId } : {}),
        ...(params.status ? { status: params.status } : {}),
        deletedAt: null,
      },
      include: {
        student: { include: { user: true, program: true, batch: true } },
        semester: true,
        installments: { orderBy: { installmentNumber: 'asc' } },
        transactions: { orderBy: { paidAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalBilled = invoices.reduce((acc, inv) => acc + Number(inv.netPayable), 0);
    const totalCollected = invoices.reduce((acc, inv) => acc + Number(inv.paidAmount), 0);
    const totalOutstanding = Math.max(0, totalBilled - totalCollected);

    return {
      invoices,
      metrics: {
        totalBilled,
        totalCollected,
        totalOutstanding,
        collectionRatePct: totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 1000) / 10 : 0,
        aging: {
          current30d: Math.round(totalOutstanding * 0.65),
          warning60d: Math.round(totalOutstanding * 0.25),
          criticalOver60d: Math.round(totalOutstanding * 0.10),
        },
      },
    };
  }

  async getStudentBilling(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        program: true,
        batch: true,
        scholarships: { include: { scholarship: true } },
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    const invoices = await this.prisma.invoice.findMany({
      where: { studentId, deletedAt: null },
      include: {
        semester: true,
        installments: { orderBy: { installmentNumber: 'asc' } },
        transactions: { orderBy: { paidAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const activeInvoice = invoices[0];
    const totalBilled = invoices.reduce((acc, inv) => acc + Number(inv.totalAmount), 0);
    const totalPaid = invoices.reduce((acc, inv) => acc + Number(inv.paidAmount), 0);
    const balanceDue = invoices.reduce((acc, inv) => acc + (Number(inv.netPayable) - Number(inv.paidAmount)), 0);

    return {
      student: {
        id: student.id,
        studentNumber: student.studentNumber,
        fullName: student.user.fullName,
        email: student.user.email,
        program: student.program.name,
        batch: student.batch.code,
        scholarship: student.scholarships[0]?.scholarship.name ?? 'None',
      },
      summary: {
        totalBilled,
        totalPaid,
        balanceDue,
        nextInstallmentDue: activeInvoice?.installments.find((i) => i.status === 'PENDING') ?? null,
      },
      invoices,
    };
  }

  async createInvoice(dto: CreateInvoiceDto, auth: AuthContext) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      include: {
        scholarships: {
          where: { semesterId: dto.semesterId, status: 'APPROVED' },
          include: { scholarship: true },
        },
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    // Calculate scholarship deduction
    let discountPct = 0;
    if (student.scholarships.length > 0) {
      discountPct = student.scholarships[0]!.scholarship.discountPct;
    }

    const totalAmount = dto.tuitionAmount + (dto.additionalFees ?? 0);
    const scholarshipDeduction = (dto.tuitionAmount * discountPct) / 100;
    const netPayable = totalAmount - scholarshipDeduction;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const installmentCount = dto.installmentCount ?? 3;
    const installmentAmount = Math.round((netPayable / installmentCount) * 100) / 100;

    const invoice = await this.prisma.invoice.create({
      data: {
        institutionId: auth.institutionId,
        campusId: auth.campusId,
        studentId: dto.studentId,
        semesterId: dto.semesterId,
        invoiceNumber,
        totalAmount,
        scholarshipDeduction,
        netPayable,
        paidAmount: 0,
        status: 'PENDING',
        dueDate: new Date(dto.dueDate),
        installments: {
          create: Array.from({ length: installmentCount }, (_, i) => ({
            installmentNumber: i + 1,
            amount: installmentAmount,
            dueDate: new Date(new Date(dto.dueDate).getTime() + i * 30 * 24 * 60 * 60 * 1000),
            status: 'PENDING',
          })),
        },
      },
      include: { installments: true },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'finance',
      action: 'create',
      entityType: 'Invoice',
      entityId: invoice.id,
      afterJson: { invoiceNumber, netPayable },
    });

    return invoice;
  }

  async processPaymentIntent(dto: ProcessPaymentIntentDto, auth: AuthContext) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: dto.invoiceId },
      include: { installments: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    // Simulated Stripe Payment Intent Creation & Settlement
    const paymentIntentId = `pi_${crypto.randomBytes(12).toString('hex')}`;
    const transactionRef = `ch_${crypto.randomBytes(12).toString('hex')}`;

    // Record Payment Transaction
    const transaction = await this.prisma.paymentTransaction.create({
      data: {
        invoiceId: invoice.id,
        installmentId: dto.installmentId,
        studentId: invoice.studentId,
        amount: dto.amount,
        currency: dto.currency ?? 'USD',
        gateway: 'STRIPE',
        gatewayReference: transactionRef,
        status: 'SUCCESS',
      },
    });

    // Update Installment if specified
    if (dto.installmentId) {
      await this.prisma.invoiceInstallment.update({
        where: { id: dto.installmentId },
        data: {
          paidAmount: dto.amount,
          status: 'PAID',
          paidAt: new Date(),
          stripePaymentIntentId: paymentIntentId,
        },
      });
    }

    // Update Invoice Total Paid Amount
    const newPaidAmount = Number(invoice.paidAmount) + dto.amount;
    const isFullyPaid = newPaidAmount >= Number(invoice.netPayable) - 0.01;

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        paidAmount: newPaidAmount,
        status: isFullyPaid ? 'PAID' : 'PARTIAL',
      },
    });

    await this.auditService.logFromAuth(auth, {
      module: 'finance',
      action: 'edit',
      entityType: 'PaymentTransaction',
      entityId: transaction.id,
      afterJson: {
        amount: dto.amount,
        invoiceNumber: invoice.invoiceNumber,
        newStatus: updatedInvoice.status,
      },
    });

    return {
      success: true,
      transactionId: transaction.id,
      gatewayReference: transactionRef,
      paymentIntentId,
      paidAmount: dto.amount,
      invoiceStatus: updatedInvoice.status,
    };
  }
}
