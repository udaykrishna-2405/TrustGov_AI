import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Building2, Factory, ArrowRight, Loader2,
  CheckCircle, AlertCircle, Laptop, MapPin, Cpu, Mail, Lock, ChevronDown,
} from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import AccountBlockedScreen, { type BlockedDetails } from '../components/AccountBlockedScreen';

type Step = 'login' | 'device' | 'token';
type WorkspaceType = 'government' | 'corporate' | 'industry';

interface Workspace { id: string; name: string; type: WorkspaceType; }

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const MODE_META: Record<WorkspaceType, { label: string; emoji: string; Icon: any; color: string }> = {
  government: { label: 'CivicAI',      emoji: '🏗️', Icon: Shield,    color: 'text-blue-600' },
  corporate:  { label: 'EnterpriseAI', emoji: '🏢', Icon: Building2, color: 'text-violet-600' },
  industry:   { label: 'IndustrialAI', emoji: '🏗️', Icon: Factory,   color: 'text-emerald-600' },
};

const getBrowserName = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Edg'))    return 'Microsoft Edge';
  if (ua.includes('Chrome')) return 'Chrome Browser';
  if (ua.includes('Firefox'))return 'Firefox Browser';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari Browser';
  return 'Secure Browser';
};
const getOS = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac'))     return 'macOS';
  if (ua.includes('Linux'))   return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown OS';
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();

  const modeParam = (searchParams.get('mode') || 'government') as WorkspaceType;

  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWs, setIsLoadingWs] = useState(true);
  const [error, setError] = useState('');
  const [checks, setChecks] = useState({ device: false, location: false, session: false });
  const [blockedDetails, setBlockedDetails] = useState<BlockedDetails | null>(null);
  const [detectedLocation, setDetectedLocation] = useState('Chennai, India');

  const browser = getBrowserName();
  const os = getOS();
  const meta = MODE_META[modeParam] || MODE_META.government;
  const Icon = meta.Icon;

  // Fetch workspaces filtered by mode
  useEffect(() => {
    setIsLoadingWs(true);
    fetch('/api/workspaces')
      .then((r) => r.json())
      .then((d) => {
        const filtered: Workspace[] = (d.workspaces || []).filter(
          (w: Workspace) => w.type === modeParam,
        );
        setWorkspaces(filtered);
        if (filtered.length > 0) setWorkspaceId(filtered[0].id);
      })
      .catch(() => {})
      .finally(() => setIsLoadingWs(false));
  }, [modeParam]);

  // Geolocation
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((d) => {
        if (d?.city && d?.country_name) setDetectedLocation(`${d.city}, ${d.country_name}`);
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const res = await login({ email, password, workspaceId: workspaceId || undefined });
    if (!res.success) {
      setIsLoading(false);
      setError(res.message || 'Login failed');
      return;
    }

    setStep('device');
    setChecks({ device: false, location: false, session: false });

    await delay(500); setChecks((p) => ({ ...p, device: true }));
    await delay(500);

    try {
      const secRes = await fetch('/api/security/check', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (secRes.ok) {
        const sec = await secRes.json();
        if (sec.blocked) { setBlockedDetails(sec.blockedDetails); setIsLoading(false); return; }
      }
    } catch {}

    setChecks((p) => ({ ...p, location: true }));
    await delay(500);
    setChecks((p) => ({ ...p, session: true }));
    await delay(700);
    setStep('token');
    await delay(1400);
    navigate('/dashboard');
  };

  return (
    <>
      {blockedDetails && (
        <AccountBlockedScreen details={blockedDetails} onBack={() => setBlockedDetails(null)} adminEmail="support@aitrustos.in" />
      )}

      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.02),transparent_70%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md relative z-10"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-3 group mb-6">
              <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-text-main">AI TrustOS</span>
            </Link>

            {/* Mode badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-text-muted mb-4">
              <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
              {meta.emoji} {meta.label} Portal
              <button onClick={() => navigate('/')} className="ml-1 hover:text-text-main transition-colors text-[10px] underline">
                change
              </button>
            </div>

            <h1 className="text-3xl font-bold text-text-main mb-2">
              {step === 'login' && 'Secure Login'}
              {step === 'device' && 'Security Check'}
              {step === 'token' && 'Generating Token'}
            </h1>
            <p className="text-text-muted text-sm font-light">
              {step === 'login' && 'Login to your organisation workspace.'}
              {step === 'device' && 'Verifying device, location, and session.'}
              {step === 'token' && 'Creating your secure access token.'}
            </p>
            {step === 'login' && (
              <p className="mt-3 text-xs text-text-muted">
                New organisation?{' '}
                <Link to="/setup" className="font-semibold text-brand hover:underline">Register workspace</Link>
              </p>
            )}
          </div>

          <div className="card p-8 md:p-10 bg-white/80 backdrop-blur-sm border-white/50">
            <AnimatePresence mode="wait">

              {/* ── Login form ─────────────────────────────────────── */}
              {step === 'login' && (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleLogin}
                  className="space-y-5"
                >
                  {/* Workspace selector */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">
                      {meta.label} Organisation
                    </label>
                    <div className="relative">
                      <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${meta.color}`} />
                      <select
                        value={workspaceId}
                        onChange={(e) => setWorkspaceId(e.target.value)}
                        disabled={isLoadingWs}
                        className="input-field pl-12 pr-10 appearance-none cursor-pointer"
                      >
                        {isLoadingWs ? (
                          <option>Loading…</option>
                        ) : workspaces.length === 0 ? (
                          <option value="">No {meta.label} workspaces found</option>
                        ) : (
                          workspaces.map((ws) => (
                            <option key={ws.id} value={ws.id}>{ws.name}</option>
                          ))
                        )}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                    </div>
                    {workspaces.length === 0 && !isLoadingWs && (
                      <p className="text-xs text-text-muted mt-1.5">
                        No workspaces yet?{' '}
                        <Link to="/setup" className="text-brand font-semibold hover:underline">Create one</Link>
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="email" required
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-12" placeholder="Email Address"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="password" required
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-12" placeholder="Password"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-error text-xs bg-error/5 p-4 rounded-xl border border-error/10">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button type="submit" disabled={isLoading || isLoadingWs || workspaces.length === 0}
                    className="btn-primary w-full py-4 flex items-center justify-center group disabled:opacity-50"
                  >
                    {isLoading
                      ? <Loader2 className="w-5 h-5 animate-spin" />
                      : <><span>Secure Login</span><ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                    }
                  </button>
                </motion.form>
              )}

              {/* ── Device check ───────────────────────────────────── */}
              {step === 'device' && (
                <motion.div key="device"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="p-5 rounded-2xl border border-brand/20 bg-brand/5 space-y-3 text-sm">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-brand">Verifying Device…</p>
                    {[
                      { icon: Laptop, label: 'Device', val: browser },
                      { icon: Cpu,    label: 'OS',     val: os },
                      { icon: MapPin, label: 'Location', val: detectedLocation },
                    ].map(({ icon: I, label, val }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-text-muted flex items-center gap-2"><I className="w-4 h-4" />{label}</span>
                        <span className="font-semibold text-text-main">{val}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {(['Device Verified', 'Location Verified', 'Session Secure'] as const).map((label, i) => {
                      const done = [checks.device, checks.location, checks.session][i];
                      return (
                        <div key={label} className="flex items-center gap-3 text-sm">
                          {done
                            ? <CheckCircle className="w-4 h-4 text-success" />
                            : <Loader2 className="w-4 h-4 animate-spin text-brand" />
                          }
                          <span className="text-text-main">{label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-center text-[11px] uppercase tracking-wider font-bold text-text-muted">
                    Proceeding to Dashboard…
                  </p>
                </motion.div>
              )}

              {/* ── Token generation ───────────────────────────────── */}
              {step === 'token' && (
                <motion.div key="token"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="p-6 rounded-2xl border border-success/20 bg-success/5 space-y-3 text-sm">
                    <p className="text-[11px] uppercase tracking-wider font-bold text-success">Session Token Created</p>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Email</span>
                      <span className="font-semibold text-text-main truncate max-w-[200px]">{email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Mode</span>
                      <span className="font-semibold text-text-main">{meta.emoji} {meta.label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Validity</span>
                      <span className="font-semibold text-text-main">15 minutes</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-brand text-sm font-semibold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirecting to dashboard…
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
}
