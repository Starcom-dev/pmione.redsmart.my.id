import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AmbulanceService } from './ambulance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Ambulance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ambulance')
export class AmbulanceController {
  constructor(private service: AmbulanceService) {}

  @Get()
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return { success: true, ...(await this.service.findAll(+page, +limit)) };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return { success: true, data: await this.service.findById(id) };
  }

  @Post()
  async create(@Body() dto: any) {
    return { success: true, data: await this.service.create(dto) };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return { success: true, data: await this.service.update(id, dto) };
  }

  @Delete(':id')
  @Roles('superadmin', 'admin')
  async remove(@Param('id') id: string) {
    return { success: true, data: await this.service.remove(id) };
  }
}
