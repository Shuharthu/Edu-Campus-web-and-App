import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth, RequirePermission } from '../common/decorators';
import {
  AwardScholarshipDto,
  CreateFeeStructureDto,
  CreateInvoiceDto,
  CreateScholarshipDto,
  ProcessPaymentIntentDto,
} from './finance.dto';
import { FinanceService } from './finance.service';

@ApiTags('Finance & Invoicing')
@ApiBearerAuth()
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('fee-structures')
  @RequirePermission('finance', 'view')
  @ApiOperation({ summary: 'List program fee schedules' })
  async getFeeStructures(@CurrentAuth() auth: AuthContext) {
    return this.financeService.getFeeStructures(auth.institutionId);
  }

  @Post('fee-structures')
  @RequirePermission('finance', 'create')
  @ApiOperation({ summary: 'Create new program fee structure' })
  async createFeeStructure(
    @Body() dto: CreateFeeStructureDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.financeService.createFeeStructure(dto, auth);
  }

  @Get('scholarships')
  @RequirePermission('finance', 'view')
  @ApiOperation({ summary: 'List scholarships and financial aid tiers' })
  async getScholarships(@CurrentAuth() auth: AuthContext) {
    return this.financeService.getScholarships(auth.institutionId);
  }

  @Post('scholarships')
  @RequirePermission('finance', 'create')
  @ApiOperation({ summary: 'Create scholarship waiver category' })
  async createScholarship(
    @Body() dto: CreateScholarshipDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.financeService.createScholarship(dto, auth);
  }

  @Post('scholarships/award')
  @RequirePermission('finance', 'approve')
  @ApiOperation({ summary: 'Award scholarship to a student' })
  async awardScholarship(
    @Body() dto: AwardScholarshipDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.financeService.awardScholarship(dto, auth);
  }

  @Get('invoices')
  @RequirePermission('finance', 'view')
  @ApiOperation({ summary: 'List all invoices and collection records' })
  async getInvoices(
    @CurrentAuth() auth: AuthContext,
    @Query('studentId') studentId?: string,
    @Query('semesterId') semesterId?: string,
    @Query('status') status?: string,
  ) {
    return this.financeService.getInvoices({
      institutionId: auth.institutionId,
      studentId,
      semesterId,
      status,
    });
  }

  @Get('student-billing')
  @RequirePermission('finance', 'view')
  @ApiOperation({ summary: 'Get complete student tuition and installment status' })
  async getStudentBilling(
    @Query('studentId') studentId: string,
    @CurrentAuth() auth: AuthContext,
  ) {
    const targetStudentId = studentId || auth.userId;
    return this.financeService.getStudentBilling(targetStudentId);
  }

  @Post('invoices')
  @RequirePermission('finance', 'create')
  @ApiOperation({ summary: 'Generate semester tuition invoice with installment plan' })
  async createInvoice(
    @Body() dto: CreateInvoiceDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.financeService.createInvoice(dto, auth);
  }

  @Post('payments/intent')
  @RequirePermission('finance', 'edit')
  @ApiOperation({ summary: 'Create and process Stripe payment intent for tuition or installment' })
  async processPaymentIntent(
    @Body() dto: ProcessPaymentIntentDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.financeService.processPaymentIntent(dto, auth);
  }
}
