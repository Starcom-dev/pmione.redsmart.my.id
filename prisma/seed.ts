// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding PMI One Ã¢â‚¬â€ PMI DKI Jakarta...\n');

  // ============================================
  // ROLES & PERMISSIONS
  // ============================================
  const roles = await Promise.all([
    prisma.role.upsert({ where: { name: 'superadmin' }, update: {}, create: { name: 'superadmin', description: 'Super Administrator' } }),
    prisma.role.upsert({ where: { name: 'admin' }, update: {}, create: { name: 'admin', description: 'Administrator PMI Provinsi' } }),
    prisma.role.upsert({ where: { name: 'kepala_bidang' }, update: {}, create: { name: 'kepala_bidang', description: 'Kepala Bidang' } }),
    prisma.role.upsert({ where: { name: 'kasi' }, update: {}, create: { name: 'kasi', description: 'Kepala Seksi' } }),
    prisma.role.upsert({ where: { name: 'staff' }, update: {}, create: { name: 'staff', description: 'Staff Operasional' } }),
    prisma.role.upsert({ where: { name: 'relawan' }, update: {}, create: { name: 'relawan', description: 'Relawan Kemanusiaan' } }),
  ]);
  console.log(`${roles.length} roles`);

  const mods = ['users','roles','letters','archives','meetings','employees','volunteers','finance','donations','emergency','warehouse','assets','ambulance','work-orders','trainings','blood-donations','mous'];
  for (const m of mods) for (const a of ['read','create','update','delete','approve']) {
    await prisma.permission.upsert({ where: { name: `${m}:${a}` }, update: {}, create: { name: `${m}:${a}`, module: m } });
  }
  console.log('Permissions created');

  const srole = await prisma.role.findUnique({ where: { name: 'superadmin' } });
  const perms = await prisma.permission.findMany();
  for (const p of perms) {
    await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: srole!.id, permissionId: p.id } }, update: {}, create: { roleId: srole!.id, permissionId: p.id } });
  }

  // ============================================
  // USERS Ã¢â‚¬â€ Realistic PMI DKI Jakarta
  // ============================================
  const pw = await bcrypt.hash('AdminPMI2026!', 12);
  const userPw = await bcrypt.hash('Pmi2026!', 12);

  const users = [
    { email: 'admin@pmijakarta.id', fullName: 'Dr. H. Dede Supriyatna, M.M.', nip: '196504152000031001', position: 'Ketua PMI DKI Jakarta', phone: '021-3906666', role: 'superadmin' },
    { email: 'wakil@pmijakarta.id', fullName: 'H. Mursidan, S.E., M.Si.', nip: '197012012005021003', position: 'Wakil Ketua', phone: '021-3906667', role: 'admin' },
    { email: 'sekretaris@pmijakarta.id', fullName: 'Ir. Hj. Siti Nurhasanah, M.M.', nip: '197508152008122004', position: 'Sekretaris', phone: '021-3906668', role: 'admin' },
    { email: 'kbdm@pmijakarta.id', fullName: 'drg. Hj. Eka Marhaeniwati', nip: '197203032010012006', position: 'Kepala Bidang Penanggulangan Bencana', phone: '021-3906669', role: 'kepala_bidang' },
    { email: 'kbdd@pmijakarta.id', fullName: 'H. Achmad Firdaus, S.Sos.', nip: '198005212015071002', position: 'Kepala Bidang Donor Darah', phone: '021-3906670', role: 'kepala_bidang' },
    { email: 'kbdm_keuangan@pmijakarta.id', fullName: 'Rina Marlina, S.E., Ak.', nip: '198506122018092007', position: 'Kepala Bidang Keuangan', phone: '021-3906671', role: 'kepala_bidang' },
    { email: 'staff_bencana1@pmijakarta.id', fullName: 'Ahmad Syahroni, A.Md.', nip: '199004052020011001', position: 'Staff Tanggap Darurat', phone: '0856-1234-0101', role: 'staff' },
    { email: 'staff_donor1@pmijakarta.id', fullName: 'Dewi Anggraini, A.Md.Kep.', nip: '199208112021062003', position: 'Staff Donor Darah', phone: '0856-1234-0102', role: 'staff' },
    { email: 'staff_logistik1@pmijakarta.id', fullName: 'Rudi Hartono, S.T.', nip: '199307182022011002', position: 'Staff Logistik & Gudang', phone: '0856-1234-0103', role: 'staff' },
    { email: 'staff_keuangan1@pmijakarta.id', fullName: 'Fitriani Kusuma, S.E.', nip: '199503252023072004', position: 'Staff Keuangan', phone: '0856-1234-0104', role: 'staff' },
    { email: 'staff_humas1@pmijakarta.id', fullName: 'Bayu Prasetyo, S.I.Kom.', nip: '199605302024011003', position: 'Staff Humas & Komunikasi', phone: '0856-1234-0105', role: 'staff' },
  ];

  for (const u of users) {
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { fullName: u.fullName, nip: u.nip, position: u.position, phone: u.phone },
      create: { email: u.email, password: u.email.includes('admin') ? pw : userPw, fullName: u.fullName, nip: u.nip, position: u.position, phone: u.phone },
    });
    const role = await prisma.role.findFirst({ where: { name: u.role } });
    if (role) await prisma.userRole.upsert({ where: { userId_roleId: { userId: created.id, roleId: role.id } }, update: {}, create: { userId: created.id, roleId: role.id } });
  }
  console.log(`${users.length} users created`);

  // ============================================
  // EMPLOYEES Ã¢â‚¬â€ SIMPEG DKI Jakarta
  // ============================================
  const employeeData = [
    { fullName: 'Dr. H. Dede Supriyatna, M.M.', nip: '196504152000031001', nik: '3174011504650001', position: 'Ketua', unit: 'Pusat', joinDate: new Date('2000-03-15'), status: 'ACTIVE' },
    { fullName: 'H. Mursidan, S.E., M.Si.', nip: '197012012005021003', nik: '3174020112700002', position: 'Wakil Ketua', unit: 'Pusat', joinDate: new Date('2005-02-01'), status: 'ACTIVE' },
    { fullName: 'Ir. Hj. Siti Nurhasanah, M.M.', nip: '197508152008122004', nik: '3174031508750003', position: 'Sekretaris', unit: 'Pusat', joinDate: new Date('2008-12-15'), status: 'ACTIVE' },
    { fullName: 'drg. Hj. Eka Marhaeniwati', nip: '197203032010012006', nik: '3174010303720004', position: 'Kabid. Penanggulangan Bencana', unit: 'Bidang PB', joinDate: new Date('2010-01-10'), status: 'ACTIVE' },
    { fullName: 'H. Achmad Firdaus, S.Sos.', nip: '198005212015071002', nik: '3174052105800005', position: 'Kabid. Donor Darah', unit: 'Bidang DD', joinDate: new Date('2015-07-01'), status: 'ACTIVE' },
    { fullName: 'Rina Marlina, S.E., Ak.', nip: '198506122018092007', nik: '3174031206850006', position: 'Kabid. Keuangan', unit: 'Bidang Keu', joinDate: new Date('2018-09-01'), status: 'ACTIVE' },
    { fullName: 'Ahmad Syahroni, A.Md.', nip: '199004052020011001', nik: '3174040504900007', position: 'Staff Tanggap Darurat', unit: 'Bidang PB', joinDate: new Date('2020-01-15'), status: 'ACTIVE' },
    { fullName: 'Dewi Anggraini, A.Md.Kep.', nip: '199208112021062003', nik: '3174021108920008', position: 'Staff Donor Darah', unit: 'Bidang DD', joinDate: new Date('2021-06-01'), status: 'ACTIVE' },
    { fullName: 'Rudi Hartono, S.T.', nip: '199307182022011002', nik: '3174051807930009', position: 'Staff Logistik', unit: 'Bidang PB', joinDate: new Date('2022-01-10'), status: 'ACTIVE' },
    { fullName: 'Fitriani Kusuma, S.E.', nip: '199503252023072004', nik: '3174042503950010', position: 'Staff Keuangan', unit: 'Bidang Keu', joinDate: new Date('2023-07-01'), status: 'ACTIVE' },
    { fullName: 'Bayu Prasetyo, S.I.Kom.', nip: '199605302024011003', nik: '3174023005960011', position: 'Staff Humas', unit: 'Humas', joinDate: new Date('2024-01-15'), status: 'ACTIVE' },
    { fullName: 'Nurul Hidayah, S.K.M.', nip: '199709062022091004', nik: '3174060609970012', position: 'Staff Kesehatan', unit: 'Bidang DD', joinDate: new Date('2022-09-01'), status: 'ACTIVE' },
  ];

  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@pmijakarta.id' } });
  for (let i = 0; i < employeeData.length; i++) {
    const e = employeeData[i];
    const user = await prisma.user.findFirst({ where: { nip: e.nip } });
    if (!user) continue;
    await prisma.employee.upsert({
      where: { nip: e.nip },
      update: { userId: user.id },
      create: {
        userId: user.id,
        nip: e.nip, nik: e.nik, fullName: e.fullName, position: e.position,
        unit: e.unit, status: e.status as any, joinDate: e.joinDate,
        gender: i % 2 === 0 ? 'L' : 'P', bloodType: ['A','B','O','AB'][i % 4],
        religion: 'Islam', address: `Jl. PMI No. ${i+1}, Jakarta ${['Pusat','Utara','Barat','Selatan','Timur'][i%5]}`,
        phone: `0856-1234-${(100+i).toString().padStart(4,'0')}`,
      },
    });
  }
  console.log(`${employeeData.length} employees`);

  // ============================================
  // LETTERS Ã¢â‚¬â€ Surat dengan konten nyata
  // ============================================
  const letters = [
    {
      letterNumber: 'PMI-DKI/UND/001/VII/2026', subject: 'Undangan Rapat Koordinasi Penanggulangan Bencana Semester II',
      type: 'OUTGOING', status: 'SIGNED', priority: 'high',
      senderInstitution: 'PMI DKI Jakarta',
      body: 'Sehubungan dengan akan berakhirnya Semester I Tahun 2026, bersama ini kami mengundang Bapak/Ibu untuk menghadiri Rapat Koordinasi Penanggulangan Bencana yang akan diselenggarakan pada:\n\nHari/Tanggal: Kamis, 24 Juli 2026\nWaktu: 09.00 - 12.00 WIB\nTempat: Ruang Rapat Utama Lt. 2, Gedung PMI DKI Jakarta\n\nAgenda:\n1. Evaluasi program penanggulangan bencana Semester I 2026\n2. Rencana kerja dan kesiapsiagaan Semester II 2026\n3. Koordinasi lintas sektor dengan BPBD DKI Jakarta\n\nMengingat pentingnya acara ini, kehadiran Bapak/Ibu sangat diharapkan.',
      tags: ['rapat', 'kebencanaan', 'koordinasi'],
    },
    {
      letterNumber: 'PMI-DKI/SRT/002/VII/2026', subject: 'Pemberitahuan Kegiatan Donor Darah Massal HUT PMI ke-81',
      type: 'OUTGOING', status: 'SIGNED', priority: 'medium',
      senderInstitution: 'PMI DKI Jakarta',
      body: 'Dalam rangka memperingati Hari Ulang Tahun PMI ke-81, PMI DKI Jakarta akan menyelenggarakan kegiatan Donor Darah Massal yang akan dilaksanakan pada:\n\nHari/Tanggal: Sabtu-Minggu, 13-14 September 2026\nWaktu: 08.00 - 15.00 WIB\nLokasi: Plaza Parkir Timur Gelora Bung Karno, Jakarta Pusat\n\nTarget: 1.000 kantong darah\n\nKami mengundang seluruh elemen masyarakat untuk berpartisipasi. Tersedia pemeriksaan kesehatan gratis, souvenir, dan doorprize menarik.',
      tags: ['donor darah', 'HUT PMI', 'kegiatan'],
    },
    {
      letterNumber: 'DINKES/SPT/089/VII/2026', subject: 'Permohonan Bantuan Ambulans untuk Kegiatan Vaksinasi Massal',
      type: 'INCOMING', status: 'APPROVED', priority: 'high',
      senderInstitution: 'Dinas Kesehatan DKI Jakarta',
      body: 'Bersama ini kami dari Dinas Kesehatan Provinsi DKI Jakarta mengajukan permohonan bantuan 5 unit ambulans PMI untuk mendukung kegiatan Vaksinasi Massal COVID-19 dan Influenza yang akan diselenggarakan di 5 titik lokasi di wilayah DKI Jakarta pada tanggal 1-5 Agustus 2026.\n\nAdapun rincian lokasi sebagai berikut:\n1. GOR Jakarta Pusat\n2. GOR Jakarta Utara\n3. GOR Jakarta Barat\n4. GOR Jakarta Selatan\n5. GOR Jakarta Timur\n\nDemikian permohonan ini kami sampaikan, atas perhatian dan kerjasamanya kami ucapkan terima kasih.',
      tags: ['kesehatan', 'ambulans', 'vaksinasi'],
    },
    {
      letterNumber: 'BPBD-DKI/LAP/112/VII/2026', subject: 'Laporan Situasi Banjir Wilayah Jakarta Timur dan Selatan',
      type: 'INCOMING', status: 'APPROVED', priority: 'critical',
      senderInstitution: 'BPBD DKI Jakarta',
      body: 'Menindaklanjuti hujan deras yang terjadi pada tanggal 15-16 Juli 2026, bersama ini kami sampaikan laporan situasi terkini:\n\n1. Wilayah Terdampak: Kec. Cawang, Kec. Bidara Cina, Kec. Kampung Melayu, Kec. Kebon Baru\n2. Ketinggian Air: 50-150 cm\n3. Jumlah Pengungsi: Ã‚Â± 2.500 jiwa\n4. Posko Pengungsian: 8 titik\n\nKami memohon dukungan PMI DKI Jakarta untuk:\na. Tambahan tenda pengungsian (10 unit)\nb. Dapur umum (2 unit)\nc. Relawan medis (20 orang)\nd. Logistik (makanan siap saji, air bersih, selimut)',
      tags: ['banjir', 'darurat', 'BPBD'],
    },
    {
      letterNumber: 'PMI-DKI/ND/003/VII/2026', subject: 'Nota Dinas Ã¢â‚¬â€ Pengadaan Kendaraan Operasional Ambulans 2026',
      type: 'INTERNAL', status: 'DRAFT', priority: 'medium',
      senderInstitution: 'Bidang Penanggulangan Bencana',
      body: 'Memperhatikan semakin meningkatnya kebutuhan layanan ambulans di wilayah DKI Jakarta, bersama ini kami mengajukan usulan pengadaan kendaraan operasional ambulans untuk Tahun Anggaran 2026 dengan rincian:\n\n1. Ambulans Transport: 3 unit (Toyota HiAce)\n2. Ambulans Gawat Darurat (AGD): 2 unit (Mercedes Sprinter)\n3. Motor Ambulans: 5 unit (Yamaha NMax)\n\nEstimasi total kebutuhan: Rp 5.250.000.000 (Lima Miliar Dua Ratus Lima Puluh Juta Rupiah)\n\nDemikian nota dinas ini kami sampaikan untuk mendapatkan persetujuan lebih lanjut.',
      tags: ['pengadaan', 'ambulans', 'anggaran'],
    },
    {
      letterNumber: 'PMI-PUSAT/ED/045/VII/2026', subject: 'Edaran Ã¢â‚¬â€ Penerapan Standar Operasional Prosedur Gudang Logistik Bencana',
      type: 'INCOMING', status: 'APPROVED', priority: 'medium',
      senderInstitution: 'PMI Pusat',
      body: 'Menindaklanjuti hasil evaluasi penanganan bencana nasional, PMI Pusat menetapkan Standar Operasional Prosedur (SOP) baru untuk pengelolaan Gudang Logistik Bencana yang wajib diterapkan oleh seluruh PMI Provinsi dan Kabupaten/Kota, sebagai berikut:\n\n1. Sistem FIFO (First In First Out) untuk semua item logistik\n2. Pencatatan digital real-time menggunakan sistem terintegrasi\n3. Inspeksi rutin setiap 2 minggu untuk item dengan masa kadaluarsa < 3 bulan\n4. Threshold minimum stok: 500 paket sembako, 200 tenda, 1.000 selimut\n5. Pelaporan stok bulanan ke PMI Pusat\n\nBatas waktu implementasi: 31 Agustus 2026.',
      tags: ['SOP', 'gudang', 'logistik'],
    },
    {
      letterNumber: 'PMI-DKI/KEL/004/VII/2026', subject: 'Surat Keluar Ã¢â‚¬â€ Balasan Permohonan Bantuan Ambulans',
      type: 'OUTGOING', status: 'SIGNED', priority: 'high',
      senderInstitution: 'PMI DKI Jakarta',
      body: 'Menindaklanjuti surat dari Dinas Kesehatan DKI Jakarta Nomor DINKES/SPT/089/VII/2026 perihal Permohonan Bantuan Ambulans, bersama ini kami sampaikan bahwa PMI DKI Jakarta menyetujui untuk mengerahkan 5 unit ambulans beserta tenaga medis pada kegiatan Vaksinasi Massal tanggal 1-5 Agustus 2026.\n\nAdapun rincian personel:\n1. Dokter: 5 orang\n2. Perawat: 10 orang\n3. Driver: 5 orang\n\nKoordinator lapangan: Ahmad Syahroni, A.Md. (0856-1234-0101)',
      tags: ['balasan', 'ambulans', 'vaksinasi'],
    },
  ];

  for (const l of letters) {
    await prisma.letter.upsert({
      where: { letterNumber: l.letterNumber },
      update: { body: l.body, tags: l.tags },
      create: {
        ...l, type: l.type as any, status: l.status as any, createdById: adminUser!.id,
        senderId: l.type === 'INTERNAL' ? (await prisma.user.findFirst({ where: { position: { contains: 'Bencana' } } }))?.id : undefined,
        signedAt: l.status === 'SIGNED' ? new Date() : undefined,
      },
    });
  }
  console.log(`${letters.length} letters`);

  // ============================================
  // DISPOSITIONS
  // ============================================
  const letter1 = await prisma.letter.findUnique({ where: { letterNumber: 'DINKES/SPT/089/VII/2026' } });
  const letter2 = await prisma.letter.findUnique({ where: { letterNumber: 'BPBD-DKI/LAP/112/VII/2026' } });
  const kabidPB = await prisma.user.findUnique({ where: { email: 'kbdm@pmijakarta.id' } });
  const staffTD = await prisma.user.findUnique({ where: { email: 'staff_bencana1@pmijakarta.id' } });
  const kabidDD = await prisma.user.findUnique({ where: { email: 'kbdd@pmijakarta.id' } });

  if (letter1 && kabidPB && staffTD) {
    await prisma.disposition.upsert({
      where: { id: 'disp-001' },
      update: {},
      create: { id: 'disp-001', letterId: letter1.id, userId: kabidPB.id, instruction: 'Mohon ditindaklanjuti. Siapkan 5 unit ambulans dan koordinir personel untuk kegiatan vaksinasi 1-5 Agustus.', note: 'Prioritas tinggi Ã¢â‚¬â€ segera proses', isCompleted: false },
    });
    await prisma.disposition.upsert({
      where: { id: 'disp-002' },
      update: {},
      create: { id: 'disp-002', letterId: letter1.id, userId: staffTD.id, instruction: 'Koordinasikan jadwal ambulans dan personel untuk 5 lokasi. Hubungi Dinkes untuk detail teknis.', isCompleted: false },
    });
  }

  if (letter2 && kabidPB) {
    await prisma.disposition.upsert({
      where: { id: 'disp-003' },
      update: {},
      create: { id: 'disp-003', letterId: letter2.id, userId: kabidPB.id, instruction: 'SEGERA Ã¢â‚¬â€ Aktifkan Posko Jakarta Timur dan Selatan. Kerahkan relawan dan logistik.', note: 'Status: DARURAT BANJIR', isCompleted: false },
    });
  }
  console.log('Dispositions created');

  // ============================================
  // MEETINGS
  // ============================================
  const meetings = [
    { title: 'Rapat Koordinasi Penanggulangan Bencana Semester II', agenda: 'Evaluasi program kebencanaan S1 2026, rencana S2, koordinasi BPBD', location: 'Ruang Rapat Utama Lt. 2', startTime: new Date('2026-07-24T09:00:00+07:00'), endTime: new Date('2026-07-24T12:00:00+07:00'), status: 'SCHEDULED' },
    { title: 'Rapat Perencanaan Donor Darah Massal HUT PMI ke-81', agenda: 'Pembahasan teknis pelaksanaan donor darah massal GBK, pembagian tugas, estimasi kebutuhan', location: 'Ruang Rapat Bidang Donor Darah Lt. 3', startTime: new Date('2026-07-28T10:00:00+07:00'), endTime: new Date('2026-07-28T12:00:00+07:00'), status: 'SCHEDULED' },
    { title: 'Koordinasi Pengadaan Ambulans 2026', agenda: 'Review spesifikasi teknis, vendor, timeline pengadaan', location: 'Ruang Rapat Utama Lt. 2', startTime: new Date('2026-07-21T13:00:00+07:00'), endTime: new Date('2026-07-21T15:00:00+07:00'), status: 'SCHEDULED' },
    { title: 'Evaluasi Bulanan Kinerja UDD PMI DKI', agenda: 'Review capaian donor darah Juli 2026, kendala, rencana Agustus', location: 'Ruang Rapat UDD Lt. 1', startTime: new Date('2026-07-18T09:00:00+07:00'), endTime: new Date('2026-07-18T11:00:00+07:00'), status: 'COMPLETED' },
    { title: 'Rapat Kerja Tahunan PMI DKI Jakarta 2026', agenda: 'Penyusunan RKA 2027, evaluasi program 2026, pembahasan isu strategis', location: 'Hotel Grand Sahid, Jl. Jend. Sudirman', startTime: new Date('2026-08-10T08:00:00+07:00'), endTime: new Date('2026-08-11T17:00:00+07:00'), status: 'SCHEDULED' },
  ];

  for (const m of meetings) {
    const mt = await prisma.meeting.create({ data: { ...m, organizerId: adminUser!.id, status: m.status as any } });
    // Add attendees
    const allUsers = await prisma.user.findMany({ take: 5 });
    for (const u of allUsers) {
      await prisma.meetingAttendee.upsert({ where: { meetingId_userId: { meetingId: mt.id, userId: u.id } }, update: {}, create: { meetingId: mt.id, userId: u.id } });
    }
  }
  console.log(`${meetings.length} meetings with attendees`);

  // ============================================
  // EMERGENCY POSTS Ã¢â‚¬â€ Posko Darurat DKI Jakarta
  // ============================================
  const posko = [
    { name: 'Posko PMI Jakarta Pusat', location: 'Jl. Kramat Raya No. 47, Senen, Jakarta Pusat 10450', lat: -6.1865, lng: 106.8434, capacity: 100, status: 'ACTIVE', contactPhone: '021-3906666' },
    { name: 'Posko PMI Jakarta Timur', location: 'Jl. Matraman Raya No. 123, Matraman, Jakarta Timur 13140', lat: -6.2088, lng: 106.8633, capacity: 80, status: 'ACTIVE', contactPhone: '021-85901234' },
    { name: 'Posko PMI Jakarta Selatan', location: 'Jl. Warung Buncit Raya No. 45, Mampang, Jakarta Selatan 12790', lat: -6.2598, lng: 106.8185, capacity: 80, status: 'STANDBY', contactPhone: '021-7981234' },
    { name: 'Posko PMI Jakarta Barat', location: 'Jl. Daan Mogot KM 11, Cengkareng, Jakarta Barat 11730', lat: -6.1487, lng: 106.7343, capacity: 80, status: 'STANDBY', contactPhone: '021-5436789' },
    { name: 'Posko PMI Jakarta Utara', location: 'Jl. Plumpang Raya No. 56, Koja, Jakarta Utara 14260', lat: -6.1180, lng: 106.9065, capacity: 80, status: 'STANDBY', contactPhone: '021-4301234' },
    { name: 'Posko PMI Kepulauan Seribu', location: 'Pulau Pramuka, Kepulauan Seribu 14520', lat: -5.7460, lng: 106.6120, capacity: 30, status: 'STANDBY', contactPhone: '021-6712345' },
  ];

  for (const p of posko) {
    await prisma.emergencyPost.create({ data: { name: p.name, location: p.location, latitude: p.lat, longitude: p.lng, capacity: p.capacity, status: p.status as any, contactPhone: p.contactPhone } });
  }
  console.log(`${posko.length} emergency posts`);

  // SITUATION REPORTS
  for (const p of posko.slice(0, 2)) {
    const post = await prisma.emergencyPost.findFirst({ where: { name: p.name } });
    if (post) {
      await prisma.situationReport.create({
        data: {
          postId: post.id, reportNumber: `SITREP-${post.name.split(' ').pop()}-001/VII/2026`,
          title: `Laporan Situasi ${post.name}`,
          level: p.name.includes('Timur') ? 'CRITICAL' : 'INFO' as any,
          description: p.name.includes('Timur')
            ? 'Banjir dengan ketinggian 50-150cm di wilayah Cawang, Bidara Cina, Kampung Melayu. 2.500 jiwa mengungsi, 8 titik pengungsian aktif. Kebutuhan mendesak: tenda tambahan, dapur umum, air bersih, makanan siap saji.'
            : 'Situasi normal. Posko dalam kondisi siaga. Stok logistik tersedia. Personel piket 24 jam.',
          affectedPeople: p.name.includes('Timur') ? 2500 : 0,
          deployedVolunteers: p.name.includes('Timur') ? 40 : 5,
          resourcesNeeded: p.name.includes('Timur') ? 'Tenda 10 unit, Dapur umum 2, Air bersih 5.000L, Makanan siap saji 1.000 porsi' : '',
          status: 'PUBLISHED',
          createdById: adminUser!.id,
        },
      });
    }
  }
  console.log('Situation reports created');

  // ============================================
  // WAREHOUSE & INVENTORY
  // ============================================
  const warehouses = [
    { name: 'Gudang Logistik Bencana PMI DKI', location: 'Jl. Raya Bogor KM 25, Ciracas, Jakarta Timur', lat: -6.3487, lng: 106.8732, capacity: 2000, unit: 'm2' },
    { name: 'Gudang Donor Darah PMI DKI', location: 'Jl. Kramat Raya No. 47, Senen, Jakarta Pusat', lat: -6.1870, lng: 106.8430, capacity: 500, unit: 'm2' },
  ];

  for (const w of warehouses) {
    const wh = await prisma.warehouse.create({ data: { name: w.name, location: w.location, latitude: w.lat, longitude: w.lng, capacity: w.capacity, unit: w.unit, isActive: true } });
    // Inventory items
    const items = w.name.includes('Logistik') ? [
      { item: 'Tenda Pengungsian Regu', qty: 150, min: 50, unit: 'unit', category: 'Shelter' },
      { item: 'Selimut', qty: 2000, min: 500, unit: 'pcs', category: 'Non-Pangan' },
      { item: 'Matras/Tikar', qty: 800, min: 200, unit: 'pcs', category: 'Non-Pangan' },
      { item: 'Paket Sembako', qty: 500, min: 200, unit: 'paket', category: 'Pangan' },
      { item: 'Makanan Siap Saji', qty: 1000, min: 300, unit: 'porsi', category: 'Pangan' },
      { item: 'Air Mineral (Galon)', qty: 200, min: 50, unit: 'galon', category: 'Pangan' },
      { item: 'Hygiene Kit', qty: 300, min: 100, unit: 'paket', category: 'Kesehatan' },
      { item: 'Alat Pemadam Portable', qty: 50, min: 15, unit: 'unit', category: 'Peralatan' },
      { item: 'Genset Portable (5 KVA)', qty: 8, min: 2, unit: 'unit', category: 'Peralatan' },
      { item: 'Pompa Air Portable', qty: 12, min: 5, unit: 'unit', category: 'Peralatan' },
    ] : [
      { item: 'Kantung Darah 350ml', qty: 1200, min: 500, unit: 'kantung', category: 'Medis' },
      { item: 'Kantung Darah 450ml', qty: 800, min: 300, unit: 'kantung', category: 'Medis' },
      { item: 'Reagen Golongan Darah', qty: 50, min: 20, unit: 'kit', category: 'Lab' },
      { item: 'Jarum Donor', qty: 3000, min: 1000, unit: 'pcs', category: 'Alat Medis' },
      { item: 'Kapas Alkohol', qty: 500, min: 200, unit: 'box', category: 'Alat Medis' },
    ];

    for (const inv of items) {
      await prisma.inventory.create({
        data: {
          warehouseId: wh.id, itemName: inv.item, quantity: inv.qty,
          minThreshold: inv.min, unit: inv.unit, category: inv.category,
        },
      });
    }
  }
  console.log('Warehouses with inventory');

  // ============================================
  // ASSETS & FLEET
  // ============================================
  const assets = [
    { code: 'AST-001', name: 'Ambulans Transport Ã¢â‚¬â€ Toyota HiAce B 1001 PMI', category: 'Kendaraan', condition: 'GOOD', acquisitionDate: new Date('2024-03-15'), value: 650000000 },
    { code: 'AST-002', name: 'Ambulans Transport Ã¢â‚¬â€ Toyota HiAce B 1002 PMI', category: 'Kendaraan', condition: 'GOOD', acquisitionDate: new Date('2024-03-15'), value: 650000000 },
    { code: 'AST-003', name: 'Ambulans AGD Ã¢â‚¬â€ Mercedes Sprinter B 1003 PMI', category: 'Kendaraan', condition: 'GOOD', acquisitionDate: new Date('2024-06-20'), value: 1250000000 },
    { code: 'AST-004', name: 'Truk Logistik Ã¢â‚¬â€ Isuzu Elf B 9101 PMI', category: 'Kendaraan', condition: 'GOOD', acquisitionDate: new Date('2022-09-01'), value: 480000000 },
    { code: 'AST-005', name: 'Truk Tangki Air Ã¢â‚¬â€ Hino Dutro B 9102 PMI', category: 'Kendaraan', condition: 'NEEDS_REPAIR', acquisitionDate: new Date('2020-01-10'), value: 350000000 },
    { code: 'AST-006', name: 'Gedung PMI DKI Jakarta', category: 'Bangunan', condition: 'GOOD', acquisitionDate: new Date('2000-01-01'), value: 25000000000, location: 'Jl. Kramat Raya No. 47, Senen' },
    { code: 'AST-007', name: 'Genset 50 KVA Ã¢â‚¬â€ Gedung Utama', category: 'Peralatan', condition: 'GOOD', acquisitionDate: new Date('2023-05-01'), value: 280000000 },
    { code: 'AST-008', name: 'Dapur Umum Portable (3 set)', category: 'Peralatan', condition: 'GOOD', acquisitionDate: new Date('2023-05-01'), value: 150000000 },
  ];

  for (const a of assets) {
    await prisma.asset.upsert({
      where: { code: a.code },
      update: {},
      create: { ...a, condition: a.condition as any },
    });
  }
  console.log(`${assets.length} assets`);

  // Fleet
  const fleets = [
    { type: 'AMBULANCE', plateNumber: 'B 1001 PMI', brand: 'Toyota HiAce', model: '2024' },
    { type: 'AMBULANCE', plateNumber: 'B 1002 PMI', brand: 'Toyota HiAce', model: '2024' },
    { type: 'AMBULANCE', plateNumber: 'B 1003 PMI', brand: 'Mercedes-Benz Sprinter', model: '2024' },
    { type: 'TRUCK', plateNumber: 'B 9101 PMI', brand: 'Isuzu Elf', model: '2022' },
    { type: 'TRUCK', plateNumber: 'B 9102 PMI', brand: 'Hino Dutro', model: '2020' },
    { type: 'CAR', plateNumber: 'B 8001 PMI', brand: 'Toyota Innova', model: '2023' },
    { type: 'MOTORCYCLE', plateNumber: 'B 5001 PMI', brand: 'Yamaha NMax', model: '2023' },
    { type: 'MOTORCYCLE', plateNumber: 'B 5002 PMI', brand: 'Yamaha NMax', model: '2023' },
  ];

  for (const f of fleets) {
    await prisma.fleet.upsert({
      where: { plateNumber: f.plateNumber },
      update: {},
      create: { ...f, type: f.type as any, status: 'available', lastServiceAt: new Date('2026-06-01') },
    });
  }
  console.log(`${fleets.length} fleet vehicles`);

  // Ambulance bookings
  const bookingStatuses = ['WAITING', 'DISPATCHED', 'COMPLETED', 'COMPLETED', 'WAITING', 'WAITING'] as const;
  const bookingData = [
    { patientName: 'Siti Rohana', patientPhone: '0812-3456-7890', pickupAddress: 'Jl. Cempaka Putih No. 12, Jakarta Pusat', destination: 'RSUD Tarakan', emergencyNote: 'Kecelakaan lalu lintas, patah tulang kaki' },
    { patientName: 'Bpk. Hartono', patientPhone: '0813-4567-8901', pickupAddress: 'Jl. Matraman Raya No. 45, Jakarta Timur', destination: 'RS Cipto Mangunkusumo', emergencyNote: 'Sesak napas akut' },
    { patientName: 'An. Rafi Pratama', patientPhone: '0814-5678-9012', pickupAddress: 'Jl. Kebon Jeruk No. 8, Jakarta Barat', destination: 'RS Harapan Kita', emergencyNote: 'Demam tinggi, kejang' },
    { patientName: 'Ibu Marsinah', patientPhone: '0815-6789-0123', pickupAddress: 'Jl. Warung Buncit No. 33, Jakarta Selatan', destination: 'RS Fatmawati', emergencyNote: 'Pendarahan, usia lanjut' },
    { patientName: 'Bpk. Sukirman', patientPhone: '0816-7890-1234', pickupAddress: 'Jl. Plumpang No. 22, Jakarta Utara', destination: 'RSUD Koja', emergencyNote: null },
    { patientName: 'Ny. Ratna Dewi', patientPhone: '0817-8901-2345', pickupAddress: 'Jl. Pramuka No. 10, Jakarta Pusat', destination: 'RS Pertamina', emergencyNote: 'Pasca operasi, butuh transport' },
  ];

  const fleetList = await prisma.fleet.findMany({ where: { type: 'AMBULANCE' } });
  for (let i = 0; i < bookingData.length; i++) {
    await prisma.ambulanceBooking.create({
      data: {
        fleetId: fleetList[i % fleetList.length].id,
        ...bookingData[i],
        status: bookingStatuses[i],
        requestedAt: new Date(Date.now() - (i + 1) * 3600000),
        dispatchedAt: bookingStatuses[i] !== 'WAITING' ? new Date(Date.now() - i * 3600000) : null,
        completedAt: bookingStatuses[i] === 'COMPLETED' ? new Date(Date.now() - (i - 1) * 3600000) : null,
      },
    });
  }
  console.log('Ambulance bookings created');

  // ============================================
  // DONATIONS
  // ============================================
  const donations = [
    { source: 'CORPORATE', donorName: 'PT Astra International Tbk', amount: 500000000, date: new Date('2026-07-10'), campaign: 'Bulan Dana PMI 2026', verifiedBy: adminUser!.id, verifiedAt: new Date('2026-07-10') },
    { source: 'CORPORATE', donorName: 'PT Bank Mandiri Tbk', amount: 350000000, date: new Date('2026-07-05'), campaign: 'Bulan Dana PMI 2026', verifiedBy: adminUser!.id, verifiedAt: new Date('2026-07-05') },
    { source: 'CORPORATE', donorName: 'PT Unilever Indonesia', amount: 200000000, date: new Date('2026-06-28'), campaign: 'Bencana Banjir Jakarta', verifiedBy: adminUser!.id, verifiedAt: new Date('2026-06-28') },
    { source: 'INDIVIDUAL', donorName: 'H. Budi Santoso', amount: 50000000, date: new Date('2026-07-12'), campaign: 'Bulan Dana PMI 2026', verifiedBy: adminUser!.id, verifiedAt: new Date('2026-07-12') },
    { source: 'INDIVIDUAL', donorName: 'Hj. Kartini Abdullah', amount: 25000000, date: new Date('2026-07-08'), campaign: 'Donasi Kemanusiaan', verifiedBy: adminUser!.id, verifiedAt: new Date('2026-07-08') },
    { source: 'EVENT', donorName: 'Komunitas Motor Jakarta', amount: 15000000, date: new Date('2026-06-25'), campaign: 'Ride for Humanity', verifiedBy: null, verifiedAt: null },
    { source: 'MONTHLY_FUND', donorName: 'Donatur Rutin Juli 2026', amount: 120000000, date: new Date('2026-07-01'), campaign: 'Bulan Dana Bulanan', verifiedBy: adminUser!.id, verifiedAt: new Date('2026-07-02') },
    { source: 'DISASTER', donorName: 'Masyarakat Peduli Bencana', amount: 45000000, date: new Date('2026-07-16'), campaign: 'Tanggap Darurat Banjir Jaksel-Jaktim', verifiedBy: null, verifiedAt: null },
  ];

  for (const d of donations) {
    await prisma.donation.create({ data: { ...d, source: d.source as any, verifiedBy: d.verifiedBy, verifiedAt: d.verifiedAt } });
  }
  console.log(`${donations.length} donations`);

  // ============================================
  // FINANCE Ã¢â‚¬â€ Transactions
  // ============================================
  const transactions = [
    { date: new Date('2026-07-15'), description: 'Pembelian paket sembako untuk stok gudang bencana', category: 'Logistik', type: 'expense', amount: 25000000, reference: 'INV/LOG/0716/001' },
    { date: new Date('2026-07-12'), description: 'Biaya operasional posko banjir Jakarta Timur', category: 'Operasional', type: 'expense', amount: 15000000, reference: 'NOTA/OPS/0712/001' },
    { date: new Date('2026-07-10'), description: 'Donasi dari PT Astra International Ã¢â‚¬â€ Bulan Dana', category: 'Donasi Masuk', type: 'income', amount: 500000000, reference: 'TRF/ASTRA/0710/001' },
    { date: new Date('2026-07-08'), description: 'Pemeliharaan rutin ambulans B 1001-1003', category: 'Pemeliharaan', type: 'expense', amount: 12500000, reference: 'INV/BENGKEL/0708/001' },
    { date: new Date('2026-07-05'), description: 'Donasi dari PT Bank Mandiri Ã¢â‚¬â€ Bulan Dana', category: 'Donasi Masuk', type: 'income', amount: 350000000, reference: 'TRF/MANDIRI/0705/001' },
    { date: new Date('2026-07-01'), description: 'Penerimaan Bulan Dana bulanan dari donatur rutin', category: 'Donasi Masuk', type: 'income', amount: 120000000, reference: 'BD/JUL/2026' },
    { date: new Date('2026-06-28'), description: 'Pengadaan alat kesehatan posko bencana', category: 'Peralatan', type: 'expense', amount: 45000000, reference: 'INV/MED/0628/001' },
    { date: new Date('2026-06-25'), description: 'Biaya pelatihan relawan tanggap darurat', category: 'Pelatihan', type: 'expense', amount: 35000000, reference: 'NOTA/DIK/0625/001' },
    { date: new Date('2026-06-20'), description: 'Donasi dari PT Unilever untuk bencana banjir', category: 'Donasi Masuk', type: 'income', amount: 200000000, reference: 'TRF/UNI/0620/001' },
    { date: new Date('2026-06-15'), description: 'Sewa tenda dan peralatan untuk posko pengungsian', category: 'Operasional', type: 'expense', amount: 30000000, reference: 'INV/SEWA/0615/001' },
  ];

  let runningBalance = 2500000000;
  for (const t of transactions) {
    runningBalance += t.type === 'income' ? t.amount : -t.amount;
    await prisma.transaction.create({ data: { ...t, balance: runningBalance, createdBy: adminUser!.id } });
  }
  console.log(`${transactions.length} transactions`);

  // ============================================
  // BUDGETS (RKA)
  // ============================================
  const budgets = [
    { itemName: 'Pengadaan Ambulans Transport', category: 'Kendaraan', amount: 1950000000, unit: 'Bidang PB', year: 2026, status: 'APPROVED' },
    { itemName: 'Logistik Bencana (Sembako, Tenda, Selimut)', category: 'Logistik', amount: 1500000000, unit: 'Bidang PB', year: 2026, status: 'APPROVED' },
    { itemName: 'Donor Darah Massal HUT PMI ke-81', category: 'Kegiatan', amount: 500000000, unit: 'Bidang DD', year: 2026, status: 'APPROVED' },
    { itemName: 'Pelatihan Relawan Tanggap Darurat', category: 'Pelatihan', amount: 350000000, unit: 'Bidang PB', year: 2026, status: 'SUBMITTED' },
    { itemName: 'Renovasi Gudang Logistik Ciracas', category: 'Infrastruktur', amount: 750000000, unit: 'Bidang PB', year: 2026, status: 'DRAFT' },
    { itemName: 'Sistem Informasi PMI One (Tahap 1)', category: 'Teknologi', amount: 2500000000, unit: 'Pusat', year: 2026, status: 'APPROVED' },
  ];

  for (const b of budgets) {
    await prisma.budget.create({ data: { ...b, status: b.status as any } });
  }
  console.log(`${budgets.length} budget items`);

  // ============================================
  // BLOOD DONATION EVENTS
  // ============================================
  const bloodEvents = [
    { title: 'Donor Darah Massal HUT PMI ke-81', location: 'Plaza Parkir Timur GBK, Jakarta Pusat', startTime: new Date('2026-09-13T08:00:00+07:00'), endTime: new Date('2026-09-14T15:00:00+07:00'), targetDonors: 1000, registeredDonors: 234, collectedUnits: 0, status: 'scheduled', notes: 'Pemeriksaan kesehatan gratis, souvenir, doorprize' },
    { title: 'Donor Darah Rutin Ã¢â‚¬â€ PMI Jakarta Pusat', location: 'Gedung PMI DKI Jakarta, Lt. 1', startTime: new Date('2026-07-25T08:00:00+07:00'), endTime: new Date('2026-07-25T14:00:00+07:00'), targetDonors: 150, registeredDonors: 89, collectedUnits: 0, status: 'scheduled', notes: 'Donor rutin mingguan' },
    { title: 'Donor Darah Ã¢â‚¬â€ Corporate PT Astra', location: 'Gedung Astra, Jl. Gaya Motor Raya, Sunter', startTime: new Date('2026-07-22T09:00:00+07:00'), endTime: new Date('2026-07-22T15:00:00+07:00'), targetDonors: 200, registeredDonors: 156, collectedUnits: 0, status: 'scheduled', notes: 'Kerjasama CSR PT Astra' },
    { title: 'Donor Darah Keliling Ã¢â‚¬â€ Car Free Day', location: 'Jl. Sudirman-Thamrin, Jakarta Pusat', startTime: new Date('2026-07-20T06:00:00+07:00'), endTime: new Date('2026-07-20T10:00:00+07:00'), targetDonors: 100, registeredDonors: 45, collectedUnits: 0, status: 'scheduled', notes: '2 unit mobil donor CFD' },
  ];

  for (const ev of bloodEvents) {
    await prisma.bloodDonationEvent.create({ data: ev });
  }
  console.log(`${bloodEvents.length} blood donation events`);

  // ============================================
  // TRAININGS
  // ============================================
  const trainings = [
    { title: 'Pelatihan Tanggap Darurat Bencana Banjir', description: 'Pelatihan penanganan banjir: evakuasi, pertolongan pertama, manajemen posko pengungsian', location: 'Pusdiklat PMI DKI Jakarta', startDate: new Date('2026-08-05T08:00:00+07:00'), endDate: new Date('2026-08-07T17:00:00+07:00'), instructor: 'Tim Instruktur PMI Pusat', maxParticipants: 50 },
    { title: 'Workshop Manajemen Donor Darah Profesional', description: 'Workshop tata kelola UDD: skrining donor, pengolahan darah, distribusi, quality control', location: 'Ruang Diklat PMI DKI Jakarta', startDate: new Date('2026-08-12T08:00:00+07:00'), endDate: new Date('2026-08-13T16:00:00+07:00'), instructor: 'dr. Rizki Maulana, Sp.PK', maxParticipants: 30 },
    { title: 'Sertifikasi Relawan Kemanusiaan PMI', description: 'Sertifikasi relawan: BHD, PPGD, manajemen logistik bencana, komunikasi radio', location: 'Markas PMI DKI Jakarta', startDate: new Date('2026-08-19T08:00:00+07:00'), endDate: new Date('2026-08-21T17:00:00+07:00'), instructor: 'Tim Pelatih PMI DKI', maxParticipants: 40 },
  ];

  for (const t of trainings) {
    const tr = await prisma.training.create({ data: t });
    // Add some participants
    const staff = await prisma.user.findMany({ where: { position: { contains: 'Staff' } }, take: 3 });
    for (const s of staff) {
      await prisma.trainingParticipant.upsert({ where: { trainingId_userId: { trainingId: tr.id, userId: s.id } }, update: {}, create: { trainingId: tr.id, userId: s.id } });
    }
  }
  console.log(`${trainings.length} trainings`);

  // ============================================
  // MoU
  // ============================================
  const mous = [
    { partnerName: 'BPBD DKI Jakarta', title: 'MoU Kesiapsiagaan & Penanggulangan Bencana', signedAt: new Date('2026-01-15'), validUntil: new Date('2031-01-15'), status: 'active' },
    { partnerName: 'Dinas Kesehatan DKI Jakarta', title: 'MoU Layanan Ambulans & Donor Darah', signedAt: new Date('2025-06-10'), validUntil: new Date('2030-06-10'), status: 'active' },
    { partnerName: 'PT Astra International Tbk', title: 'MoU CSR Ã¢â‚¬â€ Program Kemanusiaan', signedAt: new Date('2026-03-20'), validUntil: new Date('2029-03-20'), status: 'active' },
    { partnerName: 'Palang Merah Singapura', title: 'MoU Pertukaran Relawan & Capacity Building', signedAt: new Date('2025-11-01'), validUntil: new Date('2028-11-01'), status: 'active' },
  ];

  for (const m of mous) {
    await prisma.mou.create({ data: { ...m, status: m.status, renewalReminder: true } });
  }
  console.log(`${mous.length} MoUs`);

  // ============================================
  // WORK ORDERS (BMS)
  // ============================================
  const techUser = await prisma.user.findFirst({ where: { email: 'staff_logistik1@pmijakarta.id' } });
  const workOrders = [
    { title: 'Perbaikan AC Ruang Rapat Utama Lt. 2', category: 'HVAC', priority: 'HIGH', status: 'IN_PROGRESS', building: 'Gedung Utama', floor: '2', room: 'Ruang Rapat Utama', notes: 'AC tidak dingin, perlu pengecekan freon dan kompresor' },
    { title: 'Penggantian Lampu Koridor Lt. 1-3', category: 'Elektrikal', priority: 'MEDIUM', status: 'OPEN', building: 'Gedung Utama', notes: '15 lampu mati, butuh penggantian LED' },
    { title: 'Kebocoran Atap Gudang Logistik Ciracas', category: 'Bangunan', priority: 'HIGH', status: 'OPEN', building: 'Gudang Ciracas', notes: 'Kebocoran di sudut timur gudang, berpotensi merusak stok logistik' },
    { title: 'Perawatan Rutin Genset 50 KVA', category: 'Pemeliharaan', priority: 'MEDIUM', status: 'COMPLETED', building: 'Gedung Utama', notes: 'Ganti oli, filter, pengecekan ATS' },
    { title: 'Pemasangan CCTV Area Parkir', category: 'Keamanan', priority: 'LOW', status: 'OPEN', building: 'Gedung Utama', notes: 'Penambahan 4 titik CCTV di area parkir belakang' },
  ];

  for (const wo of workOrders) {
    await prisma.workOrder.create({
      data: {
        ...wo, createdById: adminUser!.id,
        assignedToId: techUser?.id,
        completedAt: wo.status === 'COMPLETED' ? new Date('2026-07-10') : null,
        priority: wo.priority as any, status: wo.status as any,
      },
    });
  }
  console.log(`${workOrders.length} work orders`);

  // ============================================
  // ATTENDANCES
  // ============================================
  const employees = await prisma.employee.findMany({ take: 12 });
  for (const emp of employees) {
    for (let d = 0; d < 10; d++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const checkIn = new Date(date);
      checkIn.setHours(7, Math.floor(Math.random() * 30), 0, 0);
      const checkOut = new Date(date);
      checkOut.setHours(16, Math.floor(Math.random() * 30), 0, 0);
      await prisma.attendance.upsert({
        where: { id: `att-${emp.nip}-${d}` },
        update: {},
        create: {
          id: `att-${emp.nip}-${d}`, employeeId: emp.id, date,
          checkIn, checkOut, type: checkIn.getMinutes() > 15 ? 'LATE' : 'PRESENT',
        },
      });
    }
  }
  console.log('Attendance records created');

  // ============================================
  // VOLUNTEERS
  // ============================================
  const volunteers = [
    { fullName: 'Andi Pratama', phone: '0856-1111-1001', address: 'Jl. Mangga Besar No. 10, Jakarta Pusat', skills: ['PPGD', 'Evakuasi', 'Logistik'], certification: ['Sertifikasi Relawan PMI 2025'], status: 'active' },
    { fullName: 'Siti Nurhaliza', phone: '0856-1111-1002', address: 'Jl. Matraman No. 20, Jakarta Timur', skills: ['Keperawatan', 'Donor Darah'], certification: ['Sertifikasi PMI 2024', 'BHD'], status: 'active' },
    { fullName: 'Bambang Supriyadi', phone: '0856-1111-1003', address: 'Jl. Daan Mogot No. 30, Jakarta Barat', skills: ['Dapur Umum', 'Logistik', 'Komunikasi Radio'], certification: ['Sertifikasi Relawan PMI 2025'], status: 'active' },
    { fullName: 'Ratna Sari Dewi', phone: '0856-1111-1004', address: 'Jl. Warung Buncit No. 15, Jakarta Selatan', skills: ['Kesehatan', 'Psikososial', 'PPGD'], certification: ['Sertifikasi PMI 2026'], status: 'active' },
    { fullName: 'Hendra Gunawan', phone: '0856-1111-1005', address: 'Jl. Plumpang No. 25, Jakarta Utara', skills: ['Evakuasi Air', 'Pertolongan Pertama'], certification: ['Sertifikasi PMI 2025', 'Water Rescue'], status: 'active' },
    { fullName: 'Maya Indah Sari', phone: '0856-1111-1006', address: 'Jl. Pramuka No. 8, Jakarta Pusat', skills: ['Administrasi', 'Pendataan', 'IT'], certification: ['Sertifikasi Relawan PMI 2024'], status: 'active' },
    { fullName: 'Dimas Ardiansyah', phone: '0856-1111-1007', address: 'Jl. Rawamangun No. 12, Jakarta Timur', skills: ['Driver Ambulans', 'PPGD', 'Logistik'], certification: ['Sertifikasi PMI 2026', 'SIM B1 Umum'], status: 'active' },
    { fullName: 'Nia Kurniawati', phone: '0856-1111-1008', address: 'Jl. Cengkareng No. 5, Jakarta Barat', skills: ['Konselor Psikososial', 'Donor Darah'], certification: ['Sertifikasi PMI 2025'], status: 'inactive' },
    { fullName: 'Agus Setiawan', phone: '0856-1111-1009', address: 'Jl. Kebayoran No. 7, Jakarta Selatan', skills: ['Water Rescue', 'Evakuasi'], certification: ['Sertifikasi PMI 2025', 'Water Rescue Advanced'], status: 'active' },
    { fullName: 'Putri Ayu Lestari', phone: '0856-1111-1010', address: 'Jl. Kelapa Gading No. 3, Jakarta Utara', skills: ['Kesehatan', 'Gizi', 'Dapur Umum'], certification: ['Sertifikasi PMI 2026'], status: 'active' },
  ];

  for (const v of volunteers) {
    await prisma.volunteer.create({ data: v });
  }
  console.log(`${volunteers.length} volunteers`);

  // ============================================
  // ARCHIVES â€" Rich PMI DKI Document Repository
  // ============================================
  const now = new Date();
  const archives = [
    {
      title: 'Peraturan Gubernur DKI Jakarta No. 45 Tahun 2025 â€" Pedoman Penanggulangan Bencana Daerah',
      category: 'LEGAL', fileUrl: '/files/pergub-45-2025.pdf', fileSize: 2450000, mimeType: 'application/pdf',
      description: 'Peraturan Gubernur tentang pedoman teknis penanggulangan bencana di wilayah DKI Jakarta, mencakup mekanisme koordinasi BPBD-PMI, standar operasional posko darurat, dan protokol evakuasi warga.',
      tags: ['peraturan', 'kebencanaan', 'bpbd', 'sop', '2025'],
      retentionUntil: new Date('2030-12-31'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'SOP Penanganan Bencana Banjir PMI DKI Jakarta Rev. 3 â€" 2026',
      category: 'OPERATIONS', fileUrl: '/files/sop-banjir-2026.pdf', fileSize: 1800000, mimeType: 'application/pdf',
      description: 'Standar Operasional Prosedur lengkap untuk penanganan bencana banjir: aktivasi posko, assessment kerusakan, evakuasi, pendirian tenda pengungsian, dapur umum, distribusi logistik, dan koordinasi dengan BPBD. Revisi 3 dengan penambahan protokol tanggap banjir rob.',
      tags: ['sop', 'banjir', 'posko', 'evakuasi', 'logistik', '2026'],
      retentionUntil: new Date('2031-06-30'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Laporan Keuangan Tahunan PMI DKI Jakarta â€" Tahun Anggaran 2025 (Audited)',
      category: 'FINANCE', fileUrl: '/files/laporan-keuangan-2025.pdf', fileSize: 3200000, mimeType: 'application/pdf',
      description: 'Laporan keuangan PMI DKI Jakarta yang telah diaudit oleh Kantor Akuntan Publik. Mencakup neraca, laporan arus kas, laporan perubahan ekuitas, dan catatan atas laporan keuangan untuk tahun buku yang berakhir 31 Desember 2025.',
      tags: ['keuangan', 'laporan', 'audit', '2025', 'neraca'],
      retentionUntil: new Date('2035-12-31'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'MoU Kerjasama PMI DKI Jakarta dengan BPBD DKI â€" Kesiapsiagaan Bencana 2025-2030',
      category: 'LEGAL', fileUrl: '/files/mou-pmi-bpbd-2025.pdf', fileSize: 1200000, mimeType: 'application/pdf',
      description: 'Memorandum of Understanding antara PMI DKI Jakarta dan BPBD DKI Jakarta tentang kerjasama kesiapsiagaan dan penanggulangan bencana untuk periode 2025-2030. Mencakup pembagian tugas, sharing resources, pelatihan bersama, dan sistem peringatan dini terintegrasi.',
      tags: ['mou', 'bpbd', 'kebencanaan', 'kerjasama', '2025'],
      retentionUntil: new Date('2035-01-15'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'SK Pengurus PMI DKI Jakarta Masa Bakti 2024-2029',
      category: 'ADMINISTRATION', fileUrl: '/files/sk-pengurus-2024-2029.pdf', fileSize: 800000, mimeType: 'application/pdf',
      description: 'Surat Keputusan Pengurus PMI Provinsi DKI Jakarta masa bakti 2024-2029, mencakup susunan pengurus lengkap: Dewan Kehormatan, Pengurus Harian, Bidang-Bidang, dan Unit Pelaksana Teknis.',
      tags: ['sk', 'pengurus', 'organisasi', '2024'],
      retentionUntil: new Date('2034-12-31'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Laporan Kegiatan Donor Darah PMI DKI Jakarta â€" Semester I 2026',
      category: 'OPERATIONS', fileUrl: '/files/laporan-donor-s1-2026.pdf', fileSize: 1500000, mimeType: 'application/pdf',
      description: 'Laporan komprehensif kegiatan donor darah di 6 wilayah DKI Jakarta selama Semester I 2026. Total donor: 12.450 kantong, rincian per golongan darah, per wilayah, per bulan, dan analisis tren partisipasi masyarakat.',
      tags: ['laporan', 'donor-darah', '2026', 'statistik'],
      retentionUntil: new Date('2031-06-30'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Rencana Kerja Anggaran (RKA) PMI DKI Jakarta Tahun 2026',
      category: 'FINANCE', fileUrl: '/files/rka-2026.pdf', fileSize: 2100000, mimeType: 'application/pdf',
      description: 'Dokumen RKA lengkap tahun anggaran 2026, mencakup rencana program dan anggaran seluruh bidang: Penanggulangan Bencana (Rp 3.5B), Donor Darah (Rp 2.1B), SDM & Relawan (Rp 1.2B), Keuangan & Umum (Rp 1.8B), Teknologi Informasi â€" PMI One (Rp 2.5B).',
      tags: ['keuangan', 'anggaran', 'rka', '2026', 'program'],
      retentionUntil: new Date('2031-12-31'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Pedoman Teknis Pelaksanaan Dapur Umum dalam Operasi Tanggap Darurat',
      category: 'OPERATIONS', fileUrl: '/files/pedoman-dapur-umum.pdf', fileSize: 2500000, mimeType: 'application/pdf',
      description: 'Buku pedoman lengkap pengoperasian dapur umum PMI pada situasi tanggap darurat: spesifikasi peralatan, standar gizi (2.100 kkal/orang/hari), menu cycle 7 hari, protokol higiene, manajemen limbah, dan sistem distribusi makanan ke titik pengungsian.',
      tags: ['sop', 'dapur-umum', 'logistik', 'tanggap-darurat', 'gizi'],
      retentionUntil: new Date('2030-06-30'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Modul Pelatihan Tanggap Darurat Bencana â€" Basic Life Support & First Aid',
      category: 'TRAINING', fileUrl: '/files/modul-bls-firstaid.pdf', fileSize: 4500000, mimeType: 'application/pdf',
      description: 'Modul pelatihan standar PMI untuk Basic Life Support (BLS) dan First Aid. Mencakup: resusitasi jantung paru (RJP), penanganan luka, patah tulang, luka bakar, evakuasi korban, triase lapangan, dan psychological first aid.',
      tags: ['pelatihan', 'first-aid', 'bls', 'modul', 'kesehatan'],
      retentionUntil: new Date('2029-12-31'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Laporan Audit Internal Manajemen Mutu ISO 9001:2015 â€" PMI DKI Jakarta 2025',
      category: 'ADMINISTRATION', fileUrl: '/files/audit-iso-2025.pdf', fileSize: 1800000, mimeType: 'application/pdf',
      description: 'Hasil audit internal sistem manajemen mutu ISO 9001:2015 PMI DKI Jakarta. Temuan: 3 minor non-conformity (closed), 5 observation (improvement). Rekomendasi: digitalisasi proses administrasi, peningkatan traceability logistik bencana.',
      tags: ['audit', 'iso', 'mutu', '2025', 'laporan'],
      retentionUntil: new Date('2030-06-30'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Database Relawan PMI DKI Jakarta per Desember 2025 â€" Profil & Kompetensi',
      category: 'HR', fileUrl: '/files/database-relawan-2025.pdf', fileSize: 3200000, mimeType: 'application/pdf',
      description: 'Database lengkap 850 relawan aktif PMI DKI Jakarta: distribusi per wilayah, per keahlian (PPGD 45%, Logistik 20%, Dapur Umum 15%, Komunikasi 10%, Evakuasi Air 10%), tingkat sertifikasi, riwayat penugasan, dan availability score.',
      tags: ['relawan', 'database', 'simpeg', 'kompetensi', '2025'],
      retentionUntil: new Date('2030-12-31'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Keputusan Kepala PMI DKI No. 12/KPTS/PMI-DKI/I/2026 â€" Penetapan Tim Teknologi Informasi',
      category: 'ADMINISTRATION', fileUrl: '/files/sk-tim-ti-2026.pdf', fileSize: 600000, mimeType: 'application/pdf',
      description: 'SK pembentukan Tim Teknologi Informasi PMI DKI Jakarta dengan tugas: pengembangan platform PMI One, pemeliharaan infrastruktur IT, keamanan data, dan pelatihan digital untuk seluruh pegawai. Tim terdiri dari 5 orang dipimpin oleh Kabid Keuangan.',
      tags: ['sk', 'teknologi', 'pmi-one', '2026', 'organisasi'],
      retentionUntil: new Date('2031-01-31'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Kontrak Pengadaan 3 Unit Ambulans Transport Toyota HiAce â€" 2024',
      category: 'LOGISTICS', fileUrl: '/files/kontrak-ambulans-2024.pdf', fileSize: 900000, mimeType: 'application/pdf',
      description: 'Dokumen kontrak pengadaan 3 unit ambulans transport Toyota HiAce Commuter dari PT Astra International-TSO. Nilai kontrak: Rp 1.950.000.000. Termasuk spesifikasi kendaraan, peralatan medis onboard, jadwal pengiriman, dan garansi 3 tahun.',
      tags: ['pengadaan', 'ambulans', 'kontrak', '2024'],
      retentionUntil: new Date('2029-03-15'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Standar Nasional Indonesia (SNI) 8799:2019 â€" Penyelenggaraan Unit Donor Darah PMI',
      category: 'LEGAL', fileUrl: '/files/sni-udd-2019.pdf', fileSize: 1200000, mimeType: 'application/pdf',
      description: 'Dokumen SNI tentang standar penyelenggaraan Unit Donor Darah oleh PMI: persyaratan bangunan, peralatan, SDM, prosedur skrining donor, pengolahan darah, penyimpanan, distribusi, quality control, dan sistem informasi manajemen UDD.',
      tags: ['sni', 'donor-darah', 'standar', 'udd', 'regulasi'],
      retentionUntil: new Date('2029-12-31'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Laporan Evaluasi Pasca Bencana Banjir Jakarta â€" Januari 2026',
      category: 'OPERATIONS', fileUrl: '/files/evaluasi-banjir-januari-2026.pdf', fileSize: 2800000, mimeType: 'application/pdf',
      description: 'Laporan evaluasi menyeluruh pasca bencana banjir Jakarta 15-18 Januari 2026: kronologi kejadian, respon PMI (waktu aktivasi: 45 menit), sumber daya dikerahkan (80 relawan, 5 posko, 3 dapur umum, 10 ambulans), jumlah warga dilayani (3.200 jiwa), lessons learned, dan rekomendasi perbaikan.',
      tags: ['laporan', 'banjir', 'evaluasi', '2026', 'lesson-learned'],
      retentionUntil: new Date('2031-01-31'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Sertifikat ISO 9001:2015 â€" Sistem Manajemen Mutu PMI DKI Jakarta (2024-2027)',
      category: 'ADMINISTRATION', fileUrl: '/files/sertifikat-iso-2024.pdf', fileSize: 400000, mimeType: 'application/pdf',
      description: 'Sertifikat ISO 9001:2015 untuk Sistem Manajemen Mutu PMI Provinsi DKI Jakarta, diterbitkan oleh SGS Indonesia, berlaku 15 Maret 2024 s/d 14 Maret 2027. Scope: Pelayanan Kemanusiaan, Donor Darah, dan Penanggulangan Bencana.',
      tags: ['sertifikat', 'iso', 'mutu', '2024'],
      retentionUntil: new Date('2032-03-14'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Rencana Strategis PMI DKI Jakarta 2025-2029 â€" Roadmap Transformasi Digital',
      category: 'ADMINISTRATION', fileUrl: '/files/renstra-2025-2029.pdf', fileSize: 3500000, mimeType: 'application/pdf',
      description: 'Dokumen Renstra lengkap 2025-2029: Visi "PMI DKI sebagai organisasi kemanusiaan terdepan berbasis digital di Indonesia", 4 pilar strategis (Layanan Kemanusiaan Digital, SDM Profesional, Kemandirian Finansial, Tata Kelola Modern), 12 program prioritas termasuk PMI One.',
      tags: ['renstra', 'strategis', 'digital', '2025', 'roadmap'],
      retentionUntil: new Date('2034-12-31'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Surat Edaran No. 03/SE/PMI-DKI/VI/2026 â€" Kewajiban Arsip Digital untuk Seluruh Bidang',
      category: 'ADMINISTRATION', fileUrl: '/files/edaran-arsip-digital-2026.pdf', fileSize: 300000, mimeType: 'application/pdf',
      description: 'Edaran dari Sekretaris PMI DKI yang mewajibkan seluruh bidang dan unit untuk mengunggah dokumen penting ke sistem arsip digital PMI One paling lambat 31 Juli 2026. Mencakup ketentuan format file (PDF/A), standar penamaan, metadata wajib, dan kategori arsip.',
      tags: ['edaran', 'arsip', 'digital', '2026'],
      retentionUntil: new Date('2028-06-30'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Laporan Program Bulan Dana PMI DKI Jakarta â€" 2025',
      category: 'FINANCE', fileUrl: '/files/laporan-bulan-dana-2025.pdf', fileSize: 1600000, mimeType: 'application/pdf',
      description: 'Laporan pelaksanaan dan hasil Bulan Dana PMI 2025: target Rp 2 Miliar, realisasi Rp 2,1 Miliar (105%). Rincian per sumber: corporate 65%, individu 25%, event 10%. Penggunaan dana: operasional 60%, program kemanusiaan 30%, administrasi 10%.',
      tags: ['laporan', 'bulan-dana', 'donasi', '2025', 'keuangan'],
      retentionUntil: new Date('2030-12-31'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Panduan Teknis Sistem Informasi Manajemen Logistik Bencana (SIMLOG)',
      category: 'LOGISTICS', fileUrl: '/files/panduan-simlog.pdf', fileSize: 2200000, mimeType: 'application/pdf',
      description: 'Buku panduan penggunaan SIMLOG â€" sistem pencatatan logistik bencana digital. Mencakup: katalog item standar (200+ item), sistem FIFO, barcode/QR tracking, threshold otomatis, pelaporan real-time, integrasi dengan PMI One, dan disaster dashboard.',
      tags: ['logistik', 'simlog', 'panduan', 'teknologi', 'sop'],
      retentionUntil: new Date('2031-06-30'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Nota Kesepahaman PMI DKI dengan Dinas Kesehatan â€" Program Vaksinasi & Donor Darah 2025-2028',
      category: 'LEGAL', fileUrl: '/files/mou-dinkes-2025.pdf', fileSize: 800000, mimeType: 'application/pdf',
      description: 'MoU antara PMI DKI Jakarta dan Dinas Kesehatan Provinsi DKI Jakarta tentang kerjasama program vaksinasi massal dan donor darah terintegrasi. PMI menyediakan ambulans, tenaga medis, dan UDD; Dinkes menyediakan vaksin dan tenaga vaksinator.',
      tags: ['mou', 'dinkes', 'kesehatan', 'vaksinasi', 'donor-darah', '2025'],
      retentionUntil: new Date('2033-06-10'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Sertifikat Akreditasi Unit Donor Darah PMI DKI Jakarta â€" Grade A (2026-2029)',
      category: 'ADMINISTRATION', fileUrl: '/files/akreditasi-udd-2026.pdf', fileSize: 500000, mimeType: 'application/pdf',
      description: 'Sertifikat akreditasi UDD PMI DKI Jakarta dengan predikat Grade A dari Komite Akreditasi Nasional, berlaku 1 Februari 2026 s/d 31 Januari 2029. Grade A menunjukkan kepatuhan terhadap seluruh standar mutu, keamanan, dan profesionalisme pengelolaan darah.',
      tags: ['sertifikat', 'akreditasi', 'udd', 'donor-darah', '2026'],
      retentionUntil: new Date('2034-01-31'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Petunjuk Teknis Pemeliharaan Kendaraan Operasional PMI DKI Jakarta',
      category: 'LOGISTICS', fileUrl: '/files/juknis-pemeliharaan-armada.pdf', fileSize: 1500000, mimeType: 'application/pdf',
      description: 'Juknis pemeliharaan 8 unit kendaraan operasional: jadwal servis berkala (setiap 5.000 km / 3 bulan), checklist inspeksi harian, pengelolaan BBM, sistem pool kendaraan, prosedur peminjaman, dan standar kebersihan ambulans.',
      tags: ['sop', 'armada', 'pemeliharaan', 'ambulans', 'logistik'],
      retentionUntil: new Date('2030-06-30'),
      uploadedById: adminUser!.id,
    },
    {
      title: 'Data Statistik Bencana DKI Jakarta 2020-2025 â€" Analisis Tren & Prediksi',
      category: 'OPERATIONS', fileUrl: '/files/statistik-bencana-2020-2025.pdf', fileSize: 2800000, mimeType: 'application/pdf',
      description: 'Kompilasi data dan analisis statistik bencana di DKI Jakarta periode 2020-2025: banjir (65% kejadian), kebakaran (20%), gempa (5%), angin puting beliung (5%), tanah longsor (3%), lainnya (2%). Tren: peningkatan frekuensi banjir rob +45% sejak 2023. Prediksi 2026-2027 menggunakan model ARIMA.',
      tags: ['statistik', 'bencana', 'analisis', 'prediksi', 'data', 'penelitian'],
      retentionUntil: new Date('2035-12-31'),
      uploadedById: adminUser!.id,
    },
  ];

  for (const a of archives) {
    await prisma.archive.upsert({
      where: { id: `arch-${a.title.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}` },
      update: {},
      create: { id: `arch-${a.title.slice(0, 30).replace(/\s+/g, '-').toLowerCase()}`, ...a },
    });
  }
  console.log(`${archives.length} archives created`);
  console.log('\n=== PMI One seeding selesai ===');
  console.log('Login: admin@pmijakarta.id / AdminPMI2026!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
