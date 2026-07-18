import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class ReceptionService {
  constructor(private prisma: PrismaService) {}

  async registerVisitor(dto: { name: string; phone: string; purpose: string; hostName: string; vehicleNumber?: string; notes?: string }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const qrCode = crypto.createHash('sha256').update(dto.name + dto.phone + Date.now().toString()).digest('hex').slice(0, 12);
    const visitor = await this.prisma.visitor.create({
      data: {
        visitorName: dto.name, visitorPhone: dto.phone, purpose: dto.purpose,
        hostName: dto.hostName, vehicleNumber: dto.vehicleNumber,
        checkInTime: new Date(), status: 'CHECKED_IN', qrCode, notes: dto.notes,
      },
    });
    return visitor;
  }

  async checkOut(id: string) {
    const visitor = await this.prisma.visitor.findUnique({ where: { id } });
    if (!visitor) throw new NotFoundException('Tamu tidak ditemukan');
    if (visitor.status === 'CHECKED_OUT') throw new BadRequestException('Tamu sudah checkout');
    return this.prisma.visitor.update({ where: { id }, data: { status: 'CHECKED_OUT', checkOutTime: new Date() } });
  }

  async verifyQr(qrCode: string) {
    const visitor = await this.prisma.visitor.findFirst({ where: { qrCode } });
    if (!visitor) throw new NotFoundException('QR Code tidak valid');
    if (visitor.status === 'CHECKED_OUT') throw new BadRequestException('Tamu sudah checkout');
    return visitor;
  }

  async getTodayVisitors() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);
    const visitors = await this.prisma.visitor.findMany({ where: { checkInTime: { gte: today, lt: tomorrow } }, orderBy: { checkInTime: 'desc' } });
    const ci = visitors.filter(v => v.status === 'CHECKED_IN').length;
    const co = visitors.filter(v => v.status === 'CHECKED_OUT').length;
    return { total: visitors.length, checkedIn: ci, checkedOut: co, visitors, date: today.toISOString().slice(0, 10) };
  }

  async getHistory(page = 1, limit = 20, search?: string) {
    const where: any = {};
    if (search) where.OR = [
      { visitorName: { contains: search, mode: 'insensitive' as const } },
      { hostName: { contains: search, mode: 'insensitive' as const } },
      { purpose: { contains: search, mode: 'insensitive' as const } },
    ];
    const [data, total] = await Promise.all([
      this.prisma.visitor.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { checkInTime: 'desc' } }),
      this.prisma.visitor.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async getStats() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [todayTotal, monthTotal, allTotal, todayActive] = await Promise.all([
      this.prisma.visitor.count({ where: { checkInTime: { gte: today, lt: new Date(today.getTime() + 86400000) } } }),
      this.prisma.visitor.count({ where: { checkInTime: { gte: thisMonth } } }),
      this.prisma.visitor.count(),
      this.prisma.visitor.count({ where: { checkInTime: { gte: today }, status: 'CHECKED_IN' } }),
    ]);
    return { todayTotal, monthTotal, allTotal, todayActive };
  }
}
