import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AiAssistantService } from './ai-assistant.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('AI Assistant')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiAssistantController {
  constructor(private service: AiAssistantService) {}

  @Post('ask')
  async ask(@Body() body: { question: string }) {
    return { success: true, data: await this.service.ask(body.question || '') };
  }

  @Get('suggestions')
  async suggestions() {
    return { success: true, data: await this.service.suggest() };
  }
}
