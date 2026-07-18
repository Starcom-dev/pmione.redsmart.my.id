import { NavLink } from 'react-router-dom';
import { FileText, Users, Calendar, Archive, Briefcase, Heart, AlertTriangle, Warehouse, Truck, Ambulance, Wrench, GraduationCap, Droplets, FileSignature, LayoutDashboard, Command, ChevronLeft, ChevronRight, Shield, CheckCircle, Clock, Sparkles, QrCode, X } from 'lucide-react';
import { useState } from 'react';

const menu = [
  { label: 'AI', items: [
    { to: '/admin/ai', icon: Sparkles, label: 'AI Assistant' },
  ]},
  { label: 'APPROVAL', items: [
    { to: '/admin/approvals', icon: CheckCircle, label: 'Approval Berjenjang' },
  ]},
  { label: 'DASHBOARD', items: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard Utama', end: true },
  ]},
  { label: 'E-OFFICE', items: [
    { to: '/admin/reception', icon: QrCode, label: 'Reception Lobby' },
    { to: '/admin/letters', icon: FileText, label: 'Surat' },
    { to: '/admin/meetings', icon: Calendar, label: 'Rapat' },
    { to: '/admin/archives', icon: Archive, label: 'Arsip' },
  ]},
  { label: 'SDM & RELAWAN', items: [
    { to: '/admin/employees', icon: Users, label: 'Kepegawaian' },
    { to: '/admin/presensi', icon: Clock, label: 'Presensi' },
    { to: '/admin/volunteers', icon: Heart, label: 'Relawan' },
  ]},
  { label: 'KEUANGAN', items: [
    { to: '/admin/finance', icon: Briefcase, label: 'Keuangan' },
    { to: '/admin/donations', icon: Droplets, label: 'Donasi' },
  ]},
  { label: 'OPERASIONAL', items: [
    { to: '/admin/emergency', icon: AlertTriangle, label: 'Posko Darurat' },
    { to: '/admin/warehouse', icon: Warehouse, label: 'Gudang' },
    { to: '/admin/assets', icon: Truck, label: 'Aset & Armada' },
    { to: '/admin/ambulance', icon: Ambulance, label: 'Ambulans' },
  ]},
  { label: 'MANAJEMEN GEDUNG', items: [
    { to: '/admin/work-orders', icon: Wrench, label: 'Work Orders' },
  ]},
  { label: 'PELATIHAN & EVENT', items: [
    { to: '/admin/trainings', icon: GraduationCap, label: 'Diklat' },
    { to: '/admin/blood-donations', icon: Droplets, label: 'Donor Darah' },
    { to: '/admin/mou', icon: FileSignature, label: 'MoU' },
  ]},
  { label: 'SISTEM', items: [
    { to: '/admin/users', icon: Shield, label: 'Users & Roles' },
  ]},
];

export default function Sidebar({ onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`${collapsed ? 'w-16' : 'w-60'} bg-gradient-to-b from-[#1a1d2e] to-[#151828] text-white flex flex-col transition-all duration-200 h-screen`}>
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-red-400 to-red-200 bg-clip-text text-transparent">PMI One</h1>
            <p className="text-[10px] text-white/30 mt-0.5">DKI Jakarta</p>
          </div>
        )}
        <div className="flex items-center gap-1">
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white hidden lg:block">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          {onClose && <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-white/50 hover:text-white lg:hidden"><X size={16} /></button>}
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {menu.map((group) => (
          <div key={group.label}>
            {!collapsed && <p className="px-3 mb-1.5 text-[10px] font-semibold text-white/20 tracking-widest">{group.label}</p>}
            {group.items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 mb-0.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600/80 to-red-500/40 text-white shadow-lg shadow-red-900/20'
                      : 'text-white/40 hover:bg-white/5 hover:text-white/80'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                <item.icon size={17} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-white/5 flex flex-col gap-0.5">
        <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}>
          <LayoutDashboard size={13} /> {!collapsed && 'Dashboard Pimpinan'}
        </NavLink>
        <NavLink to="/command" className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white/60'}`}>
          <Command size={13} /> {!collapsed && 'Command Center'}
        </NavLink>
      </div>
    </aside>
  );
}
