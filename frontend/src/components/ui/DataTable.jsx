import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../../api/client';

export default function DataTable({ endpoint, title, columns, formFields, onRowClick }) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const limit = 10;

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Tambah
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Cari..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-3 py-2 border rounded-lg w-full text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>{columns.map((col, i) => <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{col.label}</th>)}<th className="px-4 py-3"></th></tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={columns.length + 1} className="px-4 py-8 text-center text-gray-400">Belum ada data</td></tr>
              ) : data.map((item, i) => (
                <tr key={item.id || i} className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col, j) => (
                    <td key={j} className="px-4 py-3 text-sm text-gray-600">{col.render ? col.render(item) : item[col.key]}</td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-blue-50 rounded text-blue-500"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-red-50 rounded text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <span className="text-sm text-gray-500">Total {total} data</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={16} /></button>
              {Array.from({length: pages}, (_, i) => (
                <button key={i+1} onClick={() => setPage(i+1)} className={`w-8 h-8 rounded text-sm ${page === i+1 ? 'bg-red-600 text-white' : 'hover:bg-gray-100'}`}>{i+1}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b font-semibold">{editing ? 'Edit' : 'Tambah'} {title}</div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                  <input type={field.type || 'text'} value={form[field.key] || ''}
                    onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                    required={field.required}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium">Simpan</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded-lg text-sm">Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
