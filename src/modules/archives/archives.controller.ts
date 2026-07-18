 import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ArchivesService } from './archives.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Archives')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('archives')
export class ArchivesController {
  constructor(private service: ArchivesService) {}

  @Get()
  async findAll(
    @Query('page') page = 1, @Query('limit') limit = 10,
    @Query('search') search?: string, @Query('category') category?: string,
  ) {
    return { success: true, ...(await this.service.findAll(+page, +limit, search, category)) };
  }

  @Public()
  @Get('stats')
  async stats() {
    return { success: true, data: await this.service.getStats() };
  }

  @Public()
  @Get('tags')
  async tags() {
    return { success: true, data: await this.service.getTagCloud() };
  }

  @Public()
  @Get('timeline')
  async timeline(@Query('year') year?: string) {
    return { success: true, data: await this.service.getTimeline(year ? +year : undefined) };
  }

  @Public()
  @Get('ai-search')
  async aiSearch(@Query('q') q: string, @Query('page') page = 1, @Query('limit') limit = 10) {
    if (!q) return { success: true, data: [] };
    return { success: true, ...(await this.service.aiSearch(q, +page, +limit)) };
  }

  @Public()
  @Get('ai-suggest')
  async aiSuggest(@Query('q') q: string) {
    return { success: true, data: await this.service.aiSuggest(q || '') };
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
