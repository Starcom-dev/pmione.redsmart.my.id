 import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TteService } from './tte.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('TTE')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tte')
export class TteController {
  constructor(private service: TteService) {}

  @Post('register')
  async register(@Req() req: Request, @Body() body: { signature: string }) {
    return { success: true, data: await this.service.register((req as any).user.sub, body.signature) };
  }

  @Post('sign/:letterId')
  async sign(@Req() req: Request, @Param('letterId') letterId: string, @Body() body: { signature: string }) {
    return { success: true, data: await this.service.signLetter((req as any).user.sub, letterId, body.signature) };
  }

  @Get('verify/:letterId')
  async verify(@Param('letterId') letterId: string) {
    return { success: true, data: await this.service.verify(letterId) };
  }

  @Get('me')
  async getSignature(@Req() req: Request) {
    return { success: true, data: await this.service.getSignature((req as any).user.sub) };
  }
}
