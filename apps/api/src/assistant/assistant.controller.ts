import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthContext } from '../common/auth.types';
import { CurrentAuth } from '../common/decorators';
import { AskAssistantDto, CreateStudyBlockDto } from './dto/assistant.dto';
import { AssistantService } from './assistant.service';

@Controller('assistant')
export class AssistantController {
  constructor(private readonly assistantService: AssistantService) {}

  @Post('ask')
  async ask(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: AskAssistantDto,
  ) {
    return this.assistantService.askAssistant(auth.userId, dto);
  }

  @Get('history')
  async getHistory(
    @CurrentAuth() auth: AuthContext,
    @Query('conversationId') conversationId?: string,
  ) {
    return this.assistantService.getConversationHistory(auth.userId, conversationId);
  }

  @Get('study-plan')
  async getStudyPlan(
    @CurrentAuth() auth: AuthContext,
    @Query('studentId') studentId?: string,
  ) {
    const targetStudentId = studentId || auth.userId;
    return this.assistantService.getStudyPlan(targetStudentId);
  }

  @Post('study-plan')
  async createStudyBlock(
    @CurrentAuth() auth: AuthContext,
    @Body() dto: CreateStudyBlockDto,
  ) {
    return this.assistantService.createStudyBlock(auth.userId, dto);
  }

  @Patch('study-plan/:id/complete')
  async markStudyBlockDone(
    @CurrentAuth() auth: AuthContext,
    @Param('id') blockId: string,
  ) {
    return this.assistantService.markStudyBlockDone(auth.userId, blockId);
  }
}
