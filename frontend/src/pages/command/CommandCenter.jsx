import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { AlertTriangle, MapPin, Users, Package, Radio, Activity, Shield, Zap } from 'lucide-react';

export default function CommandCenter() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: posts } = await api.get('/emergency?limit=10');
        setAlerts(posts.data?.filter(p => p.status === 'ACTIVE') || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <header className="bg-[#111827] border-b border-white/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap size={20} className="text-red-500" />
          <h1 className="font-bold text-lg">COMMAND CENTER</h1>
          <span className="text-xs bg-red-600 px-2 py-0.5 rounded-full">LIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => nav('/admin')} className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded">Admin</button>
          <button onClick={() => nav('/dashboard')} className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded">Dashboard</button>
          <span className="text-sm text-white/60">{user?.fullName}</span>
          <button onClick={() => { logout(); nav('/login'); }} className="p-1 hover:bg-white/10 rounded"><Shield size={14} /></button>
        </div>
      </header>

      <main className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4"><MapPin size={16} className="text-red-500" /><h2 className="font-semibold">Peta Operasi  --  Jakarta</h2></div>
            <div className="bg-[#0a0f1e] rounded-lg h-80 flex items-center justify-center border border-white/5">
              <p className="text-white/30 text-sm">Peta interaktif akan diintegrasikan (Leaflet/Mapbox)</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Posko Aktif', value: alerts.length, icon: AlertTriangle, color: 'text-red-400' },
              { label: 'Relawan Aktif', value: '-', icon: Users, color: 'text-blue-400' },
              { label: 'Ambulans Siaga', value: '-', icon: Radio, color: 'text-green-400' },
              { label: 'Stok Darah (Kantung)', value: '-', icon: Package, color: 'text-purple-400' },
            ].map((s, i) => (
              <div key={i} className="bg-[#111827] border border-white/5 rounded-xl p-4">
                <s.icon size={20} className={s.color} />
                <p className="text-2xl font-bold mt-2">{s.value}</p>
                <p className="text-xs text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4"><Activity size={16} className="text-yellow-500" /><h2 className="font-semibold">Alert Feed</h2></div>
            {loading ? (
              <p className="text-white/30 text-sm">Loading...</p>
            ) : alerts.length === 0 ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
                <Shield size={16} className="text-green-400" />
                <p className="text-green-300 text-sm">Tidak ada alert. Semua posko dalam kondisi standby.</p>
              </div>
            ) : alerts.map((a, i) => (
              <div key={i} className="bg-red-500/5 border border-red-500/20 rounded-lg p-3 mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-400" />
                  <p className="text-sm font-medium text-red-300">{a.name}</p>
                </div>
                <p className="text-xs text-red-400/70 mt-1">{a.location}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#111827] border border-white/5 rounded-xl p-5">
            <h2 className="font-semibold mb-3">AI Assistant</h2>
            <div className="bg-[#0a0f1e] rounded-lg p-3 border border-white/5">
              <p className="text-xs text-white/40">Ketik perintah untuk analisis situasi...</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
