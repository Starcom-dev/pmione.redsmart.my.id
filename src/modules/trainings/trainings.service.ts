 import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TrainingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.prisma.training.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } as any }),
      this.prisma.training.count(),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const item = await this.prisma.training.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Data tidak ditemukan');
    return item;
  }

  async create(dto: any) {
    return this.prisma.training.create({ data: dto });
  }

  async update(id: string, dto: any) {
    await this.findById(id);
    return this.prisma.training.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.training.delete({ where: { id } });
    return { message: 'Berhasil dihapus' };
  }
}
