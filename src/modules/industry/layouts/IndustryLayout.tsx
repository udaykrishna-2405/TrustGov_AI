import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Factory, Package, ShieldCheck, Settings, LogOut, Menu, X, ChevronRight, HardHat, Zap } from 'lucide-react';
import { useAuth } from '../../../AuthContext';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';

const navItems = [
  { path: '/industry/dashboard', label: 'Operations Overview', icon: Activity },
  { path: '/industry/production', label: 'Production Lines', icon: Factory },
  { path: '/industry/machines', label: 'Machine Health', icon: Zap },
  { path: '/industry/inventory', label: 'Inventory & Warehousing', icon: Package },
  { path: '/industry/quality', label: 'Quality Control', icon: ShieldCheck },
  { path: '/industry/maintenance', label: 'Maintenance & Repairs', icon: Settings },
];

export function IndustryLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.path || (location.pathname === '/industry' && item.path === '/industry/dashboard');
    return (
      <Link
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border ${
          isActive
            ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
            : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200 hover:border-gray-700'
        }`}
      >
        <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-500' : 'text-gray-500'}`} />
        <span className="flex-1 text-left tracking-wide">{item.label}</span>
        {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
      </Link>
    );
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-[#0f172a] text-gray-300 border-r border-gray-800/50 ${mobile ? '' : 'w-72'}`}>
      {/* Brand */}
      <div className="p-6 flex-shrink-0 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <HardHat className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500/80">Industrial Mode</p>
            <p className="text-xl font-black text-white leading-tight tracking-tight">TrustOS</p>
          </div>
        </div>
        <div className="bg-[#1e293b] rounded-lg p-3 border border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
               <span className="font-bold text-gray-300 text-sm">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-500 capitalize tracking-wide font-medium">{user?.role?.replace(/_/g, ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mb-4 ml-2">Plant Operations</p>
        {navItems.map(item => <NavLink key={item.path} item={item} />)}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800 flex-shrink-0 bg-[#0b1121]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden font-mono text-gray-300 selection:bg-amber-500/30">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/80 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 shadow-[10px_0_30px_rgba(0,0,0,0.5)] lg:hidden flex flex-col bg-[#0f172a]"
            >
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Subtle grid background for industrial feel */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0"></div>

        {/* Top Bar */}
        <header className="bg-[#0f172a]/90 backdrop-blur-md border-b border-gray-800 px-4 lg:px-8 h-16 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-800 rounded-lg"
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>
              <h1 className="text-sm font-bold tracking-widest text-gray-300 uppercase">
                Plant Command Center
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-[#020617] border border-gray-800 rounded text-xs font-bold font-mono">
                <span className="text-gray-500">SYS:</span>
                <span className="text-green-500">NOMINAL</span>
             </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 z-10 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
