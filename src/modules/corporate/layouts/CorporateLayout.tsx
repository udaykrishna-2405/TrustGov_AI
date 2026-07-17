import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Users, Briefcase, FileCheck, FolderOpen, LogOut, Menu, X, ChevronRight, Building2, MonitorSmartphone } from 'lucide-react';
import { useAuth } from '../../../AuthContext';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';

const navItems = [
  { path: '/corp/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
  { path: '/corp/hr', label: 'HR & Pulse', icon: Users },
  { path: '/corp/projects', label: 'Projects & Strategy', icon: FolderOpen },
  { path: '/corp/teams', label: 'Teams & Departments', icon: Briefcase },
  { path: '/corp/compliance', label: 'Compliance & Legal', icon: FileCheck },
  { path: '/corp/assets', label: 'IT & Assets', icon: MonitorSmartphone },
];

export function CorporateLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.path || (location.pathname === '/corp' && item.path === '/corp/dashboard');
    return (
      <Link
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
          isActive
            ? 'bg-violet-600 text-white shadow-md'
            : 'text-gray-400 hover:bg-white/10 hover:text-white'
        }`}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
      </Link>
    );
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-[#1e1b4b] text-white ${mobile ? '' : 'w-64'}`}>
      {/* Brand */}
      <div className="bg-violet-900/40 p-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-300">Enterprise Mode</p>
            <p className="text-base font-black text-white leading-tight">TrustOS</p>
          </div>
        </div>
        <div className="bg-black/20 rounded-xl px-3 py-2.5">
          <p className="text-xs font-bold text-white truncate">{user?.name}</p>
          <p className="text-[10px] text-violet-300 capitalize">{user?.role?.replace(/_/g, ' ')}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-3 ml-2">Modules</p>
        {navItems.map(item => <NavLink key={item.path} item={item} />)}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-violet-900/50 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1e1b4b] flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-[#1e1b4b] shadow-2xl lg:hidden flex flex-col"
            >
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-8 h-16 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900 hidden sm:block">
                Corporate Workspace
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-xs font-semibold flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                Enterprise Active
             </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
