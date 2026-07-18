 import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.prisma.employee.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } as any }),
      this.prisma.employee.count(),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const item = await this.prisma.employee.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Data tidak ditemukan');
    return item;
  }

  async create(dto: any) {
    return this.prisma.employee.create({ data: dto });
  }

  async update(id: string, dto: any) {
    await this.findById(id);
    return this.prisma.employee.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.employee.delete({ where: { id } });
    return { message: 'Berhasil dihapus' };
  }
}
