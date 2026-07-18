import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Eye, RefreshCw } from 'lucide-react';
import api from '../../api/client';
import StatusBadge from './StatusBadge';

export default function DataTable({ endpoint, title, columns, formFields, onRowClick, showDetail, stats, tabs }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const limit = 12;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (search) params.search = search;
      const { data: res } = await api.get(endpoint, { params });
      setData(res.data || []);
      setTotal(res.total || 0);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const openCreate = () => { setEditing(null); setForm({}); setShowForm(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await api.put(`${endpoint}/${editing.id}`, form);
      else await api.post(endpoint, form);
      setShowForm(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin hapus?')) return;
    try { await api.delete(`${endpoint}/${id}`); fetchData(); } catch (e) { console.error(e); }
  };

  const pages = Math.ceil(total / limit);

  return (
    <div className="-mx-6 -mt-6">
      {/* Page Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[28px] font-extrabold text-gray-900 tracking-tight">{title}</h2>
            {stats && <p className="text-sm text-gray-400 mt-1">{stats.map(s => `${s.label}: ${s.value}`).join('  ·  ')}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
              <input type="text" placeholder="Cari..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-10 pr-4 py-2.5 rounded-full text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-red-400 outline-none w-56 transition-all"
              />
            </div>
            <button onClick={fetchData} className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {tabs && (
          <div className="flex gap-1 mt-5">
            {tabs.map(t => (
              <button key={t.key} onClick={() => setPage(1)}
                className="px-4 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="px-6 py-24 text-center">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-300 text-sm">Memuat data...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="px-6 py-24 text-center">
          <p className="text-gray-300">Belum ada data</p>
        </div>
      ) : (
        <div className="px-6">
          <div className="space-y-px">
            {data.map((item, i) => (
              <div key={item.id || i}
                onClick={() => onRowClick?.(item)}
                className="group flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors rounded-lg"
              >
                {columns.map((col, j) => (
                  <div key={j} className={j === 0 ? 'flex-1' : 'w-32 shrink-0'}>
                    {col.render ? col.render(item) :
                     col.statusKey ? <StatusBadge status={item[col.statusKey] || item[col.key]} /> :
                     <span className={j === 0 ? 'text-sm font-medium text-gray-900' : 'text-sm text-gray-500'}>{item[col.key]}</span>}
                  </div>
                ))}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                  {showDetail && (
                    <button onClick={(e) => { e.stopPropagation(); onRowClick?.(item); }}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
                      <Eye size={14} />
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); openEdit(item); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Pencil size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="px-6 py-4 flex items-center justify-between text-sm text-gray-400">
          <span>{total} total</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="disabled:opacity-20 hover:text-gray-700"><ChevronLeft size={16} /></button>
            <span className="text-gray-700 font-medium">{page} <span className="text-gray-300">/ {pages}</span></span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="disabled:opacity-20 hover:text-gray-700"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* FAB — Floating Add Button */}
      <button onClick={openCreate}
        className="fixed bottom-8 right-8 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg shadow-red-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-30">
        <Plus size={24} />
      </button>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Tambah'} {title}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {formFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{field.label}</label>
                  {field.type === 'select' ? (
                    <select value={form[field.key] || ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:ring-2 focus:ring-red-400 outline-none border-0">
                      <option value="">Pilih...</option>
                      {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea value={form[field.key] || ''} onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      rows={3} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:ring-2 focus:ring-red-400 outline-none border-0" />
                  ) : (
                    <input type={field.type || 'text'} value={form[field.key] || ''}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })} required={field.required}
                      className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:ring-2 focus:ring-red-400 outline-none border-0"
                      placeholder={field.placeholder} />
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-bold text-sm transition-colors">Simpan</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-3 rounded-2xl font-bold text-sm transition-colors">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
