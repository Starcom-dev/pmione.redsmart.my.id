 import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkOrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.prisma.workOrder.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } as any }),
      this.prisma.workOrder.count(),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const item = await this.prisma.workOrder.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Data tidak ditemukan');
    return item;
  }

  async create(dto: any) {
    return this.prisma.workOrder.create({ data: dto });
  }

  async update(id: string, dto: any) {
    await this.findById(id);
    return this.prisma.workOrder.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.workOrder.delete({ where: { id } });
    return { message: 'Berhasil dihapus' };
  }
}
