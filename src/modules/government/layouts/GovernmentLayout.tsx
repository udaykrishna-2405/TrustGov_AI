import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, MessageSquare, FileText, IndianRupee, HandHeart, Landmark, Shield, LogOut, Search, Bell, Target, Bot, ShieldCheck, Menu, X, ChevronRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../AuthContext';
import { useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { SecurityAlertBanner } from '../../../components/SecurityAlertBanner';

const navItems = [
  { path: '/gov/dashboard', label: 'Citizen Dashboard', icon: LayoutDashboard },
  { path: '/gov/issues', label: 'Grievances & RTI', icon: MessageSquare },
  { path: '/gov/officer', label: 'Officer Portal', icon: FileText },
  { path: '/gov/collector', label: 'Collector Dashboard', icon: Landmark },
  { path: '/gov/minister', label: 'Minister Dashboard', icon: Target },
  { path: '/gov/ai', label: 'AI Intelligence Hub', icon: Bot },
  { path: '/gov/security', label: 'Security & Access', icon: ShieldCheck },
  { path: '/gov/services', label: 'Public Services Hub', icon: HandHeart },
];

export function GovernmentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.path || (location.pathname === '/gov' && item.path === '/gov/dashboard');
    return (
      <Link
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
          isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
        }`}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
      </Link>
    );
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-white border-r border-slate-200 ${mobile ? '' : 'w-72'}`}>
      {/* Brand */}
      <div className="p-6 border-b border-slate-100 flex-shrink-0 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Government of India</p>
            <p className="text-xl font-extrabold text-slate-900 leading-tight">CivicAI</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
            {user?.name?.charAt(0) || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-bold text-slate-400 mb-3 ml-2 uppercase tracking-wider">Citizen Portal</p>
        {navItems.map(item => <NavLink key={item.path} item={item} />)}
      </nav>

      {/* Trust Score & Verification */}
      <div className="p-4 border-t border-slate-100 flex-shrink-0">
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 mb-4">
          <div className="flex items-center gap-2 text-emerald-700 mb-1">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-bold">Verified Citizen</span>
          </div>
          <p className="text-xs text-emerald-600/80">Aadhaar/KYC Completed</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Secure Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 flex-shrink-0 shadow-sm z-20">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden flex flex-col"
            >
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500">
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
        <SecurityAlertBanner />
        
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 h-16 flex items-center justify-between flex-shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl text-slate-600"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-slate-900">National Digital Portal</h1>
              <p className="text-xs text-slate-500">Transparent & Accessible Governance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center bg-slate-100 rounded-full px-3 py-1.5 border border-slate-200">
               <Search className="w-4 h-4 text-slate-400 mr-2" />
               <input type="text" placeholder="Search services..." className="bg-transparent border-none outline-none text-sm w-48 text-slate-700 placeholder-slate-400" />
             </div>
             <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors">
               <Shield className="w-4 h-4 text-blue-600" />
             </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
