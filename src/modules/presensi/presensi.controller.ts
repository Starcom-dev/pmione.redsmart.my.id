import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PresensiService } from './presensi.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Presensi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('presensi')
export class PresensiController {
  constructor(private service: PresensiService) {}

  @Post('check-in/:employeeId')
  async checkIn(@Req() req: Request, @Param('employeeId') employeeId: string, @Body() body?: { location?: string }) {
    return { success: true, data: await this.service.checkIn(employeeId, (req as any).user.sub, body?.location) };
  }

  @Post('check-out/:employeeId')
  async checkOut(@Req() req: Request, @Param('employeeId') employeeId: string) {
    return { success: true, data: await this.service.checkOut(employeeId, (req as any).user.sub) };
  }

  @Get('today/:employeeId')
  async today(@Req() req: Request, @Param('employeeId') employeeId: string) {
    return { success: true, data: await this.service.getTodayStatus(employeeId, (req as any).user.sub) };
  }

  @Get('history')
  async history(@Query('employeeId') employeeId?: string, @Query('page') page = 1, @Query('limit') limit = 20, @Query('month') month?: number, @Query('year') year?: number) {
    return { success: true, ...(await this.service.getHistory(employeeId, +page, +limit, month ? +month : undefined, year ? +year : undefined)) };
  }

  @Get('summary')
  async summary(@Query('month') month?: number, @Query('year') year?: number) {
    return { success: true, data: await this.service.getSummary(month ? +month : undefined, year ? +year : undefined) };
  }

  @Get('employee-summary/:employeeId')
  async employeeSummary(@Param('employeeId') employeeId: string, @Query('month') month?: number, @Query('year') year?: number) {
    return { success: true, data: await this.service.getEmployeeSummary(employeeId, month ? +month : undefined, year ? +year : undefined) };
  }

  @Get('shifts')
  async shifts() { return { success: true, data: await this.service.getShifts() }; }

  @Post('shifts')
  async createShift(@Body() dto: any) { return { success: true, data: await this.service.createShift(dto) }; }

  @Post('leave')
  async requestLeave(@Req() req: Request, @Body() dto: any) {
    return { success: true, data: await this.service.requestLeave(dto.employeeId, (req as any).user.sub, dto) };
  }

  @Get('leaves')
  async leaves(@Query('employeeId') employeeId?: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return { success: true, ...(await this.service.getLeaves(employeeId, +page, +limit)) };
  }
}
