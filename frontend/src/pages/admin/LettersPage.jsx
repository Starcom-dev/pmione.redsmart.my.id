import { useState } from 'react';
import DataTable from '../../components/ui/DataTable';
import StatusBadge from '../../components/ui/StatusBadge';
import SignaturePad from '../../components/ui/SignaturePad';
import { X, FileText, Clock, Tag } from 'lucide-react';
import api from '../../api/client';

const columns = [
  { label: 'No. Surat', key: 'letterNumber' },
  { label: 'Perihal', key: 'subject' },
  { label: 'Jenis', key: 'type' },
  { label: 'Status', key: 'status', statusKey: 'status' },
  { label: 'Pengirim', key: 'senderInstitution' },
  { label: 'Tanggal', key: 'createdAt', render: (i) => new Date(i.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) },
];

const tabs = [
  { key: 'all', label: 'Semua' },
  { key: 'INCOMING', label: 'Masuk' },
  { key: 'OUTGOING', label: 'Keluar' },
  { key: 'INTERNAL', label: 'Internal' },
];

const formFields = [
  { key: 'letterNumber', label: 'No. Surat', required: true },
  { key: 'subject', label: 'Perihal', required: true },
  { key: 'type', label: 'Jenis', type: 'select', required: true, options: ['INCOMING', 'OUTGOING', 'INTERNAL'] },
  { key: 'status', label: 'Status', type: 'select', options: ['DRAFT', 'PENDING', 'APPROVED', 'SIGNED'] },
  { key: 'priority', label: 'Prioritas', type: 'select', options: ['low', 'normal', 'high', 'critical'] },
  { key: 'senderInstitution', label: 'Institusi Pengirim' },
  { key: 'body', label: 'Isi Surat', type: 'textarea' },
];

export default function LettersPage() {
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showSign, setShowSign] = useState(false);
  const [signature, setSignature] = useState('');
  const [signing, setSigning] = useState(false);

  const openDetail = async (item) => {
    setDetail(item);
    setShowSign(false);
    setSignature('');
    if (!item?.id) return;
    setLoadingDetail(true);
    try {
      const { data } = await api.get(`/letters?limit=100`);
      const found = data.data?.find(l => l.id === item.id);
      if (found) setDetail(found);
    } catch {}
    setLoadingDetail(false);
  };

  const handleSign = async () => {
    setSigning(true);
    try {
      await api.post(`/tte/sign/${detail.id}`, { signature });
      setShowSign(false);
      setSignature('');
      if (detail.id) openDetail(detail);
    } catch (e) { console.error(e); }
    setSigning(false);
  };

  return (
    <>
      <DataTable endpoint="/letters" title="Manajemen Surat" columns={columns} formFields={formFields} tabs={tabs} showDetail onRowClick={openDetail} />

      {detail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2"><FileText size={20} className="text-red-600" /><h3 className="font-semibold text-lg">Detail Surat</h3></div>
              <button onClick={() => setDetail(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            {loadingDetail ? <p className="p-6 text-gray-400">Loading...</p> : (
              <div className="p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">{detail.subject}</h4>
                    <p className="text-sm text-gray-500 mt-1">{detail.letterNumber}</p>
                  </div>
                  <StatusBadge status={detail.status} />
                </div>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4">
                  <div><p className="text-xs text-gray-400">Jenis</p><p className="text-sm font-medium">{detail.type}</p></div>
                  <div><p className="text-xs text-gray-400">Prioritas</p><p className="text-sm font-medium capitalize">{detail.priority}</p></div>
                  <div><p className="text-xs text-gray-400">Pengirim</p><p className="text-sm font-medium">{detail.senderInstitution || '-'}</p></div>
                  <div><p className="text-xs text-gray-400">Tanggal</p><p className="text-sm font-medium flex items-center gap-1"><Clock size={12} />{new Date(detail.createdAt).toLocaleDateString('id-ID')}</p></div>
                </div>
                {detail.body && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Isi Surat</h5>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{detail.body}</div>
                  </div>
                )}
                {detail.tags?.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Tag size={14} className="text-gray-400" />
                    {detail.tags.map((t, i) => <span key={i} className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full">{t}</span>)}
                  </div>
                )}

                {/* TTE SECTION */}
                {detail.status === 'APPROVED' && !detail.signedAt ? (
                  <div className="pt-2 border-t">
                    {!showSign ? (
                      <button onClick={() => setShowSign(true)} className="bg-gradient-to-r from-red-600 to-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-red-200">
                             ...                    Tanda Tangani Elektronik
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-700">Bubuhkan Tanda Tangan:</p>
                        <SignaturePad value={signature} onChange={setSignature} />
                        <div className="flex gap-2">
                          <button onClick={handleSign} disabled={!signature || signing}
                            className="bg-gradient-to-r from-red-600 to-red-500 text-white px-5 py-2 rounded-xl text-sm font-semibold disabled:opacity-50 shadow-lg shadow-red-200">
                            {signing ? 'Menandatangani...' : '     ...           Konfirmasi TTE'}
                          </button>
                          <button onClick={() => { setShowSign(false); setSignature(''); }}
                            className="bg-gray-100 hover:bg-gray-200 px-5 py-2 rounded-xl text-sm font-medium text-gray-700">Batal</button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : detail.signedAt ? (
                  <div className="pt-2 border-t">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 text-lg">     ...          </span>
                        <div>
                          <p className="text-sm font-semibold text-emerald-700">Surat Telah Ditandatangani</p>
                          <p className="text-xs text-emerald-600 mt-0.5">
                            <Clock size={10} className="inline mr-1" />
                            {new Date(detail.signedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                          </p>
                        </div>
                      </div>
                      {detail.qrCodeUrl && (
                        <div className="mt-2 flex items-center gap-3">
                          <div className="bg-white p-1 rounded border w-16 h-16 flex items-center justify-center text-[8px] text-gray-400">QR TTE</div>
                          <p className="text-xs text-gray-500">QR Code verifikasi keabsahan tanda tangan tersedia</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
