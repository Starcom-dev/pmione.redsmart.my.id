import { useState, useEffect } from 'react';
import { Droplets, Calendar, MapPin, TrendingUp, Heart } from 'lucide-react';
import api from '../../api/client';

export default function PublicPortal() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/blood-donations?limit=5');
        setEvents(data.data || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-700 to-red-900">
      <header className="text-white py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart size={32} className="text-red-300" />
            <h1 className="text-5xl font-bold">PMI DKI Jakarta</h1>
          </div>
          <p className="text-xl text-red-100 mt-4">Transparansi & Layanan Publik</p>
          <p className="text-red-200 mt-2">Palang Merah Indonesia Provinsi DKI Jakarta</p>
          <div className="flex justify-center gap-4 mt-8">
            <a href="#donor" className="bg-white text-red-700 hover:bg-red-50 px-6 py-3 rounded-xl font-semibold transition">Jadwal Donor Darah</a>
            <a href="#layanan" className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition border border-white/20">Layanan Kami</a>
          </div>
        </div>
      </header>

      <section id="donor" className="bg-[#f0f2f5] py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <Droplets size={32} className="text-red-600 mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-gray-800">Jadwal Donor Darah</h2>
            <p className="text-gray-500 mt-2">Setetes darah Anda, nyawa bagi sesama</p>
          </div>
          {loading ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : events.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400">Belum ada jadwal donor darah. Silakan cek kembali nanti.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((e) => (
                <div key={e.id} className="bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition">
                  <div className="flex items-center gap-2 mb-3">
                    <Droplets size={18} className="text-red-500" />
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">{e.status}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{e.title}</h3>
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                    <MapPin size={14} /> {e.location}
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                    <Calendar size={14} /> {new Date(e.startTime).toLocaleDateString('id-ID')}
                  </div>
                  <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                    <span className="text-gray-500">Target: <b>{e.targetDonors}</b> donor</span>
                    <span className="text-red-600 font-medium">{e.registeredDonors} terdaftar</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="layanan" className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-10">Layanan PMI DKI Jakarta</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Droplets, title: 'Donor Darah', desc: 'Informasi & pendaftaran donor darah' },
              { icon: TrendingUp, title: 'Ambulans', desc: 'Layanan ambulans darurat 24 jam' },
              { icon: Heart, title: 'Relawan', desc: 'Daftar menjadi relawan kemanusiaan' },
            ].map((l, i) => (
              <div key={i} className="bg-red-50 rounded-2xl p-6 hover:bg-red-100 transition">
                <l.icon size={32} className="text-red-600 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-800">{l.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{l.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-red-900 text-white py-8 px-6 text-center">
        <p className="text-sm text-red-200">PMI DKI Jakarta — Palang Merah Indonesia</p>
        <p className="text-xs text-red-300 mt-1">Jl. Kramat Raya No. 47, Senen, Jakarta Pusat | (021) 3906666</p>
      </footer>
    </div>
  );
}
