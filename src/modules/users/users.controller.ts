 import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('superadmin', 'admin')
  async findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string) {
    return { success: true, ...(await this.usersService.findAll(+page, +limit, search)) };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return { success: true, data: await this.usersService.findById(id) };
  }

  @Post()
  @Roles('superadmin', 'admin')
  async create(@Body() dto: any) {
    return { success: true, data: await this.usersService.create(dto) };
  }

  @Put(':id')
  @Roles('superadmin', 'admin')
  async update(@Param('id') id: string, @Body() dto: any) {
    return { success: true, data: await this.usersService.update(id, dto) };
  }

  @Delete(':id')
  @Roles('superadmin')
  async remove(@Param('id') id: string) {
    return { success: true, data: await this.usersService.remove(id) };
  }

  @Post(':id/roles/:roleId')
  @Roles('superadmin', 'admin')
  async assignRole(@Param('id') id: string, @Param('roleId') roleId: string) {
    return { success: true, data: await this.usersService.assignRole(id, roleId) };
  }

  @Delete(':id/roles/:roleId')
  @Roles('superadmin', 'admin')
  async removeRole(@Param('id') id: string, @Param('roleId') roleId: string) {
    return { success: true, data: await this.usersService.removeRole(id, roleId) };
  }
}
