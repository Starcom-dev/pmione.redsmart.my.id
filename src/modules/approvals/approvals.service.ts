import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// PMI DKI Jakarta — Hierarchical Approval Chain
const APPROVAL_CHAINS: Record<string, { level: string; roleName: string; roleSearch: string }[]> = {
  SURAT_KELUAR: [
    { level: 'Kepala Seksi', roleName: 'Kasi', roleSearch: 'Kasi' },
    { level: 'Kepala Bidang', roleName: 'Kabid', roleSearch: 'Kepala Bidang' },
    { level: 'Sekretaris', roleName: 'Sekretaris', roleSearch: 'Sekretaris' },
    { level: 'Ketua PMI DKI Jakarta', roleName: 'Ketua', roleSearch: 'Ketua' },
  ],
  SURAT_INTERNAL: [
    { level: 'Kepala Seksi', roleName: 'Kasi', roleSearch: 'Kasi' },
    { level: 'Kepala Bidang', roleName: 'Kabid', roleSearch: 'Kepala Bidang' },
  ],
  PENGADAAN: [
    { level: 'Kepala Seksi', roleName: 'Kasi', roleSearch: 'Kasi' },
    { level: 'Kepala Bidang', roleName: 'Kabid', roleSearch: 'Kepala Bidang' },
    { level: 'Kepala Bidang Keuangan', roleName: 'Kabid Keuangan', roleSearch: 'Keuangan' },
    { level: 'Wakil Ketua', roleName: 'Wakil Ketua', roleSearch: 'Wakil Ketua' },
    { level: 'Ketua PMI DKI Jakarta', roleName: 'Ketua', roleSearch: 'Ketua' },
  ],
  ANGGARAN: [
    { level: 'Kepala Bidang', roleName: 'Kabid', roleSearch: 'Kepala Bidang' },
    { level: 'Kepala Bidang Keuangan', roleName: 'Kabid Keuangan', roleSearch: 'Keuangan' },
    { level: 'Ketua PMI DKI Jakarta', roleName: 'Ketua', roleSearch: 'Ketua' },
  ],
  LAPORAN: [
    { level: 'Kepala Seksi', roleName: 'Kasi', roleSearch: 'Kasi' },
    { level: 'Kepala Bidang', roleName: 'Kabid', roleSearch: 'Kepala Bidang' },
    { level: 'Sekretaris', roleName: 'Sekretaris', roleSearch: 'Sekretaris' },
  ],
};

@Injectable()
export class ApprovalsService {
  constructor(private prisma: PrismaService) {}

  getChains() {
    return APPROVAL_CHAINS;
  }

  async create(dto: { title: string; type: string; description?: string; letterId?: string; createdById: string }) {
    const chain = APPROVAL_CHAINS[dto.type] || APPROVAL_CHAINS['SURAT_KELUAR'];

    // Find users for each approval level
    const stepData = [];
    for (const s of chain) {
      const user = await this.prisma.user.findFirst({
        where: {
          position: { contains: s.roleSearch },
          isActive: true,
        },
      });
      if (user) {
        stepData.push({
          stepOrder: stepData.length + 1,
          level: s.level,
          roleName: s.roleName,
          userId: user.id,
          status: 'WAITING',
        });
      }
    }

    if (stepData.length === 0) throw new BadRequestException('Tidak ada approver yang tersedia');

    const request = await this.prisma.approvalRequest.create({
      data: {
        title: dto.title,
        type: dto.type,
        description: dto.description,
        letterId: dto.letterId,
        totalSteps: stepData.length,
        currentStep: 1,
        createdById: dto.createdById,
        steps: { create: stepData },
      },
      include: { steps: { include: { user: { select: { id: true, fullName: true, position: true } } } } },
    });

    return request;
  }

