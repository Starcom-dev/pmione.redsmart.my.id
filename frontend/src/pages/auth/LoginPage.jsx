import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@pmijakarta.id');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      await login(email, password);
      nav('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-700 to-red-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">PMI One</h1>
          <p className="text-white/70 mt-1">Platform Cerdas Berbasis AI</p>
          <p className="text-white/50 text-sm mt-2">PMI DKI Jakarta</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-5">
          <h2 className="text-xl font-bold text-gray-800">Masuk</h2>
          {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            <LogIn size={18} /> {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
