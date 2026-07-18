import { useState, useEffect } from 'react';
import api from '../../api/client';
import { Clock, CheckCircle, AlertCircle, Calendar, TrendingUp, UserCheck, UserX, LogIn, LogOut, Timer, FileText, BarChart3 } from 'lucide-react';

export default function PresensiPage() {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [sRes, hRes, shRes, lRes] = await Promise.all([
          api.get(`/presensi/summary?month=${month}&year=${year}`),
          api.get(`/presensi/history?limit=50&month=${month}&year=${year}`),
          api.get('/presensi/shifts'),
          api.get('/presensi/leaves?limit=10'),
        ]);
        setSummary(sRes.data.data);
        setHistory(hRes.data.data || []);
        setShifts(shRes.data.data || []);
        setLeaves(lRes.data.data || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [month, year]);

  const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  return (
    <div>
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-[28px] font-extrabold text-gray-900 tracking-tight">Presensi & Shift</h2>
          <p className="text-gray-400 text-sm mt-1">Absensi pegawai, shift 24 jam, dan cuti</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonth(m => m === 1 ? 12 : m - 1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">&#8592;</button>
          <span className="text-sm font-semibold text-gray-700 min-w-[100px] text-center">{monthNames[month-1]} {year}</span>
          <button onClick={() => setMonth(m => m === 12 ? 1 : m + 1)} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">&#8594;</button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center"><div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            {[
              { label: 'Hari Kerja', value: summary?.workDays, icon: Calendar, color: 'text-gray-600' },
              { label: 'Hadir', value: summary?.present, icon: UserCheck, color: 'text-emerald-600' },
              { label: 'Terlambat', value: summary?.late, icon: AlertCircle, color: 'text-amber-600' },
              { label: 'Tidak Hadir', value: summary?.absent, icon: UserX, color: 'text-red-600' },
              { label: 'Izin', value: summary?.permit, icon: FileText, color: 'text-blue-600' },
              { label: 'Sakit', value: summary?.sick, icon: Timer, color: 'text-purple-600' },
              { label: 'Total Record', value: summary?.records, icon: BarChart3, color: 'text-gray-600' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="flex justify-center mb-2"><s.icon size={22} className={s.color} /></div>
                <p className="text-3xl font-extrabold text-gray-900">{s.value ?? '-'}</p>
                <p className="text-xs text-gray-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tab bar */}
          <div className="flex gap-6 border-b border-gray-200 mb-6">
            {[
              { key: 'overview', label: 'Rekap' },
              { key: 'history', label: 'Riwayat' },
              { key: 'shifts', label: 'Shift' },
              { key: 'leaves', label: 'Cuti' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`pb-3 text-sm font-semibold transition-colors border-b-2 -mb-[1px] ${
                  tab === t.key ? 'border-red-600 text-red-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB: Overview */}
          {tab === 'overview' && (
            <div>
              {history.length === 0 ? (
                <p className="py-12 text-center text-gray-300">Belum ada data presensi untuk bulan ini</p>
              ) : (
                <div className="space-y-px">
                  {history.slice(0, 20).map((a, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 px-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        a.type === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' :
                        a.type === 'LATE' ? 'bg-amber-50 text-amber-600' :
                        a.type === 'ABSENT' ? 'bg-red-50 text-red-600' :
                        'bg-gray-50 text-gray-500'
                      }`}>
                        {a.type === 'PRESENT' ? <CheckCircle size={16} /> :
                         a.type === 'LATE' ? <AlertCircle size={16} /> :
                         <Clock size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{a.employee?.fullName}</p>
                        <p className="text-xs text-gray-400">{a.employee?.nip} - {a.employee?.unit}</p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="text-gray-500">{new Date(a.date).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short' })}</p>
                        <p className="font-mono text-gray-700">
                          {a.checkIn ? new Date(a.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                          {' - '}
                          {a.checkOut ? new Date(a.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        a.type === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' :
                        a.type === 'LATE' ? 'bg-amber-50 text-amber-700' :
                        a.type === 'ABSENT' ? 'bg-red-50 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>{a.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: History */}
          {tab === 'history' && (
            <div>
              {history.length === 0 ? (
                <p className="py-12 text-center text-gray-300">Belum ada riwayat presensi</p>
              ) : (
                <div className="space-y-px">
                  {history.map((a, i) => (
                    <div key={i} className="flex items-center gap-4 py-2.5 px-3 hover:bg-gray-50 rounded-lg text-sm">
                      <span className="text-gray-400 w-20">{new Date(a.date).toLocaleDateString('id-ID')}</span>
                      <span className="font-medium text-gray-800 flex-1">{a.employee?.fullName}</span>
                      <span className="text-gray-500">{a.employee?.unit}</span>
                      <span className="font-mono text-gray-600 w-24 text-right">{a.checkIn ? new Date(a.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                      <span className="font-mono text-gray-600 w-24 text-right">{a.checkOut ? new Date(a.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.type === 'PRESENT' ? 'bg-emerald-50 text-emerald-700' : a.type === 'LATE' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{a.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: Shifts */}
          {tab === 'shifts' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(shifts.length > 0 ? shifts : [
                  { name: 'Pagi', startTime: '07:00', endTime: '15:00' },
                  { name: 'Siang', startTime: '15:00', endTime: '23:00' },
                  { name: 'Malam', startTime: '23:00', endTime: '07:00' },
                ]).map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-6 text-center">
                    <Clock size={28} className={`mx-auto mb-3 ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-blue-500' : 'text-indigo-500'}`} />
                    <h3 className="text-xl font-bold text-gray-800">{s.name}</h3>
                    <div className="mt-2 inline-flex items-center gap-2 bg-white rounded-xl px-4 py-2 text-sm font-mono">
                      <LogIn size={14} className="text-emerald-500" />
                      <span className="font-semibold">{s.startTime}</span>
                      <span className="text-gray-300">-</span>
                      <LogOut size={14} className="text-red-500" />
                      <span className="font-semibold">{s.endTime}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      {i === 0 ? '07:00 - 15:00 WIB (8 jam)' : i === 1 ? '15:00 - 23:00 WIB (8 jam)' : '23:00 - 07:00 WIB (8 jam)'}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-6">PMI DKI Jakarta beroperasi 24 jam dengan 3 shift untuk layanan darurat</p>
            </div>
          )}

          {/* TAB: Leaves */}
          {tab === 'leaves' && (
            <div>
              {leaves.length === 0 ? (
                <p className="py-12 text-center text-gray-300">Belum ada pengajuan cuti</p>
              ) : (
                <div className="space-y-px">
                  {leaves.map((l, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 px-3 hover:bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                        l.status === 'REJECTED' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        <FileText size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{l.employee?.fullName}</p>
                        <p className="text-xs text-gray-400">
                          {l.leaveType} - {new Date(l.startDate).toLocaleDateString('id-ID')} s/d {new Date(l.endDate).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                        l.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>{l.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
