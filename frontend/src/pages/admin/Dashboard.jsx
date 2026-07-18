import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { FileText, Users, Heart, AlertTriangle, Warehouse, Droplets, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const eps = ['letters','employees','volunteers','emergency','warehouse','donations'];
        const results = {};
        for (const ep of eps) {
          try { const { data } = await api.get(`/${ep}?limit=1`); results[ep] = data.total || 0; } catch { results[ep] = 0; }
        }
        setStats(results);
        const { data: lData } = await api.get('/letters?limit=6');
        setRecent(lData.data || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: 'Surat', value: stats.letters, icon: FileText, color: 'text-blue-600', link: '/admin/letters' },
    { label: 'Pegawai', value: stats.employees, icon: Users, color: 'text-emerald-600', link: '/admin/employees' },
    { label: 'Relawan', value: stats.volunteers, icon: Heart, color: 'text-pink-600', link: '/admin/volunteers' },
    { label: 'Posko', value: stats.emergency, icon: AlertTriangle, color: 'text-amber-600', link: '/admin/emergency' },
    { label: 'Gudang', value: stats.warehouse, icon: Warehouse, color: 'text-violet-600', link: '/admin/warehouse' },
    { label: 'Donasi', value: stats.donations, icon: Droplets, color: 'text-red-600', link: '/admin/donations' },
  ];

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-6xl">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-[32px] font-extrabold text-gray-900 tracking-tight leading-tight">
          Selamat datang,<br /><span className="text-red-600">{user?.fullName}</span>
        </h1>
        <p className="text-gray-400 mt-2 text-lg">PMI DKI Jakarta</p>
      </div>

      {/* Stats — minimal number cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {cards.map((c, i) => (
          <Link key={i} to={c.link} className="group">
            <div className="flex items-center gap-3 mb-2">
              <c.icon size={20} className={c.color} />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{c.label}</span>
            </div>
            <p className="text-4xl font-extrabold text-gray-900 tracking-tight">{c.value ?? '-'}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mb-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Aktivitas Terbaru</h3>
        <div>
          {recent.slice(0, 5).map((r, i) => (
            <Link key={i} to="/admin/letters"
              className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{r.subject}</p>
                <p className="text-xs text-gray-400 mt-0.5">{r.letterNumber} · {r.senderInstitution}</p>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  r.status === 'SIGNED' ? 'bg-emerald-50 text-emerald-700' :
                  r.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' :
                  'bg-blue-50 text-blue-700'
                }`}>{r.status}</span>
                <ArrowUpRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
