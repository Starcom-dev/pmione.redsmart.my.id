import { useAuth } from '../../auth/AuthContext';
import { LogOut, Bell, User, Menu } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="h-14 bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-1 hover:bg-gray-100 rounded-lg text-gray-500">
          <Menu size={20} />
        </button>
        <span className="text-sm text-gray-500 hidden sm:block">PMI DKI Jakarta</span>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-full relative">
          <Bell size={17} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-medium">
              {user?.fullName?.[0] || 'A'}
            </div>
            <span className="hidden md:block text-sm text-gray-400">{user?.roles?.[0]}</span>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-12 w-44 bg-white rounded-xl shadow-lg border py-1 z-50">
              <button onClick={() => { nav('/admin'); setShowMenu(false); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                <User size={14} /> Profil
              </button>
              <button onClick={() => { logout(); nav('/login'); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
