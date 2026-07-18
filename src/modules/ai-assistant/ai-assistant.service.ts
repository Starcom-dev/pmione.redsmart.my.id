import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiAssistantService {
  constructor(private prisma: PrismaService) {}

  async ask(question: string) {
    const keywords = this.extractKeywords(question);
    if (keywords.length === 0) return { answer: 'Silakan tanyakan sesuatu yang lebih spesifik.', sources: [], suggestions: [] };

    // Search across multiple sources
    const [archives, letters, meetings, sops] = await Promise.all([
      this.searchArchives(keywords),
      this.searchLetters(keywords),
      this.searchMeetings(keywords),
      this.searchKnowledge(keywords),
    ]);

    // Combine and score results
    const allResults = [...archives, ...letters, ...meetings, ...sops]
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    // Generate answer from top result
    let answer = '';
    if (allResults.length > 0) {
      const top = allResults[0];
      answer = this.generateAnswer(question, top, allResults);
    } else {
      answer = 'Maaf, tidak menemukan dokumen yang relevan dengan pertanyaan Anda. Coba gunakan kata kunci yang berbeda.';
    }

    // Generate suggestions
    const suggestions = this.generateSuggestions(question, keywords);

    return {
      question,
      keywords,
      answer,
      sources: allResults.map(r => ({
        title: r.title,
        excerpt: r.excerpt?.slice(0, 200),
        type: r.type,
        id: r.id,
        score: r.score,
      })),
      suggestions,
      totalFound: archives.length + letters.length + meetings.length + sops.length,
    };
  }

  async suggest() {
    return [
      'Apa SOP penanganan banjir di PMI DKI?',
      'Bagaimana prosedur pengadaan ambulans?',
      'Kapan jadwal donor darah bulan ini?',
      'Berapa total donasi yang masuk tahun 2026?',
      'Apa isi MoU dengan BPBD DKI Jakarta?',
      'Bagaimana cara mengajukan cuti?',
      'Dimana lokasi posko darurat PMI?',
      'Apa isi Peraturan Gubernur tentang kebencanaan?',
    ];
  }

  private async searchArchives(keywords: string[]) {
    const results = await this.prisma.archive.findMany({
      where: {
        OR: [
          ...keywords.map(k => ({ title: { contains: k, mode: 'insensitive' as const } })),
          ...keywords.map(k => ({ description: { contains: k, mode: 'insensitive' as const } })),
          { tags: { hasSome: keywords } },
        ],
      },
      take: 10,
    });

    return results.map(r => ({
      id: r.id,
      title: r.title,
      excerpt: r.description,
      type: 'Arsip',
      score: this.calcScore(r.title + ' ' + (r.description || ''), keywords),
    }));
  }

  private async searchLetters(keywords: string[]) {
    const results = await this.prisma.letter.findMany({
      where: {
        OR: [
          ...keywords.map(k => ({ subject: { contains: k, mode: 'insensitive' as const } })),
          ...keywords.map(k => ({ body: { contains: k, mode: 'insensitive' as const } })),
          { tags: { hasSome: keywords } },
        ],
      },
      take: 5,
    });

    return results.map(r => ({
      id: r.id,
      title: r.subject,
      excerpt: r.body,
      type: 'Surat',
      score: this.calcScore(r.subject + ' ' + (r.body || ''), keywords),
    }));
  }

  private async searchMeetings(keywords: string[]) {
    const results = await this.prisma.meeting.findMany({
      where: {
        OR: [
          ...keywords.map(k => ({ title: { contains: k, mode: 'insensitive' as const } })),
          ...keywords.map(k => ({ agenda: { contains: k, mode: 'insensitive' as const } })),
        ],
      },
      take: 5,
    });

    return results.map(r => ({
      id: r.id,
      title: r.title,
      excerpt: r.agenda,
      type: 'Rapat',
      score: this.calcScore(r.title + ' ' + (r.agenda || ''), keywords),
    }));
  }

  private async searchKnowledge(keywords: string[]) {
    // Built-in PMI knowledge base
    const knowledgeBase = [
      { title: 'SOP Aktivasi Posko Darurat', excerpt: '1. Terima laporan bencana dari BPBD/masyarakat. 2. Verifikasi kejadian dalam 15 menit. 3. Aktivasi tim tanggap darurat. 4. Siapkan logistik dan ambulans. 5. Kirim tim ke lokasi. 6. Dirikan posko dalam 2 jam. 7. Koordinasi dengan BPBD dan kelurahan setempat.', keywords: ['sop', 'posko', 'aktivasi', 'darurat', 'bencana', 'prosedur', 'tanggap'] },
      { title: 'Prosedur Pengadaan Barang PMI', excerpt: '1. Unit mengajukan kebutuhan ke Kabid. 2. Kabid review dan ajukan ke Kabid Keuangan. 3. Kabid Keuangan verifikasi anggaran. 4. Proses tender/penunjukan langsung sesuai nilai. 5. Wakil Ketua setujui. 6. Ketua final approval. 7. Serah terima dan pencatatan aset.', keywords: ['pengadaan', 'barang', 'prosedur', 'tender', 'anggaran', 'approval'] },
      { title: 'Protokol Donor Darah PMI', excerpt: '1. Registrasi donor. 2. Skrining kesehatan (tekanan darah, HB, riwayat penyakit). 3. Konseling pra-donor. 4. Pengambilan darah (350ml). 5. Penanganan pasca-donor (istirahat 15 menit, konsumsi). 6. Pengolahan darah di lab UDD. 7. Penyimpanan dan distribusi.', keywords: ['donor', 'darah', 'protokol', 'prosedur', 'skrining', 'udd'] },
      { title: 'Standar Operasional Ambulans PMI', excerpt: 'Ambulans PMI DKI beroperasi 24 jam. Waktu respons maksimal 15 menit untuk area Jakarta Pusat, 25 menit untuk pinggiran. Armada: 3 unit Toyota HiAce ambulans transport, 1 unit Mercedes Sprinter AGD. Driver wajib memiliki SIM B1 Umum dan sertifikasi PPGD.', keywords: ['ambulans', 'standar', 'operasional', 'respons', 'armada', 'sop'] },
      { title: 'Kebijakan Cuti Pegawai PMI', excerpt: 'Cuti tahunan: 12 hari kerja. Cuti sakit: sesuai surat dokter. Cuti melahirkan: 3 bulan. Cuti alasan penting: maksimal 5 hari. Pengajuan cuti minimal 3 hari sebelum tanggal mulai via Kabid. Persetujuan bertingkat: Kasi -> Kabid.', keywords: ['cuti', 'pegawai', 'kebijakan', 'tahunan', 'sakit', 'melahirkan', 'prosedur'] },
      { title: 'Sistem Shift 24 Jam PMI DKI', excerpt: 'PMI DKI beroperasi 24 jam dengan 3 shift: Pagi (07.00-15.00), Siang (15.00-23.00), Malam (23.00-07.00). Setiap shift memiliki petugas piket di posko, ambulans, dan UDD. Shift malam mendapat tunjangan 25%.', keywords: ['shift', '24', 'jam', 'piket', 'pagi', 'siang', 'malam'] },
    ];

    const scored = knowledgeBase.map(kb => ({
      id: 'kb-' + kb.title,
      title: kb.title,
      excerpt: kb.excerpt,
      type: 'Knowledge Base',
      score: this.calcScore(kb.keywords.join(' '), keywords) * 2,
    }));

    return scored.filter(s => s.score > 0).slice(0, 5);
  }

  private extractKeywords(question: string): string[] {
    const stopWords = ['apa', 'bagaimana', 'dimana', 'kapan', 'siapa', 'mengapa', 'adalah', 'ini', 'itu', 'yang', 'dan', 'di', 'ke', 'dari', 'dengan', 'untuk', 'pada', 'tentang', 'saya', 'ada', 'tolong', 'bisa', 'bantu', 'cara', 'gimana', 'kah', 'nya'];
    return question
      .toLowerCase()
      .replace(/[?.,!]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.includes(w));
  }

  private calcScore(text: string, keywords: string[]): number {
    const lower = text.toLowerCase();
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += 10;
      // Bonus for exact word match
      const regex = new RegExp('\\b' + kw + '\\b', 'i');
      if (regex.test(lower)) score += 5;
    }
    return Math.min(score, 100);
  }

  private generateAnswer(question: string, top: any, all: any[]): string {
    const q = question.toLowerCase();

    // Try to give a contextual answer based on the question type
    if (q.includes('bagaimana') || q.includes('cara') || q.includes('prosedur') || q.includes('sop')) {
      return `Berdasarkan dokumen "${top.title}":\n\n${top.excerpt?.slice(0, 500) || 'Dokumen ditemukan, silakan buka detail untuk informasi lengkap.'}\n\nDitemukan ${all.length} dokumen terkait.`;
    }

    if (q.includes('apa') || q.includes('definisi')) {
      return `Dari dokumen "${top.title}":\n\n${top.excerpt?.slice(0, 500) || 'Informasi ditemukan dalam dokumen terkait.'}`;
    }

    if (q.includes('dimana') || q.includes('lokasi')) {
      return `Berdasarkan pencarian: "${top.title}"\n\n${top.excerpt?.slice(0, 500) || 'Informasi lokasi tersedia di dokumen terkait.'}`;
    }

    if (q.includes('kapan') || q.includes('jadwal') || q.includes('tanggal')) {
      return `Informasi dari "${top.title}":\n\n${top.excerpt?.slice(0, 500) || 'Jadwal tersedia di dokumen terkait.'}`;
    }

    // Default: show best match
    return `Dokumen paling relevan: "${top.title}"\n\n${top.excerpt?.slice(0, 500) || 'Dokumen ditemukan.'}\n\nTotal ${all.length} dokumen terkait ditemukan.`;
  }

  private generateSuggestions(question: string, keywords: string[]): string[] {
    const topicMap: Record<string, string[]> = {
      banjir: ['Apa SOP evakuasi banjir?', 'Dimana posko banjir terdekat?', 'Bagaimana prosedur dapur umum bencana?'],
      donor: ['Kapan jadwal donor darah?', 'Apa syarat menjadi donor?', 'Dimana lokasi donor darah terdekat?'],
      ambulans: ['Bagaimana cara memesan ambulans?', 'Berapa nomor darurat PMI?', 'Apa biaya ambulans PMI?'],
      cuti: ['Berapa jatah cuti tahunan?', 'Bagaimana prosedur cuti melahirkan?', 'Siapa yang menyetujui cuti?'],
      pegawai: ['Bagaimana struktur organisasi PMI?', 'Apa saja tunjangan pegawai PMI?', 'Bagaimana sistem shift PMI?'],
      keuangan: ['Berapa total anggaran PMI 2026?', 'Bagaimana prosedur LPJ?', 'Apa itu Bulan Dana PMI?'],
    };

    for (const [topic, suggestions] of Object.entries(topicMap)) {
      if (keywords.some(k => topic.includes(k) || k.includes(topic))) {
        return suggestions.slice(0, 3);
      }
    }

    return ['Apa saja layanan PMI DKI Jakarta?', 'Bagaimana cara menjadi relawan PMI?', 'Dimana kantor PMI DKI Jakarta?'];
  }
}
