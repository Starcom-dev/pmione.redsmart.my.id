import { useState, useEffect } from 'react';
import api from '../../api/client';
import { QrCode, UserPlus, LogOut, Users, Clock, Search, UserCheck, Building2, Car, Phone, FileText, History, TrendingUp } from 'lucide-react';

export default function ReceptionPage() {
  const [tab, setTab] = useState('lobby');
  const [today, setToday] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', purpose: '', hostName: '', vehicleNumber: '', notes: '' });
  const [showQr, setShowQr] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [t, s] = await Promise.all([api.get('/reception/today'), api.get('/reception/stats')]);
        setToday(t.data.data);
        setStats(s.data.data);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (tab === 'history') {
      api.get('/reception/history?limit=50').then(r => setHistory(r.data.data || [])).catch(() => {});
    }
  }, [tab]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/reception/check-in', form);
      setShowQr(data.data);
      setForm({ name: '', phone: '', purpose: '', hostName: '', vehicleNumber: '', notes: '' });
      const t = await api.get('/reception/today');
      setToday(t.data.data);
    } catch {}
    setLoading(false);
  };

  const handleCheckOut = async (id) => {
    await api.post(`/reception/check-out/${id}`);
    const t = await api.get('/reception/today');
    setToday(t.data.data);
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-[28px] font-extrabold text-gray-900 tracking-tight">Reception Lobby</h2>
          <p className="text-gray-400 text-sm mt-1">Buku tamu digital & QR visitor pass</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab('lobby')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'lobby' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Lobby
          </button>
          <button onClick={() => setTab('history')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${tab === 'history' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Riwayat
          </button>
        </div>
      </div>

      {tab === 'lobby' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-3 grid grid-cols-4 gap-3">
            {[
              { label: 'Tamu Hari Ini', value: today?.total || 0, icon: Users, color: 'text-blue-600' },
              { label: 'Sedang di Dalam', value: today?.checkedIn || 0, icon: UserCheck, color: 'text-emerald-600' },
              { label: 'Sudah Keluar', value: today?.checkedOut || 0, icon: LogOut, color: 'text-gray-600' },
              { label: 'Total Bulan Ini', value: stats?.monthTotal || 0, icon: TrendingUp, color: 'text-purple-600' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-2"><s.icon size={22} className={s.color} /></div>
                <p className="text-3xl font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Check-in Form */}
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center"><UserPlus size={16} className="text-red-600" /></div>
              <h3 className="font-bold text-gray-800">Check-in Tamu</h3>
            </div>
            <form onSubmit={handleCheckIn} className="space-y-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                placeholder="Nama lengkap *" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-red-400 outline-none" />
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required
                placeholder="No. HP *" type="tel" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-red-400 outline-none" />
              <input value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} required
                placeholder="Tujuan kunjungan *" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-red-400 outline-none" />
              <input value={form.hostName} onChange={e => setForm({...form, hostName: e.target.value})} required
                placeholder="Nama yang dituju *" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-red-400 outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <input value={form.vehicleNumber} onChange={e => setForm({...form, vehicleNumber: e.target.value})}
                  placeholder="No. kendaraan" className="px-4 py-3 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-red-400 outline-none" />
                <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                  placeholder="Catatan" className="px-4 py-3 bg-gray-50 rounded-xl text-sm focus:ring-2 focus:ring-red-400 outline-none" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                <UserPlus size={16} /> {loading ? 'Memproses...' : 'Check-in + Generate QR Pass'}
              </button>
            </form>
          </div>

          {/* QR Display */}
          {showQr && (
            <div className="bg-white rounded-2xl p-6 text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3"><QrCode size={16} className="text-purple-600" /></div>
              <h3 className="font-bold text-gray-800 mb-1">QR Visitor Pass</h3>
              <p className="text-xs text-gray-400 mb-4">{showQr.visitorName} - #{showQr.qrCode}</p>
              <div className="bg-gray-100 rounded-2xl p-8 mb-4 inline-block">
                <QrCode size={120} className="text-gray-800 mx-auto" />
                <p className="text-xs font-mono font-bold mt-3 text-gray-500">{showQr.qrCode}</p>
              </div>
              <div className="space-y-1 text-left text-sm text-gray-600">
                <div className="flex items-center gap-2"><UserCheck size={13} className="text-gray-400" />{showQr.visitorName}</div>
                <div className="flex items-center gap-2"><Building2 size={13} className="text-gray-400" />{showQr.hostName}</div>
                <div className="flex items-center gap-2"><Clock size={13} className="text-gray-400" />{new Date(showQr.checkInTime).toLocaleTimeString('id-ID')}</div>
                {showQr.vehicleNumber && <div className="flex items-center gap-2"><Car size={13} className="text-gray-400" />{showQr.vehicleNumber}</div>}
              </div>
              <button onClick={() => setShowQr(null)} className="mt-4 text-sm text-red-600 font-semibold hover:underline">Tutup</button>
            </div>
          )}

          {/* Today's Visitors */}
          <div className={showQr ? 'lg:col-span-1' : 'lg:col-span-2'}>
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2"><Users size={16} className="text-blue-600" /> Tamu Hari Ini</h3>
                <span className="text-xs text-gray-400">{today?.date}</span>
              </div>
              {today?.visitors?.length > 0 ? (
                <div className="space-y-px">
                  {today.visitors.map((v, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 px-3 hover:bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${v.status === 'CHECKED_IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                        {v.status === 'CHECKED_IN' ? <UserCheck size={15} /> : <LogOut size={15} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{v.visitorName}</p>
                        <p className="text-xs text-gray-400 truncate">{v.hostName} - {v.purpose}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-500">{new Date(v.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                        {v.status === 'CHECKED_IN' && (
                          <button onClick={() => handleCheckOut(v.id)}
                            className="text-xs text-red-600 hover:bg-red-50 px-2 py-0.5 rounded font-semibold mt-0.5">Checkout</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-gray-300">Belum ada tamu hari ini</p>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div>
          {history.length === 0 ? (
            <p className="py-16 text-center text-gray-300">Belum ada riwayat kunjungan</p>
          ) : (
            <div className="space-y-px">
              {history.map((v, i) => (
                <div key={i} className="flex items-center gap-4 py-2.5 px-3 hover:bg-gray-50 rounded-lg text-sm">
                  <span className="text-gray-400 w-24">{new Date(v.checkInTime).toLocaleDateString('id-ID')}</span>
                  <span className="font-medium text-gray-800 flex-1">{v.visitorName}</span>
                  <span className="text-gray-500 w-32 truncate">{v.hostName}</span>
                  <span className="text-gray-400 w-24 text-right">{new Date(v.checkInTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${v.status === 'CHECKED_IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{v.status === 'CHECKED_IN' ? 'Di Dalam' : 'Keluar'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
