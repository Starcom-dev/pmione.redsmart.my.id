import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class TteService {
  constructor(private prisma: PrismaService) {}

  async register(userId: string, signatureBase64: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User tidak ditemukan');

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });

    const signature = await this.prisma.digitalSignature.upsert({
      where: { userId },
      update: { certificate: signatureBase64, publicKey, privateKey, isActive: true },
      create: { userId, certificate: signatureBase64, publicKey, privateKey },
    });

    return { message: 'TTE berhasil diregistrasi', id: signature.id };
  }

  async signLetter(userId: string, letterId: string, signatureBase64: string) {
    const letter = await this.prisma.letter.findUnique({ where: { id: letterId } });
    if (!letter) throw new NotFoundException('Surat tidak ditemukan');

    const ts = new Date();
    const hash = crypto.createHash('sha256')
      .update(letterId + userId + ts.toISOString())
      .digest('hex');

    await this.prisma.letter.update({
      where: { id: letterId },
      data: {
        status: 'SIGNED',
        signedAt: ts,
        signedBy: userId,
        qrCodeUrl: `data:image/svg+xml,${encodeURIComponent(this.generateQrSvg(hash))}`,
      },
    });

    return { message: 'Surat berhasil ditandatangani', hash, signedAt: ts };
  }

  async verify(letterId: string) {
    const letter = await this.prisma.letter.findUnique({ where: { id: letterId } });
    if (!letter) throw new NotFoundException('Surat tidak ditemukan');
    return {
      letterNumber: letter.letterNumber,
      status: letter.status,
      signedAt: letter.signedAt,
      isValid: letter.status === 'SIGNED',
      verifiedBy: letter.signedBy || null,
    };
  }

  async getSignature(userId: string) {
    const sig = await this.prisma.digitalSignature.findUnique({ where: { userId } });
    if (!sig) return { registered: false };
    return { registered: true, certificate: sig.certificate, createdAt: sig.createdAt };
  }

  private generateQrSvg(data: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="white"/><text x="50" y="55" text-anchor="middle" font-size="8" fill="black">TTE-${data.slice(0, 16)}</text></svg>`;
  }
}
