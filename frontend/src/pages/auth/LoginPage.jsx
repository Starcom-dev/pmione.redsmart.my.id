import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { LogIn, Heart } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@pmijakarta.id');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(email, password); nav('/admin'); }
    catch (err) { setError(err.response?.data?.message || 'Login gagal'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-800 via-red-700 to-red-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur rounded-2xl mb-4">
            <Heart size={32} className="text-red-200" />
          </div>
          <h1 className="text-4xl font-bold text-white">PMI One</h1>
          <p className="text-red-200/80 mt-1">Platform Cerdas Berbasis AI</p>
          <p className="text-red-300/50 text-sm mt-2">PMI DKI Jakarta</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 space-y-5">
          <h2 className="text-xl font-bold text-gray-800">Masuk</h2>
          {error && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">{error}</div>}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3.5 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-red-400 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-3.5 py-2.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-red-400 outline-none text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-200 transition-all">
            <LogIn size={18} /> {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
