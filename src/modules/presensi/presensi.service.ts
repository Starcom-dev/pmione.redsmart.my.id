import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PresensiService {
  constructor(private prisma: PrismaService) {}

  async checkIn(employeeId: string, userId: string, location?: string) {
    // Verify employee exists and belongs to user
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp || emp.userId !== userId) throw new BadRequestException('Data pegawai tidak valid');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existing = await this.prisma.attendance.findFirst({
      where: { employeeId, date: { gte: today, lt: new Date(today.getTime() + 86400000) } },
    });
    if (existing) throw new BadRequestException('Sudah check-in hari ini');

    const now = new Date();
    const shiftStart = new Date(today);
    shiftStart.setHours(7, 0, 0, 0);
    const isLate = now > new Date(shiftStart.getTime() + 15 * 60000); // Late if after 07:15

    return this.prisma.attendance.create({
      data: {
        employeeId,
        date: now,
        checkIn: now,
        type: isLate ? 'LATE' : 'PRESENT',
        location,
      },
    });
  }

  async checkOut(employeeId: string, userId: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp || emp.userId !== userId) throw new BadRequestException('Data pegawai tidak valid');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const att = await this.prisma.attendance.findFirst({
      where: { employeeId, date: { gte: today, lt: new Date(today.getTime() + 86400000) } },
    });
    if (!att) throw new BadRequestException('Belum check-in hari ini');
    if (att.checkOut) throw new BadRequestException('Sudah check-out');

    return this.prisma.attendance.update({
      where: { id: att.id },
      data: { checkOut: new Date() },
    });
  }

  async getTodayStatus(employeeId: string, userId: string) {
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp || emp.userId !== userId) throw new BadRequestException('Pegawai tidak valid');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const att = await this.prisma.attendance.findFirst({
      where: { employeeId, date: { gte: today, lt: new Date(today.getTime() + 86400000) } },
    });

    if (!att) return { status: 'NOT_CHECKED_IN', checkIn: null, checkOut: null };
    return {
      status: att.checkOut ? 'COMPLETED' : 'CHECKED_IN',
      checkIn: att.checkIn,
      checkOut: att.checkOut,
      type: att.type,
    };
  }

  async getHistory(employeeId?: string, page = 1, limit = 20, month?: number, year?: number) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      where.date = { gte: start, lte: end };
    }

    const [data, total] = await Promise.all([
      this.prisma.attendance.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'desc' },
        include: { employee: { select: { fullName: true, nip: true, position: true, unit: true } } },
      }),
      this.prisma.attendance.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async getSummary(month?: number, year?: number) {
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const records = await this.prisma.attendance.findMany({
      where: { date: { gte: start, lte: end } },
      include: { employee: { select: { fullName: true, nip: true, unit: true } } },
    });

    const totalEmployees = await this.prisma.employee.count({ where: { status: 'ACTIVE' } });
    const workDays = this.getWorkDays(y, m);

    const summary = {
      month: m, year: y, workDays,
      totalEmployees,
      present: records.filter(r => r.type === 'PRESENT').length,
      late: records.filter(r => r.type === 'LATE').length,
      absent: totalEmployees * workDays - records.length,
      permit: records.filter(r => r.type === 'PERMIT').length,
      sick: records.filter(r => r.type === 'SICK').length,
      records: records.length,
    };

    return summary;
  }

  async getEmployeeSummary(employeeId: string, month?: number, year?: number) {
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const emp = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: { fullName: true, nip: true, position: true, unit: true },
    });
    if (!emp) throw new NotFoundException('Pegawai tidak ditemukan');

    const records = await this.prisma.attendance.findMany({
      where: { employeeId, date: { gte: start, lte: end } },
      orderBy: { date: 'asc' },
    });

    const workDays = this.getWorkDays(y, m);
    const checkIns = records.length;

    return {
      employee: emp,
      month: m, year: y,
      workDays, checkIns,
      present: records.filter(r => r.type === 'PRESENT').length,
      late: records.filter(r => r.type === 'LATE').length,
      absent: workDays - checkIns,
      details: records.map(r => ({
        date: r.date,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        type: r.type,
        location: r.location,
      })),
    };
  }

  // Shift management
  async getShifts() {
    return this.prisma.shift.findMany({ orderBy: { name: 'asc' } });
  }

  async createShift(dto: { name: string; startTime: string; endTime: string }) {
    return this.prisma.shift.create({ data: dto });
  }

  // Leave management
  async requestLeave(employeeId: string, userId: string, dto: { leaveType: string; startDate: string; endDate: string; reason: string }) {
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp || emp.userId !== userId) throw new BadRequestException('Pegawai tidak valid');

    return this.prisma.leave.create({
      data: {
        employeeId,
        leaveType: dto.leaveType as any,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
      },
    });
  }

  async getLeaves(employeeId?: string, page = 1, limit = 20) {
    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    const [data, total] = await Promise.all([
      this.prisma.leave.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { employee: { select: { fullName: true, nip: true, unit: true } } },
      }),
      this.prisma.leave.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  private getWorkDays(year: number, month: number): number {
    const days = new Date(year, month, 0).getDate();
    let workDays = 0;
    for (let d = 1; d <= days; d++) {
      const day = new Date(year, month - 1, d).getDay();
      if (day !== 0 && day !== 6) workDays++;
    }
    return workDays;
  }
}
