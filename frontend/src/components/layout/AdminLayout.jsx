import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar — hidden on mobile unless open */}
      <div className={`fixed lg:sticky top-0 z-50 h-screen transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 py-4 px-6 md:py-6 md:px-10"><Outlet /></main>
      </div>
    </div>
  );
}