  async findAll(page = 1, limit = 10, status?: string, userId?: string) {
    const where: any = {};
    if (status) where.status = status;
    if (userId) {
      where.steps = { some: { userId, status: 'WAITING' } };
    }
    const [data, total] = await Promise.all([
      this.prisma.approvalRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          steps: { include: { user: { select: { id: true, fullName: true, position: true } } } },
          createdBy: { select: { id: true, fullName: true, position: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.approvalRequest.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findMyInbox(userId: string, page = 1, limit = 10) {
    const where = {
      status: 'IN_PROGRESS',
      steps: { some: { userId, status: 'WAITING' } },
    };
    const [data, total] = await Promise.all([
      this.prisma.approvalRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          steps: { include: { user: { select: { id: true, fullName: true, position: true } } } },
          createdBy: { select: { id: true, fullName: true, position: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.approvalRequest.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const req = await this.prisma.approvalRequest.findUnique({
      where: { id },
      include: {
        steps: {
          include: { user: { select: { id: true, fullName: true, position: true, email: true } } },
          orderBy: { stepOrder: 'asc' },
        },
        createdBy: { select: { id: true, fullName: true, position: true } },
      },
    });
    if (!req) throw new NotFoundException('Approval tidak ditemukan');
    return req;
  }

  async reviewStep(requestId: string, userId: string, action: string, notes?: string, signature?: string) {
    const req = await this.findById(requestId);
    if (req.status !== 'IN_PROGRESS') throw new BadRequestException('Approval sudah selesai');

    const currentStep = req.steps.find(s => s.stepOrder === req.currentStep);
    if (!currentStep) throw new BadRequestException('Step tidak ditemukan');
    if (currentStep.userId !== userId) throw new BadRequestException('Anda bukan approver untuk step ini');
    if (currentStep.status !== 'WAITING') throw new BadRequestException('Step ini sudah diproses');

    // Update step
    const stepUpdate: any = {
      status: action === 'approve' ? 'APPROVED' : action === 'revise' ? 'REVISED' : 'REJECTED',
      notes,
      reviewedAt: new Date(),
    };

    if (signature || action === 'approve') {
      stepUpdate.signedAt = new Date();
      stepUpdate.signatureData = signature || null;
    }

    await this.prisma.approvalStep.update({ where: { id: currentStep.id }, data: stepUpdate });

    if (action === 'reject') {
      // Reject entire request
      await this.prisma.approvalRequest.update({ where: { id: requestId }, data: { status: 'REJECTED' } });
      return { message: 'Approval ditolak', status: 'REJECTED' };
    }

    if (action === 'revise') {
      // Stay on same step, but mark as revised and set all future steps back
      await this.prisma.approvalRequest.update({ where: { id: requestId }, data: { currentStep: req.currentStep } });
      // Reset future steps
      await this.prisma.approvalStep.updateMany({
        where: { requestId, stepOrder: { gt: req.currentStep } },
        data: { status: 'WAITING', notes: null, reviewedAt: null, signedAt: null, signatureData: null },
      });
      return { message: 'Direvisi — menunggu perbaikan dari pengaju', status: 'IN_PROGRESS', currentStep: req.currentStep };
    }

    // APPROVED — move to next step or complete
    if (req.currentStep >= req.totalSteps) {
      // All steps complete
      await this.prisma.approvalRequest.update({ where: { id: requestId }, data: { status: 'APPROVED' } });
      // If linked to letter, update letter status
      if (req.letterId) {
        await this.prisma.letter.update({ where: { id: req.letterId }, data: { status: 'APPROVED' } });
      }
      return { message: 'Semua jenjang approval selesai — disetujui', status: 'APPROVED' };
    }

    // Advance to next step
    await this.prisma.approvalRequest.update({
      where: { id: requestId },
      data: { currentStep: req.currentStep + 1 },
    });

    return { message: `Disetujui — diteruskan ke ${req.steps[req.currentStep]?.level || 'level berikutnya'}`, status: 'IN_PROGRESS', currentStep: req.currentStep + 1 };
  }

  async submitRevision(requestId: string, userId: string, notes: string) {
    const req = await this.findById(requestId);
    if (req.createdById !== userId) throw new BadRequestException('Hanya pengaju yang bisa submit revisi');

    const currentStep = req.steps.find(s => s.stepOrder === req.currentStep);
    if (!currentStep || currentStep.status !== 'REVISED') throw new BadRequestException('Tidak ada revisi pending');

    await this.prisma.approvalStep.update({
      where: { id: currentStep.id },
      data: { status: 'WAITING', notes: `${currentStep.notes || ''}\nRevisi diajukan: ${notes}` },
    });

    return { message: 'Revisi diajukan kembali', status: 'IN_PROGRESS' };
  }
}
