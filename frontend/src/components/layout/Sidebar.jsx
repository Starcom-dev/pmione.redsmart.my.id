import { NavLink } from 'react-router-dom';
import { FileText, Users, Calendar, Archive, Briefcase, Heart, AlertTriangle, Warehouse, Truck, Ambulance, Wrench, GraduationCap, Droplets, FileSignature, LayoutDashboard, Command, ChevronLeft, ChevronRight, Shield } from 'lucide-react';
import { useState } from 'react';

const menu = [
  { label: 'DASHBOARD', items: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard Utama', end: true },
  ]},
  { label: 'E-OFFICE', items: [
    { to: '/admin/letters', icon: FileText, label: 'Surat' },
    { to: '/admin/meetings', icon: Calendar, label: 'Rapat' },
    { to: '/admin/archives', icon: Archive, label: 'Arsip' },
  ]},
  { label: 'SDM & RELAWAN', items: [
    { to: '/admin/employees', icon: Users, label: 'Kepegawaian' },
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

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-[#1e2240] text-white flex flex-col transition-all duration-200 min-h-screen sticky top-0`}>
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!collapsed && <div><h1 className="text-lg font-bold">PMI One</h1><p className="text-xs text-white/50">DKI Jakarta</p></div>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 hover:bg-white/10 rounded">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {menu.map((group) => (
          <div key={group.label} className="mb-1">
            {!collapsed && <p className="px-4 py-2 text-[10px] font-semibold text-white/30 tracking-wider">{group.label}</p>}
            {group.items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-red-600 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                  } ${collapsed ? 'justify-center' : ''}`
                }
              >
                <item.icon size={18} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <NavLink to="/dashboard" className="flex items-center gap-2 text-xs text-white/50 hover:text-white">
          <LayoutDashboard size={14} /> {!collapsed && 'Dashboard Pimpinan'}
        </NavLink>
        <NavLink to="/command" className="flex items-center gap-2 text-xs text-white/50 hover:text-white mt-1">
          <Command size={14} /> {!collapsed && 'Command Center'}
        </NavLink>
      </div>
    </aside>
  );
}
