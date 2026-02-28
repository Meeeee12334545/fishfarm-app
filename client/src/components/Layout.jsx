import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Waves, Heart, UtensilsCrossed,
  Droplets, Package, CheckSquare, BarChart3, Menu, X
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tanks', label: 'Tanks', icon: Waves },
  { to: '/health', label: 'Health', icon: Heart },
  { to: '/feeding', label: 'Feeding', icon: UtensilsCrossed },
  { to: '/water-quality', label: 'Water Quality', icon: Droplets },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
];

export default function Layout({ children, alertCount = 0 }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🐠</span>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Wide Bay</h1>
            <p className="text-blue-300 text-xs">Aquatics Management</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors
              ${isActive
                ? 'bg-blue-700 text-white'
                : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`
            }
            onClick={() => setSidebarOpen(false)}>
            <Icon size={18} />
            <span>{label}</span>
            {label === 'Health' && alertCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-blue-800">
        <p className="text-blue-400 text-xs">Wide Bay QLD, Australia</p>
        <p className="text-blue-500 text-xs mt-0.5">v1.0.0</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-60 bg-[#1e3a5f] flex-shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-40 w-60 h-full bg-[#1e3a5f]">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-[#1e3a5f] text-white">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <span className="text-lg">🐠</span>
          <span className="font-semibold">Wide Bay Aquatics</span>
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
