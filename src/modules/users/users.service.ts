import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const where = search
      ? { OR: [{ fullName: { contains: search } }, { email: { contains: search } }, { nip: { contains: search } }] }
      : {};
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        select: { id: true, email: true, fullName: true, nip: true, phone: true, position: true, isActive: true, lastLoginAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    const { password, ...rest } = user;
    return { ...rest, roles: user.userRoles.map((ur) => ur.role) };
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, ...(dto.nip ? [{ nip: dto.nip }] : [])] },
    });
    if (existing) throw new ConflictException('Email atau NIP sudah terdaftar');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashed },
      select: { id: true, email: true, fullName: true, nip: true, position: true, createdAt: true },
    });
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findById(id);
    const data: any = { ...dto };
    if (dto.password) data.password = await bcrypt.hash(dto.password, 12);
    else delete data.password;
    return this.prisma.user.update({
      where: { id },
      data,
      select: { id: true, email: true, fullName: true, nip: true, phone: true, position: true, isActive: true, updatedAt: true },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.userRole.deleteMany({ where: { userId: id } });
    await this.prisma.user.delete({ where: { id } });
    return { message: 'User berhasil dihapus' };
  }

  async assignRole(userId: string, roleId: string) {
    await this.findById(userId);
    await this.prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {},
      create: { userId, roleId },
    });
    return { message: 'Role berhasil ditambahkan' };
  }

  async removeRole(userId: string, roleId: string) {
    await this.prisma.userRole.deleteMany({ where: { userId, roleId } });
    return { message: 'Role berhasil dihapus' };
  }
}
