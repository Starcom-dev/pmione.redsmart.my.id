import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private service: ApprovalsService) {}

  @Get('chains')
  getChains() { return { success: true, data: this.service.getChains() }; }

  @Get('inbox')
  async inbox(@Req() req: Request, @Query('page') page = 1, @Query('limit') limit = 10) {
    return { success: true, ...(await this.service.findMyInbox((req as any).user.sub, +page, +limit)) };
  }

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('status') status?: string) {
    return { success: true, ...(await this.service.findAll(+page, +limit, status)) };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return { success: true, data: await this.service.findById(id) };
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: any) {
    return { success: true, data: await this.service.create({ ...dto, createdById: (req as any).user.sub }) };
  }

  @Post(':id/review')
  async review(@Req() req: Request, @Param('id') id: string, @Body() body: { action: string; notes?: string; signature?: string }) {
    return { success: true, data: await this.service.reviewStep(id, (req as any).user.sub, body.action, body.notes, body.signature) };
  }

  @Post(':id/submit-revision')
  async submitRevision(@Req() req: Request, @Param('id') id: string, @Body() body: { notes: string }) {
    return { success: true, data: await this.service.submitRevision(id, (req as any).user.sub, body.notes) };
  }
}
