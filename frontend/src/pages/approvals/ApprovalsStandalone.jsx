import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { CheckCircle, XCircle, RotateCcw, User, FileText, Send, ChevronRight, ArrowRight, Inbox, Plus, TrendingUp, LogOut, Shield } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import SignaturePad from '../../components/ui/SignaturePad';

const CHAINS = [
  { key: 'SURAT_KELUAR', label: 'Surat Keluar', desc: 'Kabid - Sekretaris - Ketua', steps: 3 },
  { key: 'SURAT_INTERNAL', label: 'Internal', desc: 'Kasi - Kabid', steps: 2 },
  { key: 'PENGADAAN', label: 'Pengadaan', desc: 'Kabid - Kabid Keu - Wakil - Ketua', steps: 4 },
  { key: 'ANGGARAN', label: 'Anggaran', desc: 'Kabid - Kabid Keu - Ketua', steps: 3 },
  { key: 'LAPORAN', label: 'Laporan', desc: 'Kasi - Kabid - Sekretaris', steps: 3 },
];

export default function ApprovalsStandalone() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('inbox');
  const [reqs, setReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', type: 'SURAT_KELUAR', description: '' });
  const [detail, setDetail] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [signature, setSignature] = useState('');

  const fetch = async () => {
    setLoading(true);
    try { const ep = tab === 'inbox' ? '/approvals/inbox' : '/approvals'; const { data } = await api.get(ep + '?limit=30'); setReqs(data.data || []); } catch {}
    setLoading(false);
  };
  useEffect(() => { fetch(); }, [tab]);

  const open = async (id) => {
    try { const { data } = await api.get(`/approvals/${id}`); setDetail(data.data); setReviewAction(null); setReviewNotes(''); setSignature(''); } catch {}
  };
  const create = async (e) => { e.preventDefault(); try { await api.post('/approvals', form); setShowCreate(false); setForm({ title: '', type: 'SURAT_KELUAR', description: '' }); fetch(); } catch {} };
  const review = async (action) => {
    try { await api.post(`/approvals/${detail.id}/review`, { action, notes: reviewNotes, signature: action === 'approve' ? signature : undefined }); setReviewAction(null); fetch(); open(detail.id); } catch {}
  };
  const ib = reqs.filter(r => r.status === 'IN_PROGRESS').length;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <header className="bg-white px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="text-sm text-gray-400 hover:text-gray-600">Admin</Link>
          <span className="text-gray-300">/</span>
          <h1 className="font-bold text-gray-800">Approval Berjenjang</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 hidden sm:inline">{user?.fullName}</span>
          <button onClick={() => { logout(); nav('/login'); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><Shield size={16} className="text-gray-400" /></button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { l: 'Inbox', v: ib, i: Inbox, c: 'text-red-600' },
            { l: 'Total', v: reqs.length, i: FileText, c: 'text-blue-600' },
            { l: 'Menunggu', v: reqs.filter(r => r.status === 'IN_PROGRESS').length, i: ChevronRight, c: 'text-amber-600' },
            { l: 'Selesai', v: reqs.filter(r => r.status !== 'IN_PROGRESS').length, i: CheckCircle, c: 'text-emerald-600' },
          ].map((s, i) => (
            <div key={i} className="text-center"><s.i size={22} className={`${s.c} mx-auto mb-1`} /><p className="text-2xl font-extrabold">{s.v}</p><p className="text-[10px] text-gray-400">{s.l}</p></div>
          ))}
        </div>

        {/* Tabs + Actions */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-2">
            <button onClick={() => setTab('inbox')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === 'inbox' ? 'bg-red-600 text-white' : 'bg-white text-gray-600'}`}>Inbox {ib > 0 && `(${ib})`}</button>
            <button onClick={() => setTab('all')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${tab === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}>Semua</button>
          </div>
          <button onClick={() => setShowCreate(true)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold">+ Ajukan</button>
        </div>

        {/* Chain info */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {CHAINS.map((c, i) => (
            <div key={i} className="bg-white rounded-2xl p-4">
              <p className="font-semibold text-sm">{c.label}</p>
              <p className="text-xs text-gray-400 mt-1">{c.desc}</p>
              <div className="flex items-center gap-1 mt-2">
                {Array.from({ length: c.steps }, (_, j) => (
                  <span key={j} className="flex items-center gap-1">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${j === 0 ? 'bg-blue-100 text-blue-600' : j === c.steps - 1 ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}>{j + 1}</span>
                    {j < c.steps - 1 && <ArrowRight size={10} className="text-gray-300" />}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Request list */}
        {loading ? <div className="text-center py-12"><div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" /></div> :
         reqs.length === 0 ? <div className="py-16 text-center"><Inbox size={40} className="mx-auto mb-2 text-gray-200" /><p className="text-gray-400">Belum ada request</p></div> : (
          <div>
            {reqs.map((r, i) => (
              <div key={i} onClick={() => open(r.id)} className="flex items-center gap-4 py-3 px-3 hover:bg-gray-50 cursor-pointer rounded-lg">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' : r.status === 'REJECTED' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}><FileText size={16} /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-800 truncate">{r.title}</p><p className="text-xs text-gray-400">{r.createdBy?.fullName} - {r.type} - Step {r.currentStep}/{r.totalSteps}</p></div>
                <StatusBadge status={r.status === 'IN_PROGRESS' ? 'WAITING' : r.status} />
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
            <div className="bg-white rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-4 border-b font-semibold">Ajukan Approval</div>
              <form onSubmit={create} className="p-6 space-y-4">
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Judul" className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none" />
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none">
                  {CHAINS.map(c => <option key={c.key} value={c.key}>{c.label} - {c.desc}</option>)}
                </select>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none" placeholder="Deskripsi" />
                <div className="flex gap-3"><button type="submit" className="flex-1 bg-red-600 text-white py-2.5 rounded-xl font-semibold text-sm">Ajukan</button><button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-gray-100 py-2.5 rounded-xl text-sm">Batal</button></div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal + Review */}
        {detail && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetail(null)}>
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div><h3 className="font-bold text-lg">{detail.title}</h3><p className="text-xs text-gray-400">{detail.type} - {detail.createdBy?.fullName}</p></div>
                <button onClick={() => setDetail(null)}><XCircle size={18} className="text-gray-400" /></button>
              </div>
              <div className="p-6 space-y-5">
                {detail.description && <p className="text-sm text-gray-600">{detail.description}</p>}
                <div>
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2"><TrendingUp size={16} className="text-red-600" /> Jenjang Approval</h4>
                  {detail.steps?.map((step, idx) => {
                    const isActive = step.stepOrder === detail.currentStep;
                    return (
                      <div key={idx} className="relative pl-9 pb-3">
                        {idx < detail.steps.length - 1 && <div className={`absolute left-[13px] top-7 w-0.5 h-[calc(100%-4px)] ${step.status === 'APPROVED' ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
                        <div className={`absolute left-[2px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center ${isActive ? 'bg-blue-500' : step.status === 'APPROVED' ? 'bg-emerald-500' : step.status === 'REJECTED' ? 'bg-red-500' : step.status === 'REVISED' ? 'bg-amber-500' : 'bg-gray-300'}`}>
                          {step.status === 'APPROVED' ? <CheckCircle size={13} className="text-white" /> : step.status === 'REJECTED' ? <XCircle size={13} className="text-white" /> : step.status === 'REVISED' ? <RotateCcw size={13} className="text-white" /> : <span className="text-white text-[10px] font-bold">{idx + 1}</span>}
                        </div>
                        <div className={`p-3 rounded-xl ${isActive ? 'bg-blue-50' : step.status === 'APPROVED' ? 'bg-emerald-50/50' : 'bg-gray-50'}`}>
                          <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">{step.level}</p><p className="text-xs text-gray-500">{step.roleName} - {step.user?.fullName}</p></div><StatusBadge status={step.status} /></div>
                          {step.notes && <p className="mt-2 text-xs bg-white/50 rounded-lg p-2">{step.notes}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {detail.status === 'IN_PROGRESS' && detail.steps?.find(s => s.stepOrder === detail.currentStep)?.userId === user?.id && !reviewAction && (
                  <div className="bg-blue-50 rounded-2xl p-5">
                    <p className="font-semibold text-blue-800 mb-3">Menunggu Tindakan Anda</p>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setReviewAction('approve')} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold text-sm">Setujui</button>
                      <button onClick={() => setReviewAction('revise')} className="bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold text-sm">Revisi</button>
                      <button onClick={() => setReviewAction('reject')} className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold text-sm">Tolak</button>
                    </div>
                  </div>
                )}
                {reviewAction && (
                  <div className="border rounded-2xl p-5 space-y-4">
                    <h4 className="font-semibold">{reviewAction === 'approve' ? 'Setujui' : reviewAction === 'revise' ? 'Revisi' : 'Tolak'}</h4>
                    <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} rows={2} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm outline-none" placeholder="Catatan..." />
                    {reviewAction === 'approve' && <SignaturePad value={signature} onChange={setSignature} width={360} height={120} />}
                    <div className="flex gap-2">
                      <button onClick={() => review(reviewAction)} className={`px-5 py-2.5 rounded-xl font-semibold text-sm text-white ${reviewAction === 'approve' ? 'bg-emerald-600' : reviewAction === 'revise' ? 'bg-amber-600' : 'bg-red-600'}`}>Konfirmasi</button>
                      <button onClick={() => { setReviewAction(null); setReviewNotes(''); setSignature(''); }} className="px-5 py-2.5 rounded-xl text-sm bg-gray-100">Batal</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
