import { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import { Send, Sparkles, FileText, ArrowUpRight, Search, Loader2, MessageSquare, Lightbulb } from 'lucide-react';

export default function AiAssistantPage() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get('/ai/suggestions').then(r => setSuggestions(r.data.data || [])).catch(() => {});
    inputRef.current?.focus();
  }, []);

  const ask = async (q) => {
    if (!q.trim() || loading) return;
    const query = q || question;
    setQuestion('');
    setLoading(true);
    setResult(null);
    setHistory(prev => [{ q: query, type: 'user' }, ...prev]);
    try {
      const { data } = await api.post('/ai/ask', { question: query });
      setResult(data.data);
      setHistory(prev => [{ q: query, a: data.data, type: 'ai' }, ...prev]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-semibold mb-4">
          <Sparkles size={14} /> 100% Local AI — Zero Cloud Cost
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">AI Document Assistant</h2>
        <p className="text-gray-400 mt-3 text-lg">Tanyakan apa saja tentang dokumen, SOP, surat, dan operasional PMI DKI Jakarta</p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          ref={inputRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Contoh: Bagaimana SOP penanganan banjir di PMI DKI?"
          className="w-full px-5 py-4 pr-14 bg-white rounded-2xl text-base shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
          disabled={loading}
        />
        <button onClick={() => ask()} disabled={loading || !question.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-30 transition-colors">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>

      {/* Suggested Questions */}
      {!result && !loading && (
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Lightbulb size={12} /> Pertanyaan yang sering ditanyakan
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.slice(0, 8).map((s, i) => (
              <button key={i} onClick={() => { setQuestion(s); ask(s); }}
                className="text-left text-sm text-gray-600 hover:text-purple-700 hover:bg-purple-50 px-4 py-2.5 rounded-xl transition-colors truncate">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl p-8 text-center">
          <Search size={24} className="animate-pulse mx-auto mb-3 text-purple-400" />
          <p className="text-gray-500">Mencari di {24} arsip, 7 surat, knowledge base...</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-4 animate-in">
          {/* Answer Card */}
          <div className="bg-white rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                <Sparkles size={16} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Jawaban</h3>
                <p className="text-xs text-gray-400">{result.keywords?.length || 0} kata kunci · {result.totalFound} dokumen ditemukan</p>
              </div>
            </div>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{result.answer}</div>
          </div>

          {/* Sources */}
          {result.sources?.length > 0 && (
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText size={12} /> Sumber ({result.sources.length})
              </h3>
              <div className="space-y-2">
                {result.sources.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      s.type === 'Arsip' ? 'bg-blue-50 text-blue-600' :
                      s.type === 'Surat' ? 'bg-red-50 text-red-600' :
                      s.type === 'Knowledge Base' ? 'bg-purple-50 text-purple-600' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      <FileText size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{s.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{s.excerpt}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-400">{s.type}</span>
                      <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">{s.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="bg-white rounded-2xl p-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <MessageSquare size={12} /> Pertanyaan Terkait
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.suggestions.map((s, i) => (
                  <button key={i} onClick={() => { setQuestion(s); ask(s); }}
                    className="text-xs text-purple-600 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat History */}
      {history.length > 1 && !result && !loading && (
        <div className="mt-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Riwayat</h3>
          <div className="space-y-3">
            {history.filter(h => h.type === 'user').slice(0, 5).map((h, i) => (
              <button key={i} onClick={() => ask(h.q)}
                className="w-full text-left text-sm text-gray-600 hover:text-purple-700 hover:bg-purple-50 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                <MessageSquare size={13} className="text-gray-300" />
                {h.q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
