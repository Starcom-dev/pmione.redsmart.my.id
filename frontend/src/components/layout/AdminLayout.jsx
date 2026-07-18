import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AdminLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin h-8 w-8 border-2 border-red-600 border-t-transparent rounded-full" /></div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6"><Outlet /></main>
      </div>
    </div>
  );
}
