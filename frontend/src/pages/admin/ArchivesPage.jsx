import { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import { Search, Sparkles, Grid3X3, List, Clock, Tag, AlertCircle, X, FileText, Calendar, TrendingUp, Filter, ChevronRight, Download, Eye } from 'lucide-react';

const CATEGORIES = [
  { key: 'all', label: 'Semua', icon: FileText, color: 'text-gray-600 bg-gray-50' },
  { key: 'ADMINISTRATION', label: 'Administrasi', icon: FileText, color: 'text-blue-600 bg-blue-50' },
  { key: 'FINANCE', label: 'Keuangan', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
  { key: 'LEGAL', label: 'Legal', icon: FileText, color: 'text-purple-600 bg-purple-50' },
  { key: 'OPERATIONS', label: 'Operasional', icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
  { key: 'LOGISTICS', label: 'Logistik', icon: Filter, color: 'text-indigo-600 bg-indigo-50' },
  { key: 'HR', label: 'SDM', icon: Filter, color: 'text-pink-600 bg-pink-50' },
  { key: 'TRAINING', label: 'Diklat', icon: FileText, color: 'text-teal-600 bg-teal-50' },
];

export default function ArchivesPage() {
  const [archives, setArchives] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const [aiKeywords, setAiKeywords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [stats, setStats] = useState(null);
  const [tagCloud, setTagCloud] = useState([]);
  const [detail, setDetail] = useState(null);
  const [page, setPage] = useState(1);

  const fetchArchives = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = aiMode && search ? '/archives/ai-search' : '/archives';
      const params = { page, limit: 12, category: category !== 'all***' ? category : undefined };
      if (aiMode && search) params.q = search;
      else if (search) params.search = search;
      const { data: res } = await api.get(endpoint, { params });
      setArchives(res.data || []);
      setTotal(res.total || 0);
      if (res.keywords) setAiKeywords(res.keywords);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [page, category, search, aiMode]);

  useEffect(() => { fetchArchives(); }, [fetchArchives]);

  useEffect(() => {
    (async () => {
      try {
        const { data: s } = await api.get('/archives/stats');
        setStats(s.data);
        const { data: t } = await api.get('/archives/tags');
        setTagCloud(t.data || []);
      } catch {}
    })();
  }, []);

  const handleSearch = async (value) => {
    setSearch(value);
    setPage(1);
    if (value.length > 2) {
      try {
        const { data } = await api.get(`/archives/ai-suggest?q=${encodeURIComponent(value)}`);
        setSuggestions(data.data || []);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    } else { setSuggestions([]); setShowSuggestions(false); }
  };

  const openDetail = async (item) => {
    try {
      const { data } = await api.get(`/archives/${item.id}`);
      setDetail(data.data);
    } catch { setDetail(item); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '-';
    if (bytes < 1000000) return `${(bytes / 1000).toFixed(0)} KB`;
    return `${(bytes / 1000000).toFixed(1)} MB`;
  };

  const getRetentionStatus = (date) => {
    if (!date) return null;
    const now = new Date();
    const ret = new Date(date);
    const days = Math.ceil((ret - now) / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: 'Expired', color: 'bg-red-100 text-red-700' };
    if (days < 30) return { label: `${days} hari lagi`, color: 'bg-orange-100 text-orange-700' };
    if (days < 90) return { label: `${days} hari`, color: 'bg-yellow-100 text-yellow-700' };
    return null;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Arsip Digital</h1>
        <p className="text-gray-500 text-sm mt-1">Repository dokumen PMI DKI Jakarta dengan AI-powered search</p>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total Dokumen</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-gray-800">{stats.byCategory?.length || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Kategori</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-orange-600">{stats.expiring || 0}</p>
            <p className="text-xs text-gray-500 mt-1">Mendekati Retensi</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-gray-800">{tagCloud.length}</p>
            <p className="text-xs text-gray-500 mt-1">Tags Unik</p>
          </div>
        </div>
      )}

      {/* AI Search Bar */}
      <div className="bg-white rounded-2xl p-4 mb-6 relative">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={aiMode ? "Tanya dengan bahasa alami... cth: 'dokumen tentang banjir jakarta'" : "Cari arsip..."}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-red-400 outline-none"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => { setSearch(s); setShowSuggestions(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                    <Search size={13} className="text-gray-400" /> {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => { setAiMode(!aiMode); if (!aiMode) setPage(1); setShowSuggestions(false); }}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              aiMode
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Sparkles size={16} /> AI Search
          </button>
        </div>
        {aiMode && aiKeywords.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            <span>Kata kunci AI:</span>
            {aiKeywords.map((k, i) => (
              <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">{k}</span>
            ))}
          </div>
        )}
      </div>

      {/* Category + View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button key={cat.key} onClick={() => { setCategory(cat.key); setPage(1); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                category === cat.key
                  ? 'bg-red-600 text-white shadow-lg shadow-red-200'
                  : `${cat.color} hover:opacity-80`
              }`}
            >{cat.label}</button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setView('grid')}
            className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setView('list')}
            className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white shadow text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Archives Grid/List */}
      {loading ? (
        <div className="text-center py-16">
          <Sparkles size={28} className="animate-spin mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Memuat arsip...</p>
        </div>
      ) : archives.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400">Tidak ada arsip ditemukan</p>
          <p className="text-gray-300 text-sm mt-1">Coba kata kunci atau kategori lain</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {archives.map((a, i) => {
            const retention = getRetentionStatus(a.retentionUntil);
            return (
              <div key={i} onClick={() => openDetail(a)}
                className="bg-white rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group border border-transparent hover:border-gray-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${CATEGORIES.find(c => c.key === a.category)?.color || 'bg-gray-50 text-gray-600'}`}>
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-red-600 transition-colors">{a.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">{a.category}    '                 ...     '                 {formatSize(a.fileSize)}</p>
                  </div>
                </div>
                {a.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">{a.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {a.tags?.slice(0, 3).map((t, j) => (
                      <span key={j} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                  {retention && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${retention.color}`}>{retention.label}</span>}
                </div>
                {a.relevance !== undefined && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-purple-600">
                    <Sparkles size={10} /> Relevansi: {a.relevance}%
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden">
          {archives.map((a, i) => {
            const retention = getRetentionStatus(a.retentionUntil);
            return (
              <div key={i} onClick={() => openDetail(a)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors border-b border-gray-50 last:border-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${CATEGORIES.find(c => c.key === a.category)?.color || 'bg-gray-50 text-gray-600'}`}>
                  <FileText size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">{a.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{a.category}    '                 ...     '                 {formatSize(a.fileSize)}    '                 ...     '                 {new Date(a.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
                <div className="flex items-center gap-2">
                  {a.tags?.slice(0, 2).map((t, j) => <span key={j} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>)}
                  {retention && <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${retention.color}`}>{retention.label}</span>}
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {total > 12 && (
        <div className="flex justify-center mt-6 gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-4 py-2 bg-white rounded-xl text-sm font-medium disabled:opacity-30 hover:bg-gray-50">   '                 '                               '                 Sebelumnya</button>
          <span className="px-4 py-2 text-sm text-gray-500">{page} / {Math.ceil(total / 12)}</span>
          <button onClick={() => setPage(p => Math.min(Math.ceil(total / 12), p + 1))}
            className="px-4 py-2 bg-white rounded-xl text-sm font-medium hover:bg-gray-50">Selanjutnya    '                 '                               '                                  </button>
        </div>
      )}

      {/* Tag Cloud */}
      {tagCloud.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4"><Tag size={16} className="text-gray-400" /><h3 className="font-semibold text-gray-800">Tag Cloud</h3></div>
          <div className="flex flex-wrap gap-2">
            {tagCloud.map((t, i) => (
              <button key={i} onClick={() => { setSearch(t.tag); setAiMode(true); setCategory('all***'); }}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                {t.tag} <span className="text-gray-300 ml-1">{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDetail(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-2"><FileText size={20} className="text-red-600" /><h3 className="font-semibold">Detail Arsip</h3></div>
              <button onClick={() => setDetail(null)} className="p-1.5 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <h4 className="text-lg font-bold text-gray-800">{detail.title}</h4>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${CATEGORIES.find(c => c.key === detail.category)?.color || 'bg-gray-50 text-gray-600'}`}>{detail.category}</span>
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={11} /> {new Date(detail.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                  {detail.fileSize && <span className="text-xs text-gray-400">{formatSize(detail.fileSize)}</span>}
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{detail.description || 'Tidak ada deskripsi.'}</p>
              {detail.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {detail.tags.map((t, i) => <span key={i} className="text-xs bg-red-50 text-red-600 px-2.5 py-1 rounded-full">{t}</span>)}
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-400">Ukuran File</p><p className="font-medium">{formatSize(detail.fileSize)}</p></div>
                <div><p className="text-xs text-gray-400">Tipe</p><p className="font-medium">{detail.mimeType || '-'}</p></div>
                <div><p className="text-xs text-gray-400">Retensi Hingga</p><p className="font-medium">{detail.retentionUntil ? new Date(detail.retentionUntil).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}</p></div>
                <div><p className="text-xs text-gray-400">Status Retensi</p><p className="font-medium">{getRetentionStatus(detail.retentionUntil) ? <span className={`text-xs px-2 py-0.5 rounded-full ${getRetentionStatus(detail.retentionUntil).color}`}>{getRetentionStatus(detail.retentionUntil).label}</span> : 'Aman'}</p></div>
              </div>
              {detail.related?.length > 0 && (
                <div>
                  <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Sparkles size={14} className="text-purple-500" /> Dokumen Terkait (AI)</h5>
                  <div className="space-y-2">
                    {detail.related.map((r, i) => (
                      <button key={i} onClick={() => openDetail(r)}
                        className="w-full text-left bg-gray-50 hover:bg-purple-50 rounded-xl p-3 transition-colors">
                        <p className="text-sm font-medium text-gray-700">{r.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{r.category}    '                 ...     '                 {new Date(r.createdAt).toLocaleDateString('id-ID')}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-500 text-white py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-red-200"><Download size={16} /> Unduh</button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200"><Eye size={16} /> Pratinjau</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
