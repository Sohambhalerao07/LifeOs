import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Calendar, CalendarDays, CheckSquare, BarChart2, Settings, HelpCircle, Plus, Menu, Bell, Moon, Sun } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import GlobalAddModal from './GlobalAddModal';
import EditSettingsModal from './EditSettingsModal';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../hooks/useTheme';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Weekly Planner', path: '/weekly', icon: CalendarDays },
  { name: 'Daily Planner', path: '/daily', icon: Calendar },
  { name: 'Habits', path: '/habits', icon: CheckSquare },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
];

export default function Layout() {
  const [addModalState, setAddModalState] = useState({ isOpen: false, date: null });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { data: settings, updateItem: updateSettings } = useApi('settings');
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen bg-background text-on-background selection:bg-primary selection:text-on-primary">
      {/* Sidebar Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <nav className={cn(
        "w-60 h-screen fixed left-0 top-0 bg-surface border-r border-outline-variant flex-col p-4 gap-2 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 flex",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="mb-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-sm">hive</span>
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-primary">LifeOS</h1>
            <p className="font-label text-xs text-secondary">Productivity</p>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-4 px-4 py-2 rounded-lg transition-colors duration-200 ease-in-out',
                  isActive
                    ? 'bg-secondary-container text-on-secondary-container font-medium'
                    : 'text-secondary hover:bg-surface-container-high hover:text-on-surface'
                )
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-body text-base">{item.name}</span>
            </NavLink>
          ))}
        </div>
        
        <button 
          onClick={() => setAddModalState({ isOpen: true, date: null })}
          className="mt-auto mb-8 bg-primary text-on-primary font-label text-sm py-2 px-4 rounded-full shadow-sm hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-1"
        >
          <Plus className="w-4 h-4" /> Quick Add
        </button>
        
        <div className="flex flex-col gap-1 pt-4 border-t border-outline-variant">
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-4 px-4 py-2 text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface duration-200 ease-in-out rounded-lg w-full text-left"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-body text-base">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSettingsModalOpen(true);
            }}
            className="flex items-center gap-4 px-4 py-2 text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface duration-200 ease-in-out rounded-lg w-full text-left"
          >
            <Settings className="w-5 h-5" />
            <span className="font-body text-base">Settings</span>
          </button>
          <button 
            onClick={() => alert("Support coming soon!")}
            className="flex items-center gap-4 px-4 py-2 text-secondary transition-colors hover:bg-surface-container-high hover:text-on-surface duration-200 ease-in-out rounded-lg w-full text-left"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-body text-base">Support</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* TopAppBar */}
        <header className="h-16 sticky top-0 z-30 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-6 w-full">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-display text-xl font-bold text-on-surface hidden md:block">LifeOS</h2>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 h-full">
              <NavLink to="/weekly" className="h-full flex items-center text-primary font-bold border-b-2 border-primary pb-1 font-body text-base">Current Week</NavLink>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary transition-colors scale-95 active:scale-90 relative">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant cursor-pointer hover:border-primary transition-colors">
              <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3WQYrL0OBvTT4Fo3BEaCpmF5Tt1Pt7K4OCGo2plIQR9qFsCXAi147bLovUbowOl-LLUxPfO0FHax6pQizInmSK5qSNJwC9YiddweDrZJaNIr2TWRsoQHZjxNCp6cBRu5AZf38_d-jN9uBDPLjlnERAFw2Wplx7bvEreShKgalY_4fBPDhE1vnVV9iIfXu-KgvJJh1PCT_hypK94WzfJk8AL2RdA0me3W0lcciwINKxiXwBnLrZ5bCOU_gMaNfO0oN9Fb-pbybBw" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <Outlet context={{ openAddModal: (date = null) => setAddModalState({ isOpen: true, date }) }} />
      </main>

      <GlobalAddModal 
        isOpen={addModalState.isOpen} 
        initialDate={addModalState.date}
        onClose={() => setAddModalState({ isOpen: false, date: null })} 
      />
      
      <EditSettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSave={updateSettings}
      />
    </div>
  );
}
