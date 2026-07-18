import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PMI One database...');

  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'superadmin' }, update: {}, create: { name: 'superadmin', description: 'Super Administrator' } }),
    prisma.role.upsert({ where: { name: 'admin' }, update: {}, create: { name: 'admin', description: 'Administrator PMI' } }),
    prisma.role.upsert({ where: { name: 'kepala_bidang' }, update: {}, create: { name: 'kepala_bidang', description: 'Kepala Bidang' } }),
    prisma.role.upsert({ where: { name: 'staff' }, update: {}, create: { name: 'staff', description: 'Staff' } }),
    prisma.role.upsert({ where: { name: 'relawan' }, update: {}, create: { name: 'relawan', description: 'Relawan' } }),
    prisma.role.upsert({ where: { name: 'public' }, update: {}, create: { name: 'public', description: 'Publik' } }),
  ]);
  console.log(`${roles.length} roles created`);

  const mods = ['users','roles','letters','archives','meetings','employees','volunteers','finance','donations','emergency','warehouse','assets','ambulance','work-orders','trainings','blood-donations','mous'];
  for (const m of mods) {
    for (const a of ['read','create','update','delete','approve']) {
      await prisma.permission.upsert({ where: { name: `${m}:${a}` }, update: {}, create: { name: `${m}:${a}`, module: m } });
    }
  }
  console.log('Permissions created');

  const srole = await prisma.role.findUnique({ where: { name: 'superadmin' } });
  const perms = await prisma.permission.findMany();
  for (const p of perms) {
    await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: srole!.id, permissionId: p.id } }, update: {}, create: { roleId: srole!.id, permissionId: p.id } });
  }

  const pw = await bcrypt.hash('AdminPMI2026!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pmijakarta.id' },
    update: {},
    create: { email: 'admin@pmijakarta.id', password: pw, fullName: 'Administrator PMI DKI Jakarta', nip: 'PMI-0001', position: 'Administrator' },
  });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: srole!.id } }, update: {}, create: { userId: admin.id, roleId: srole!.id } });

  for (let i = 0; i < 5; i++) {
    const spw = await bcrypt.hash('Pmi2026!', 12);
    const u = await prisma.user.upsert({
      where: { email: `staff${i+1}@pmijakarta.id` },
      update: {},
      create: { email: `staff${i+1}@pmijakarta.id`, password: spw, fullName: `Staff PMI ${i+1}`, nip: `PMI-000${i+2}`, position: 'Staff' },
    });
    const sr = await prisma.role.findFirst({ where: { name: i === 0 ? 'kepala_bidang' : 'staff' } });
    if (sr) await prisma.userRole.upsert({ where: { userId_roleId: { userId: u.id, roleId: sr.id } }, update: {}, create: { userId: u.id, roleId: sr.id } });
  }
  console.log('Users created');

  for (let i = 1; i <= 5; i++) {
    await prisma.letter.upsert({
      where: { letterNumber: `PMI/2026/00${i}/VII` },
      update: {},
      create: { letterNumber: `PMI/2026/00${i}/VII`, subject: `Surat Contoh ${i}`, type: 'INCOMING' as any, status: 'APPROVED', priority: 'normal', senderInstitution: 'PMI DKI Jakarta', createdById: admin.id, tags: ['2026'] },
    });
  }

  await prisma.meeting.create({ data: { title: 'Rapat Koordinasi', agenda: 'Koordinasi program', location: 'Ruang Rapat Utama', startTime: new Date(Date.now() + 86400000), endTime: new Date(Date.now() + 93600000), organizerId: admin.id, status: 'SCHEDULED' } });

  await prisma.emergencyPost.create({ data: { name: 'Posko PMI Jakarta Pusat', location: 'Jl. Kramat Raya No. 47', latitude: -6.1865, longitude: 106.8434, status: 'STANDBY', contactPhone: '021-3906666', capacity: 50 } });
  await prisma.warehouse.create({ data: { name: 'Gudang Logistik PMI DKI', location: 'Ciracas', capacity: 1000, unit: 'm2', isActive: true } });
  await prisma.fleet.upsert({ where: { plateNumber: 'B 1234 PMI' }, update: {}, create: { type: 'AMBULANCE', plateNumber: 'B 1234 PMI', brand: 'Toyota HiAce', status: 'available' } });
  await prisma.bloodDonationEvent.create({ data: { title: 'Donor Darah Rutin', location: 'Gedung PMI DKI', startTime: new Date(Date.now() + 604800000), endTime: new Date(Date.now() + 626400000), targetDonors: 100, status: 'scheduled' } });

  console.log('PMI One seeding complete!');
  console.log('Admin: admin@pmijakarta.id / AdminPMI2026!');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
