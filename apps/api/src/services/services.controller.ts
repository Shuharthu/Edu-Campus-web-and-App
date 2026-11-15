import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth, RequirePermission } from '../common/decorators';
import {
  CreateServiceRequestDto,
  UpdateServiceRequestStatusDto,
  VerifyDigitalIdDto,
} from './services.dto';
import { UniversityServicesService } from './services.service';

@ApiTags('Services & Digital ID')
@ApiBearerAuth()
@Controller('services')
export class UniversityServicesController {
  constructor(private readonly servicesService: UniversityServicesService) {}

  @Get('digital-id')
  @RequirePermission('services', 'view')
  @ApiOperation({ summary: 'Get digital student credential with rolling dynamic QR' })
  async getDigitalID(
    @Query('studentId') studentId: string,
    @CurrentAuth() auth: AuthContext,
  ) {
    const targetStudentId = studentId || auth.userId;
    return this.servicesService.getDigitalID(targetStudentId);
  }

  @Post('digital-id/verify')
  @RequirePermission('services', 'view')
  @ApiOperation({ summary: 'Turnstile / security gate verification of dynamic QR token' })
  async verifyDigitalId(@Body() dto: VerifyDigitalIdDto) {
    return this.servicesService.verifyDigitalId(dto);
  }

  @Get('requests')
  @RequirePermission('services', 'view')
  @ApiOperation({ summary: 'List student official document & service requests' })
  async getServiceRequests(
    @CurrentAuth() auth: AuthContext,
    @Query('studentId') studentId?: string,
    @Query('status') status?: string,
  ) {
    return this.servicesService.getServiceRequests(auth.institutionId, studentId, status);
  }

  @Post('requests')
  @RequirePermission('services', 'create')
  @ApiOperation({ summary: 'Submit new student service request (transcript, certificate)' })
  async createServiceRequest(
    @Body() dto: CreateServiceRequestDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.servicesService.createServiceRequest(dto, auth);
  }

  @Patch('requests/:id/status')
  @RequirePermission('services', 'approve')
  @ApiOperation({ summary: 'Approve, seal or complete student service request' })
  async updateServiceRequestStatus(
    @Param('id') id: string,
    @Body() dto: UpdateServiceRequestStatusDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.servicesService.updateServiceRequestStatus(id, dto, auth);
  }
}
