import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, AlertTriangle, FolderOpen, Shield, MessageSquare,
  Heart, Cpu, LogOut, Menu, X, ChevronRight, Building2
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { OverviewTab }    from '../components/dashboard/OverviewTab';
import { IssuesTab }      from '../components/dashboard/IssuesTab';
import { ProjectsTab }    from '../components/dashboard/ProjectsTab';
import { SecurityTab }    from '../components/dashboard/SecurityTab';
import { ChatbotTab }     from '../components/dashboard/ChatbotTab';
import { EnterpriseTab }  from '../components/dashboard/EnterpriseTab';
import { IndustrialTab }  from '../components/dashboard/IndustrialTab';

// ── Mode theming ──────────────────────────────────────────────────────────────
const MODE_CONFIG: Record<string, { label: string; gradient: string; accent: string; light: string }> = {
  government: { label: 'CivicAI',       gradient: 'from-blue-600 to-indigo-700',  accent: 'bg-blue-600',   light: 'bg-blue-50 text-blue-700' },
  corporate:  { label: 'EnterpriseAI',  gradient: 'from-violet-600 to-purple-700', accent: 'bg-violet-600', light: 'bg-violet-50 text-violet-700' },
  industry:   { label: 'IndustrialAI',  gradient: 'from-orange-500 to-amber-600',  accent: 'bg-orange-500', light: 'bg-orange-50 text-orange-700' },
};

type Tab = 'overview' | 'issues' | 'projects' | 'security' | 'chat' | 'enterprise' | 'industrial';

function getNavItems(workspaceType: string | null): Array<{ key: Tab; label: string; icon: React.ElementType; modes?: string[] }> {
  return [
    { key: 'overview'    as Tab, label: 'Overview',        icon: LayoutDashboard },
    { key: 'issues'      as Tab, label: 'Issues',          icon: AlertTriangle },
    { key: 'projects'    as Tab, label: 'Projects & Funds', icon: FolderOpen },
    { key: 'enterprise'  as Tab, label: 'EnterpriseAI',    icon: Heart,     modes: ['corporate'] },
    { key: 'industrial'  as Tab, label: 'IndustrialAI',    icon: Cpu,       modes: ['industry'] },
    { key: 'security'    as Tab, label: 'Security',         icon: Shield },
    { key: 'chat'        as Tab, label: 'AI Assistant',    icon: MessageSquare },
  ].filter(item => !item.modes || item.modes.includes(workspaceType || ''));
}

export function DashboardPage() {
  const { user, workspaceType, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const modeKey = workspaceType || 'government';
  const mode = MODE_CONFIG[modeKey] || MODE_CONFIG.government;
  const navItems = getNavItems(workspaceType);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const NavLink = ({ item }: { item: ReturnType<typeof getNavItems>[0] }) => {
    const isActive = activeTab === item.key;
    return (
      <button
        onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
          isActive
            ? `${mode.accent} text-white shadow-md`
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
      </button>
    );
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64'}`}>
      {/* Brand */}
      <div className={`bg-gradient-to-br ${mode.gradient} p-6 flex-shrink-0`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">AI TrustOS</p>
            <p className="text-base font-black text-white leading-tight">{mode.label}</p>
          </div>
        </div>
        <div className="bg-white/15 rounded-xl px-3 py-2.5">
          <p className="text-xs font-bold text-white truncate">{user?.name}</p>
          <p className="text-[10px] text-white/60 capitalize">{user?.role?.replace(/_/g, ' ')}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(item => <NavLink key={item.key} item={item} />)}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 shadow-sm flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl lg:hidden flex flex-col"
            >
              <div className="absolute top-4 right-4 z-10">
                <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/20 rounded-xl text-white">
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
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 h-16 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-base font-bold text-gray-900">
                {navItems.find(n => n.key === activeTab)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                {user?.workspace?.name || 'Workspace'} · {mode.label}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${mode.light}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              Live
            </span>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'overview'   && <OverviewTab />}
                {activeTab === 'issues'     && <IssuesTab />}
                {activeTab === 'projects'   && <ProjectsTab />}
                {activeTab === 'security'   && <SecurityTab />}
                {activeTab === 'chat'       && <ChatbotTab />}
                {activeTab === 'enterprise' && <EnterpriseTab />}
                {activeTab === 'industrial' && <IndustrialTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
