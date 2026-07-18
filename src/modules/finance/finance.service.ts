 import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } as any }),
      this.prisma.transaction.count(),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const item = await this.prisma.transaction.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Data tidak ditemukan');
    return item;
  }

  async create(dto: any) {
    return this.prisma.transaction.create({ data: dto });
  }

  async update(id: string, dto: any) {
    await this.findById(id);
    return this.prisma.transaction.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.transaction.delete({ where: { id } });
    return { message: 'Berhasil dihapus' };
  }
}
