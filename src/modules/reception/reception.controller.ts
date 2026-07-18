import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ReceptionService } from './reception.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Reception')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reception')
export class ReceptionController {
  constructor(private service: ReceptionService) {}

  @Post('check-in')
  async checkIn(@Body() dto: any) {
    return { success: true, data: await this.service.registerVisitor(dto) };
  }

  @Post('check-out/:id')
  async checkOut(@Param('id') id: string) {
    return { success: true, data: await this.service.checkOut(id) };
  }

  @Public()
  @Get('verify-qr/:code')
  async verifyQr(@Param('code') code: string) {
    return { success: true, data: await this.service.verifyQr(code) };
  }

  @Get('today')
  async today() {
    return { success: true, data: await this.service.getTodayVisitors() };
  }

  @Get('history')
  async history(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search?: string) {
    return { success: true, ...(await this.service.getHistory(+page, +limit, search)) };
  }

  @Get('stats')
  async stats() {
    return { success: true, data: await this.service.getStats() };
  }
}
