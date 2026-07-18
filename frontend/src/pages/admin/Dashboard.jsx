import { useEffect, useState } from 'react';
import api from '../../api/client';
import { FileText, Users, Briefcase, Heart, AlertTriangle, Warehouse, Calendar, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      const endpoints = ['letters', 'employees', 'finance', 'volunteers', 'emergency', 'warehouse'];
      const results = {};
      for (const ep of endpoints) {
        try {
          const { data } = await api.get(`/${ep}?limit=1`);
          results[ep] = data.total || 0;
        } catch { results[ep] = 0; }
      }
      setStats(results);
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Surat', value: stats.letters, icon: FileText, color: 'bg-blue-500', link: '/admin/letters' },
    { label: 'Pegawai', value: stats.employees, icon: Users, color: 'bg-green-500', link: '/admin/employees' },
    { label: 'Transaksi Keuangan', value: stats.finance, icon: Briefcase, color: 'bg-purple-500', link: '/admin/finance' },
    { label: 'Relawan', value: stats.volunteers, icon: Heart, color: 'bg-pink-500', link: '/admin/volunteers' },
    { label: 'Posko Darurat', value: stats.emergency, icon: AlertTriangle, color: 'bg-orange-500', link: '/admin/emergency' },
    { label: 'Gudang', value: stats.warehouse, icon: Warehouse, color: 'bg-indigo-500', link: '/admin/warehouse' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang di PMI One  --  PMI DKI Jakarta</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {cards.map((card, i) => (
          <a key={i} href={card.link} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{card.value ?? '...'}</p>
              </div>
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon size={20} className="text-white" />
              </div>
            </div>
          </a>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-red-600" />
            <h3 className="font-semibold text-gray-800">Aktivitas Terbaru</h3>
          </div>
          <p className="text-gray-400 text-sm">Modul audit log akan ditampilkan di sini</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-red-600" />
            <h3 className="font-semibold text-gray-800">Agenda Mendatang</h3>
          </div>
          <p className="text-gray-400 text-sm">Jadwal rapat & event terdekat</p>
        </div>
      </div>
    </div>
  );
}
