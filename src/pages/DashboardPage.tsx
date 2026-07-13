import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Activity, Clock, AlertTriangle, FileText, ChevronRight, Lock, X, Copy, Check, Cpu, Hash, Zap } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { Service, Activity as ActivityType, cn } from '../lib/utils';
import * as Icons from 'lucide-react';

interface TokenMeta {
  tokenId: string;
  accessLevel: string;
  validity: string;
  blockchainTxId: string;
  requestHash: string;
  verificationMode?: string;
  blockchainVerified?: boolean;
}

interface ServiceTokenModalProps {
  service: Service;
  tokenMeta: TokenMeta;
  onClose: () => void;
  onDone: () => void;
}

function ServiceTokenModal({ service, tokenMeta, onClose, onDone }: ServiceTokenModalProps) {
  const Icon = (Icons as any)[service.icon] || FileText;
  const [copied, setCopied] = useState<string | null>(null);
  const isBlockchainVerified = tokenMeta.blockchainVerified ?? tokenMeta.blockchainTxId.startsWith('AMB-VERIFIED');

  const copyValue = (label: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-brand p-8 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 opacity-10">
            <Shield className="w-40 h-40" />
          </div>
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50 block mb-2">Service Token Issued</span>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/15 rounded-xl">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">{service.name}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
          <div className="relative z-10 mt-6 flex gap-3">
            <span className="px-3 py-1.5 bg-success/20 text-green-200 text-[10px] font-bold uppercase tracking-wider rounded-full border border-success/20">
              ✓ Verified Citizen
            </span>
            <span className="px-3 py-1.5 bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wider rounded-full border border-white/10">
              Valid {tokenMeta.validity}
            </span>
            <span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${isBlockchainVerified ? 'bg-emerald-400/20 text-emerald-100 border-emerald-300/30' : 'bg-amber-400/20 text-amber-100 border-amber-300/30'}`}>
              {isBlockchainVerified ? 'Blockchain Verified' : 'Blockchain Pending'}
            </span>
          </div>
        </div>

        {/* Token Details */}
        <div className="p-6 space-y-3">
          {/* Token ID */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-brand" />
              <div>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Token ID</p>
                <p className="text-sm font-mono font-bold text-text-main">{tokenMeta.tokenId}</p>
              </div>
            </div>
            <button onClick={() => copyValue('token', tokenMeta.tokenId)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
              {copied === 'token' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-text-muted" />}
            </button>
          </div>

          {/* Blockchain TX */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <Cpu className="w-4 h-4 text-brand shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Blockchain TX</p>
                <p className="text-sm font-mono font-bold text-text-main truncate max-w-[180px]">{tokenMeta.blockchainTxId}</p>
              </div>
            </div>
            <button onClick={() => copyValue('tx', tokenMeta.blockchainTxId)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors shrink-0">
              {copied === 'tx' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-text-muted" />}
            </button>
          </div>

          {/* Integrity Hash */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3 min-w-0">
              <Hash className="w-4 h-4 text-brand shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Integrity Hash (SHA-256)</p>
                <p className="text-sm font-mono font-bold text-text-main truncate max-w-[180px]">{tokenMeta.requestHash.slice(0, 20)}…</p>
              </div>
            </div>
            <button onClick={() => copyValue('hash', tokenMeta.requestHash)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors shrink-0">
              {copied === 'hash' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4 text-text-muted" />}
            </button>
          </div>

          <button
            onClick={onDone}
            className="w-full mt-2 py-4 bg-brand text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest hover:bg-brand/90 transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

const ServiceCard = ({ service, onClick, isLoading }: { service: Service; onClick: () => void; isLoading: boolean }) => {
  const Icon = (Icons as any)[service.icon] || FileText;

  return (
    <motion.button
      onClick={onClick}
      disabled={isLoading}
      whileHover={isLoading ? {} : { y: -4 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="card p-8 group cursor-pointer bg-white/80 backdrop-blur-sm text-left w-full disabled:opacity-60 disabled:cursor-wait"
    >
      <div className="flex items-start justify-between mb-8">
        <div className="p-4 bg-brand/5 rounded-2xl group-hover:bg-brand/10 transition-colors">
          <Icon className="w-6 h-6 text-brand" />
        </div>
        <div className="badge bg-success/10 text-success">
          Verified
        </div>
      </div>
      <h3 className="text-xl font-bold text-text-main mb-3 tracking-tight">{service.name}</h3>
      <p className="text-sm text-text-muted mb-6 leading-relaxed font-medium line-clamp-2">{service.description}</p>
      <div className="flex items-center text-[10px] font-bold uppercase tracking-widest text-brand group-hover:translate-x-2 transition-transform">
        {isLoading ? 'Issuing Token…' : 'Request Access'} <ChevronRight className="w-4 h-4 ml-2" />
      </div>
    </motion.button>
  );
};

export function DashboardPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingServiceId, setLoadingServiceId] = useState<string | null>(null);
  const [activeToken, setActiveToken] = useState<{ service: Service; meta: TokenMeta } | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const taxServiceUrl = ((import.meta as any).env?.VITE_TAX_SERVICE_URL as string | undefined) || 'http://localhost:3001';
  const passportServiceUrl = ((import.meta as any).env?.VITE_PASSPORT_SERVICE_URL as string | undefined) || 'http://localhost:3012';
  const parivahanServiceUrl = ((import.meta as any).env?.VITE_PARIVAHAN_SERVICE_URL as string | undefined) || 'http://localhost:3013';

  const serviceRedirectMap: Record<string, string> = {
    tax: taxServiceUrl,
    passport: passportServiceUrl,
    parivahan: parivahanServiceUrl,
  };

  const fetchActivity = async () => {
    try {
      const res = await fetch('/api/activity');
      const data = await res.json();
      if (data.success) setActivities(data.activity);
    } catch {}
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servRes, actRes] = await Promise.all([
          fetch('/api/services'),
          fetch('/api/activity')
        ]);
        const servData = await servRes.json();
        const actData = await actRes.json();
        if (servData.success) setServices(servData.services);
        if (actData.success) setActivities(actData.activity);
      } catch (err) {
        console.error("Failed to fetch dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRequestService = async (service: Service) => {
    setLoadingServiceId(service.id);
    setRequestError(null);
    try {
      const res = await fetch('/api/request-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: service.id }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveToken({ service, meta: data.tokenMeta });
        fetchActivity();
      } else {
        setRequestError(data.message || 'Failed to issue token.');
      }
    } catch {
      setRequestError('Network error. Please try again.');
    } finally {
      setLoadingServiceId(null);
    }
  };

  const handleTokenDone = () => {
    if (!activeToken) return;

    const redirectUrl = serviceRedirectMap[activeToken.service.id];
    console.log("Token Done -> Service ID:", activeToken.service.id, "Redirect URL:", redirectUrl);
    if (redirectUrl) {
      try {
        const url = new URL(redirectUrl);
        url.searchParams.set('tg_token', activeToken.meta.tokenId);
        url.searchParams.set('tg_tx', activeToken.meta.blockchainTxId);
        window.location.href = url.toString();
      } catch (err) {
        window.location.href = redirectUrl;
      }
      return;
    }

    alert(`No redirect map found for: ${activeToken.service.id}`);
    setActiveToken(null);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-background">
      <AnimatePresence>
        {activeToken && (
          <ServiceTokenModal
            service={activeToken.service}
            tokenMeta={activeToken.meta}
            onClose={() => setActiveToken(null)}
            onDone={handleTokenDone}
          />
        )}
      </AnimatePresence>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-8 space-y-12">
          {/* Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="bg-brand p-10 md:p-12 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl shadow-brand/20"
          >
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Shield className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/60 mb-4 block">Identity Gateway Active</span>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Good morning, <br />{user.name}</h1>
              <p className="text-brand-light/70 max-w-md text-lg font-light leading-relaxed">Your digital identity is active and protected. You have secure access to all linked national services.</p>
              
              <div className="mt-12 flex flex-wrap gap-6 items-center">
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider">Identity Verified</span>
                </div>
                <div className="text-[10px] font-mono font-bold text-white/40 tracking-widest uppercase">Session: TG-8821-X</div>
              </div>
            </div>
          </motion.div>

          {/* Services Grid */}
          <div>
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="section-label">Available Services</span>
                <h2 className="text-2xl font-bold text-text-main">Government Portals</h2>
              </div>
              <button className="text-[11px] font-bold uppercase tracking-widest text-brand hover:opacity-70 transition-opacity">Manage Services</button>
            </div>
            {requestError && (
              <div className="mb-6 px-5 py-4 bg-red-50 border border-red-100 rounded-2xl text-sm font-medium text-red-600">
                {requestError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {services.map(service => (
                <div key={service.id}>
                  <ServiceCard
                    service={service}
                    onClick={() => handleRequestService(service)}
                    isLoading={loadingServiceId === service.id}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          {/* Security Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="card p-8 bg-white/80 backdrop-blur-sm"
          >
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-main mb-8 flex items-center">
              <Shield className="w-4 h-4 text-brand mr-3" />
              Security Health
            </h3>
            <div className="space-y-6">
              <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Gateway Status</span>
                  <div className="w-1.5 h-1.5 bg-success rounded-full" />
                </div>
                <p className="text-sm font-bold text-text-main">Encrypted tunnel active.</p>
                <div className="mt-3 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-success w-[98%]" />
                </div>
              </div>

              <div className="p-5 bg-warning/5 border border-warning/10 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-warning uppercase tracking-wider">Recent Alert</span>
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
                <p className="text-sm font-bold text-text-main">New device login detected.</p>
                <button className="mt-4 text-[10px] font-bold text-warning uppercase tracking-widest hover:opacity-70 transition-opacity">Review Access</button>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="card p-8 bg-white/80 backdrop-blur-sm"
          >
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-main mb-8 flex items-center">
              <Clock className="w-4 h-4 text-brand mr-3" />
              Access Logs
            </h3>
            <div className="space-y-8">
              {activities.map((act, i) => (
                <div key={act.id} className="flex items-start space-x-5 relative">
                  {i !== activities.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-[-32px] w-[1px] bg-slate-100" />
                  )}
                  <div className={cn(
                    "w-6 h-6 rounded-lg flex items-center justify-center mt-1 z-10 shadow-sm",
                    act.type === 'Login' ? "bg-brand text-white" : "bg-slate-100 text-text-muted"
                  )}>
                    {act.type === 'Login' ? <Lock className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-bold text-text-main">{act.type}</p>
                      <span className="text-[10px] font-mono font-bold text-text-muted">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[11px] text-text-muted font-medium mb-2">{act.location}</p>
                    <div className={cn(
                      "badge",
                      act.status === 'Success' ? "bg-success/10 text-success" : "bg-slate-100 text-text-muted"
                    )}>
                      {act.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-4 text-[11px] font-bold uppercase tracking-widest text-text-muted hover:text-text-main border border-border rounded-2xl transition-all hover:bg-slate-50">
              Full Security Audit
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
