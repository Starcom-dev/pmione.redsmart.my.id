 import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ArchivesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, search?: string, category?: string) {
    const where: any = {};
    if (category && category !== 'all') where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search.toLowerCase() } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.archive.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.archive.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async findById(id: string) {
    const item = await this.prisma.archive.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Arsip tidak ditemukan');
    // Find related documents
    const related = await this.prisma.archive.findMany({
      where: {
        id: { not: id },
        OR: [
          { category: item.category },
          { tags: { hasSome: item.tags } },
        ],
      },
      take: 5,
    });
    return { ...item, related };
  }

  async aiSearch(query: string, page = 1, limit = 10) {
    // Semantic search  --  expand keywords with synonyms + fuzzy matching
    const keywords = this.extractKeywords(query);
    const where: any = {
      OR: [
        // Full title match
        ...keywords.map(k => ({ title: { contains: k, mode: 'insensitive' as const } })),
        // Description match
        ...keywords.map(k => ({ description: { contains: k, mode: 'insensitive' as const } })),
        // Tags match
        { tags: { hasSome: keywords } },
        // Category match (e.g. "keuangan" matches category FINANCE)
        { category: { in: this.mapCategoryKeywords(keywords) } },
      ],
    };
    const [data, total] = await Promise.all([
      this.prisma.archive.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.archive.count({ where }),
    ]);
    return {
      data: data.map(d => ({
        ...d,
        relevance: this.calculateRelevance(d, keywords),
      })),
      total, page, limit,
      query,
      keywords,
    };
  }

  async aiSuggest(query: string) {
    const keywords = this.extractKeywords(query);
    if (keywords.length === 0) return [];
    // Find similar titles for suggestions
    const results = await this.prisma.archive.findMany({
      where: {
        OR: keywords.map(k => ({ title: { contains: k, mode: 'insensitive' as const } })),
      },
      take: 5,
      select: { title: true },
      orderBy: { createdAt: 'desc' },
    });
    return results.map(r => r.title);
  }

  async getStats() {
    const [total, byCategory, expiring] = await Promise.all([
      this.prisma.archive.count(),
      this.prisma.archive.groupBy({ by: ['category'], _count: true }),
      this.prisma.archive.count({
        where: {
          retentionUntil: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            gte: new Date(),
          },
        },
      }),
    ]);
    const categoryStats = byCategory.map(c => ({ category: c.category, count: c._count }));
    return { total, byCategory: categoryStats, expiring };
  }

  async getTagCloud() {
    const archives = await this.prisma.archive.findMany({ select: { tags: true } });
    const tagCount: Record<string, number> = {};
    for (const a of archives) {
      for (const tag of a.tags) {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      }
    }
    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);
  }

  async getTimeline(year?: number) {
    const where: any = {};
    if (year) {
      where.createdAt = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      };
    }
    const archives = await this.prisma.archive.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, category: true, createdAt: true },
    });
    // Group by month
    const timeline: Record<string, any[]> = {};
    for (const a of archives) {
      const month = a.createdAt.toISOString().slice(0, 7);
      if (!timeline[month]) timeline[month] = [];
      timeline[month].push(a);
    }
    return { timeline, years: await this.getYears() };
  }

  private async getYears() {
    const archives = await this.prisma.archive.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 1,
    });
    const latest = await this.prisma.archive.findMany({
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
    if (archives.length === 0) return [];
    const start = archives[0].createdAt.getFullYear();
    const end = latest[0]?.createdAt.getFullYear() || start;
    const years: number[] = [];
    for (let y = start; y <= end; y++) years.push(y);
    return years;
  }

  // AI helpers
  private extractKeywords(query: string): string[] {
    // Remove stop words, split, filter short words
    const stopWords = ['dan', 'di', 'ke', 'dari', 'yang', 'ini', 'itu', 'dengan', 'untuk', 'pada', 'adalah', 'tentang', 'surat', 'dokumen', 'arsip', 'cari', 'saya', 'ada'];
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w));
  }

  private mapCategoryKeywords(keywords: string[]): string[] {
    const map: Record<string, string[]> = {
      ADMINISTRATION: ['administrasi', 'surat', 'sk', 'nota', 'dinas', 'edaran', 'peraturan'],
      FINANCE: ['keuangan', 'anggaran', 'rka', 'lpj', 'dana', 'pembayaran', 'invoice', 'kwitansi'],
      HR: ['pegawai', 'kepegawaian', 'sk', 'kenaikan', 'pangkat', 'cuti', 'mutasi'],
      OPERATIONS: ['operasional', 'bencana', 'posko', 'tanggap', 'darurat', 'logistik'],
      LOGISTICS: ['logistik', 'gudang', 'stok', 'pengadaan', 'distribusi', 'barang'],
      TRAINING: ['pelatihan', 'diklat', 'sertifikasi', 'workshop', 'training', 'kursus'],
      LEGAL: ['hukum', 'peraturan', 'uu', 'mou', 'perjanjian', 'kontrak', 'legal'],
    };
    const categories: string[] = [];
    for (const kw of keywords) {
      for (const [cat, words] of Object.entries(map)) {
        if (words.some(w => kw.includes(w) || w.includes(kw))) {
          categories.push(cat);
        }
      }
    }
    return [...new Set(categories)];
  }

  private calculateRelevance(doc: any, keywords: string[]): number {
    let score = 0;
    const title = (doc.title || '').toLowerCase();
    const desc = (doc.description || '').toLowerCase();
    for (const kw of keywords) {
      if (title.includes(kw)) score += 3;
      if (desc.includes(kw)) score += 1;
      if (doc.tags?.includes(kw)) score += 2;
    }
    return Math.min(score, 100);
  }

  async create(dto: any) {
    // AI auto-tagging
    const autoTags = this.generateTags(dto.title, dto.description);
    return this.prisma.archive.create({
      data: { ...dto, tags: [...new Set([...(dto.tags || []), ...(typeof autoTags === 'string' ? [autoTags] : autoTags)])] },
    });
  }

  async update(id: string, dto: any) {
    await this.findById(id);
    return this.prisma.archive.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.archive.delete({ where: { id } });
    return { message: 'Arsip berhasil dihapus' };
  }

  private generateTags(title = '', desc = ''): string[] {
    const text = `${title} ${desc}`.toLowerCase();
    const tags: string[] = [];
    const tagPatterns: [RegExp, string][] = [
      [/surat|nota dinas|edaran|instruksi|sk|keputusan/i, 'surat'],
      [/laporan|report/i, 'laporan'],
      [/keuangan|anggaran|rka|lpj|dana|pembayaran/i, 'keuangan'],
      [/pegawai|kepegawaian|simpeg|kenaikan pangkat|mutasi/i, 'kepegawaian'],
      [/bencana|tanggap darurat|posko|evakuasi/i, 'kebencanaan'],
      [/donor darah|udd|transfusi/i, 'donor-darah'],
      [/pelatihan|diklat|sertifikasi|workshop|training/i, 'pelatihan'],
      [/mou|perjanjian|kerjasama|mitra/i, 'mou'],
      [/logistik|gudang|stok|pengadaan|distribusi/i, 'logistik'],
      [/relawan|volunteer|sukarelawan/i, 'relawan'],
      [/ambulans|armada|kendaraan/i, 'ambulans'],
      [/sop|standar operasional|prosedur/i, 'sop'],
      [/2024|2025|2026|2027/i, '2026'],
    ];
    for (const [pattern, tag] of tagPatterns) {
      if (pattern.test(text)) tags.push(tag);
    }
    return [...new Set(tags)];
  }
}
