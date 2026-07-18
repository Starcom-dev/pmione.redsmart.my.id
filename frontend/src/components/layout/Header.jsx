import { useAuth } from '../../auth/AuthContext';
import { LogOut, Bell, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="h-14 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">PMI DKI Jakarta</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-full relative">
          <Bell size={18} className="text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg"
          >
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.fullName?.[0] || 'A'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
              <p className="text-xs text-gray-400">{user?.roles?.[0]}</p>
            </div>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border py-1">
              <button onClick={() => { nav('/admin/profile'); setShowMenu(false); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                <User size={14} /> Profil
              </button>
              <button onClick={() => { logout(); nav('/login'); }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
