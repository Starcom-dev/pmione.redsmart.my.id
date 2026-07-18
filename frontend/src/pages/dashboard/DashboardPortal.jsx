import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Activity, Users, FileText, TrendingUp, AlertTriangle, Warehouse, LogOut } from 'lucide-react';

export default function DashboardPortal() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [stats, setStats] = useState({});

  useEffect(() => {
    (async () => {
      const eps = ['letters','employees','volunteers','emergency','warehouse'];
      const r = {};
      for (const e of eps) { try { const {data} = await api.get('/'+e+'?limit=1'); r[e]=data.total; } catch {} }
      setStats(r);
    })();
  }, []);

  const cards = [
    { label: 'Total Surat', value: stats.letters, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'Pegawai', value: stats.employees, icon: Users, color: 'text-green-600 bg-green-50' },
    { label: 'Relawan', value: stats.volunteers, icon: Activity, color: 'text-pink-600 bg-pink-50' },
    { label: 'Posko Aktif', value: stats.emergency, icon: AlertTriangle, color: 'text-orange-600 bg-orange-50' },
    { label: 'Gudang', value: stats.warehouse, icon: Warehouse, color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">PMI One - Dashboard Pimpinan</h1>
          <p className="text-sm text-white/70">PMI DKI Jakarta</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => nav('/admin')} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">Admin Panel</button>
          <button onClick={() => nav('/command')} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">Command Center</button>
          <span className="text-sm text-white/80">{user?.fullName}</span>
          <button onClick={() => { logout(); nav('/login'); }} className="p-1.5 hover:bg-white/10 rounded"><LogOut size={16} /></button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {cards.map((c, i) => (
            <div key={i} className="bg-white border rounded-xl p-4">
              <div className={`w-10 h-10 ${c.color} rounded-lg flex items-center justify-center mb-3`}><c.icon size={18} /></div>
              <p className="text-2xl font-bold">{c.value ?? '-'}</p>
              <p className="text-xs text-gray-500 mt-1">{c.label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={18} /> Aktivitas Operasional</h3>
            <p className="text-gray-400 text-sm">Data aktivitas akan tampil di sini setelah modul audit terintegrasi.</p>
          </div>
          <div className="border rounded-xl p-6">
            <h3 className="font-semibold mb-4">AI Insight</h3>
            <p className="text-gray-400 text-sm">Analisis AI akan tersedia setelah integrasi modul AI.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
