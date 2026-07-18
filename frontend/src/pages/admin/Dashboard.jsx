import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { FileText, Users, Heart, AlertTriangle, Warehouse, Droplets, ArrowUpRight, Clock, TrendingUp, ChevronRight, CheckCircle, Calendar, BarChart3, Sparkles, ArrowRight, Bell } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [letters, setLetters] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const eps = ['letters','employees','volunteers','emergency','warehouse','donations','archives','assets','meetings'];
        const r = {};
        for (const ep of eps) {
          try { const { data } = await api.get(`/${ep}?limit=1`); r[ep] = data.total || 0; } catch { r[ep] = 0; }
        }
        setStats(r);
        const [{ data: l }, { data: d }] = await Promise.all([api.get('/letters?limit=5'), api.get('/donations?limit=5')]);
        setLetters(l.data || []);
        setDonations(d.data || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const kpi = [
    { label: 'Surat', value: stats.letters, icon: FileText, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', link: '/admin/letters' },
    { label: 'Pegawai', value: stats.employees, icon: Users, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600', link: '/admin/employees' },
    { label: 'Relawan', value: stats.volunteers, icon: Heart, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', text: 'text-pink-600', link: '/admin/volunteers' },
    { label: 'Posko', value: stats.emergency, icon: AlertTriangle, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600', link: '/admin/emergency' },
    { label: 'Gudang', value: stats.warehouse, icon: Warehouse, color: 'from-violet-500 to-purple-500', bg: 'bg-violet-50', text: 'text-violet-600', link: '/admin/warehouse' },
    { label: 'Donasi', value: stats.donations, icon: Droplets, color: 'from-red-500 to-rose-500', bg: 'bg-red-50', text: 'text-red-600', link: '/admin/donations' },
    { label: 'Arsip', value: stats.archives, icon: BarChart3, color: 'from-cyan-500 to-teal-500', bg: 'bg-cyan-50', text: 'text-cyan-600', link: '/admin/archives' },
    { label: 'Aset', value: stats.assets, icon: TrendingUp, color: 'from-indigo-500 to-blue-500', bg: 'bg-indigo-50', text: 'text-indigo-600', link: '/admin/assets' },
  ];

  return (
    <div>
      {/* Welcome Banner — full width gradient */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-3xl p-6 md:p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">PMI DKI Jakarta</span>
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1"><Clock size={10} />{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Selamat Datang, {user?.fullName?.split(' ').slice(0, 3).join(' ')}</h1>
            <p className="text-red-100 mt-1 text-sm md:text-base">Pantau operasional PMI DKI Jakarta secara real-time</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/letters" className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">Buat Surat <ArrowRight size={14} /></Link>
            <Link to="/admin/ai" className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5">AI Assistant <Sparkles size={14} /></Link>
          </div>
        </div>

        {/* Quick Stats inside banner */}
        <div className="relative z-10 grid grid-cols-4 gap-3 mt-6">
          {[
            { l: 'Total Dokumen', v: (stats.letters||0)+(stats.archives||0), c: 'bg-white/20' },
            { l: 'Total Personel', v: (stats.employees||0)+(stats.volunteers||0), c: 'bg-white/20' },
            { l: 'Posko Aktif', v: stats.emergency||0, c: 'bg-white/20' },
            { l: 'Rapat Bulan Ini', v: stats.meetings||0, c: 'bg-white/20' },
          ].map((s, i) => (
            <div key={i} className={`${s.c} backdrop-blur rounded-2xl p-3 text-center`}>
              <p className="text-2xl md:text-3xl font-extrabold">{s.v}</p>
              <p className="text-[10px] md:text-xs text-red-100 mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid — 4 columns, fills width */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
        {kpi.map((c, i) => (
          <Link key={i} to={c.link} className="bg-white rounded-2xl p-4 md:p-5 hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center`}>
                <c.icon size={20} className={c.text} />
              </div>
              <ArrowUpRight size={14} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
            </div>
            <p className="text-2xl md:text-3xl font-extrabold text-gray-900">{c.value ?? '-'}</p>
            <p className="text-xs text-gray-400 mt-1 font-medium">{c.label}</p>
          </Link>
        ))}
      </div>

      {/* Two Column Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — Recent Letters (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center"><FileText size={15} className="text-blue-600" /></div>
              <h3 className="font-bold text-gray-800 text-sm">Surat Terbaru</h3>
            </div>
            <Link to="/admin/letters" className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1 rounded-lg">Lihat Semua</Link>
          </div>
          <div>
            {letters.map((l, i) => (
              <div key={i} className="px-5 py-3 hover:bg-gray-50/50 transition-colors flex items-center gap-4 border-b border-gray-50 last:border-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  l.type === 'INCOMING' ? 'bg-blue-50 text-blue-600' : l.type === 'OUTGOING' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                }`}>
                  {l.type === 'INCOMING' ? <ArrowRight size={14} className="rotate-180" /> : l.type === 'OUTGOING' ? <ArrowRight size={14} /> : <FileText size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{l.subject}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{l.letterNumber} · {l.senderInstitution} · {new Date(l.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                  l.status === 'SIGNED' ? 'bg-emerald-50 text-emerald-700' : l.status === 'DRAFT' ? 'bg-gray-100 text-gray-600' : l.status === 'APPROVED' ? 'bg-blue-50 text-blue-700' : 'bg-yellow-50 text-yellow-700'
                }`}>{l.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (2 cols) — Donations + Quick Links */}
        <div className="lg:col-span-2 space-y-6">
          {/* Donations */}
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center"><Droplets size={15} className="text-red-600" /></div>
                <h3 className="font-bold text-gray-800 text-sm">Donasi Terbaru</h3>
              </div>
              <Link to="/admin/donations" className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 px-3 py-1 rounded-lg">Semua</Link>
            </div>
            <div>
              {donations.slice(0, 4).map((d, i) => (
                <div key={i} className="px-5 py-3 hover:bg-gray-50/50 transition-colors flex items-center justify-between border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{d.donorName || 'Anonim'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{d.campaign || d.source}</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-600 shrink-0 ml-3">Rp {(Number(d.amount)/1000000).toFixed(0)}M</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl p-5">
            <h3 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
              <ChevronRight size={16} className="text-red-600" /> Menu Cepat
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'AI Assistant', icon: Sparkles, link: '/admin/ai', color: 'bg-purple-50 text-purple-600' },
                { label: 'Presensi', icon: Clock, link: '/admin/presensi', color: 'bg-blue-50 text-blue-600' },
                { label: 'Reception', icon: Users, link: '/admin/reception', color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Arsip', icon: BarChart3, link: '/admin/archives', color: 'bg-amber-50 text-amber-600' },
                { label: 'Posko', icon: AlertTriangle, link: '/admin/emergency', color: 'bg-red-50 text-red-600' },
                { label: 'Gudang', icon: Warehouse, link: '/admin/warehouse', color: 'bg-indigo-50 text-indigo-600' },
              ].map((q, i) => (
                <Link key={i} to={q.link} className={`${q.color} rounded-xl p-3 text-sm font-semibold hover:opacity-80 transition-opacity flex items-center gap-2`}>
                  <q.icon size={16} /> {q.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
