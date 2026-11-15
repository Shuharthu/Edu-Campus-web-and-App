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
  CreateAnnouncementDto,
  CreateThreadDto,
  SendMessageDto,
  UpdateNotificationPreferenceDto,
} from './communication.dto';
import { CommunicationService } from './communication.service';

@ApiTags('Communication & Realtime')
@ApiBearerAuth()
@Controller('communication')
export class CommunicationController {
  constructor(private readonly commService: CommunicationService) {}

  @Get('announcements')
  @RequirePermission('communication', 'view')
  @ApiOperation({ summary: 'List announcements and notices' })
  async getAnnouncements(
    @CurrentAuth() auth: AuthContext,
    @Query('departmentId') departmentId?: string,
    @Query('priority') priority?: string,
  ) {
    return this.commService.getAnnouncements({
      institutionId: auth.institutionId,
      departmentId,
      priority,
      userId: auth.userId,
    });
  }

  @Post('announcements')
  @RequirePermission('communication', 'create')
  @ApiOperation({ summary: 'Publish multi-channel announcement' })
  async createAnnouncement(
    @Body() dto: CreateAnnouncementDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.commService.createAnnouncement(dto, auth);
  }

  @Post('announcements/:id/read')
  @RequirePermission('communication', 'view')
  @ApiOperation({ summary: 'Mark announcement as read' })
  async markAnnouncementRead(
    @Param('id') id: string,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.commService.markAnnouncementRead(id, auth);
  }

  @Get('threads')
  @RequirePermission('communication', 'view')
  @ApiOperation({ summary: 'List course and department discussion channels' })
  async getThreads(
    @CurrentAuth() auth: AuthContext,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.commService.getThreads(auth.institutionId, sectionId);
  }

  @Post('threads')
  @RequirePermission('communication', 'create')
  @ApiOperation({ summary: 'Create new discussion channel' })
  async createThread(
    @Body() dto: CreateThreadDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.commService.createThread(dto, auth);
  }

  @Get('threads/:id/messages')
  @RequirePermission('communication', 'view')
  @ApiOperation({ summary: 'Get thread messages' })
  async getThreadMessages(@Param('id') id: string) {
    return this.commService.getThreadMessages(id);
  }

  @Post('threads/:id/messages')
  @RequirePermission('communication', 'view')
  @ApiOperation({ summary: 'Send message to thread' })
  async sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.commService.sendMessage(id, dto, auth);
  }

  @Get('dispatch-logs')
  @RequirePermission('communication', 'view')
  @ApiOperation({ summary: 'Get message dispatch logs and delivery metrics' })
  async getDispatchLogs(@CurrentAuth() auth: AuthContext) {
    return this.commService.getDispatchLogs(auth.institutionId);
  }

  @Get('preferences')
  @RequirePermission('communication', 'view')
  @ApiOperation({ summary: 'Get student/faculty notification preferences' })
  async getNotificationPreferences(@CurrentAuth() auth: AuthContext) {
    return this.commService.getNotificationPreferences(auth.userId);
  }

  @Patch('preferences')
  @RequirePermission('communication', 'view')
  @ApiOperation({ summary: 'Update notification channels & quiet hours' })
  async updateNotificationPreference(
    @Body() dto: UpdateNotificationPreferenceDto,
    @CurrentAuth() auth: AuthContext,
  ) {
    return this.commService.updateNotificationPreference(dto, auth);
  }
}
