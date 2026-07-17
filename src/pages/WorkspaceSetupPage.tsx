import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Building2, Factory, ArrowRight,
  CheckCircle, AlertCircle, ChevronLeft, Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

type WorkspaceType = 'government' | 'corporate' | 'industry';

const MODE_CONFIG: Record<WorkspaceType, {
  label: string; emoji: string; color: string; bg: string; border: string;
  Icon: any; hint: string;
}> = {
  government: {
    label: 'Government', emoji: '🏛️',
    color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200',
    Icon: Shield,
    hint: 'e.g. Chennai Municipal Corporation, Tamil Nadu PWD, CMDA',
  },
  corporate: {
    label: 'Corporate', emoji: '🏢',
    color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200',
    Icon: Building2,
    hint: 'e.g. Infosys Limited, Zoho Corporation, Freshworks',
  },
  industry: {
    label: 'Industry', emoji: '🏭',
    color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200',
    Icon: Factory,
    hint: 'e.g. TVS Motor Company, Ashok Leyland, Rane Group',
  },
};

const TYPES: WorkspaceType[] = ['government', 'corporate', 'industry'];

export function WorkspaceSetupPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<'type' | 'details' | 'admin' | 'done'>('type');
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType | null>(null);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdWorkspace, setCreatedWorkspace] = useState<any>(null);

  const cfg = workspaceType ? MODE_CONFIG[workspaceType] : null;

  const handleCreateWorkspace = async () => {
    if (adminPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (adminPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Step 1: Create workspace
      const wsRes = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName.trim(), type: workspaceType, description: orgDescription.trim() }),
      });
      const wsData = await wsRes.json();
      if (!wsRes.ok) throw new Error(wsData.error || 'Failed to create workspace');

      const workspaceId = wsData.workspace.id;

      // Step 2: Register admin user inside that workspace
      const userRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name: adminName.trim(),
          email: adminEmail.trim(),
          phone: adminPhone.trim(),
          password: adminPassword,
          role: 'admin',
        }),
      });
      const userData = await userRes.json();
      if (!userRes.ok) throw new Error(userData.error || 'Failed to create admin user');

      setCreatedWorkspace(wsData.workspace);
      setStep('done');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.04),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group mb-6">
            <div className="w-11 h-11 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-text-main">TrustOS</span>
          </Link>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {(['type', 'details', 'admin'] as const).map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s ? 'bg-brand text-white' :
                  ['done', 'admin', 'details'].indexOf(step) > ['done', 'admin', 'details'].indexOf(s)
                    ? 'bg-success text-white'
                    : 'bg-slate-100 text-text-muted'
                }`}>
                  {(['done', 'admin', 'details'].indexOf(step) > ['done', 'admin', 'details'].indexOf(s))
                    ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < 2 && <div className="w-8 h-px bg-slate-200" />}
              </React.Fragment>
            ))}
          </div>

          <h1 className="text-2xl font-bold text-text-main mb-1">
            {step === 'type' && 'Select Your Organisation Type'}
            {step === 'details' && 'Organisation Details'}
            {step === 'admin' && 'Create Admin Account'}
            {step === 'done' && 'Workspace Created! 🎉'}
          </h1>
          <p className="text-text-muted text-sm">
            {step === 'type' && 'Choose the sector that best describes your organisation.'}
            {step === 'details' && `Setting up your ${cfg?.label} workspace.`}
            {step === 'admin' && 'This will be the primary administrator account.'}
            {step === 'done' && 'Your TrustOS workspace is ready.'}
          </p>
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Type Selection ─────────────────────────────── */}
          {step === 'type' && (
            <motion.div key="type" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="space-y-3"
            >
              {TYPES.map((t) => {
                const c = MODE_CONFIG[t];
                const Icon = c.Icon;
                const selected = workspaceType === t;
                return (
                  <button
                    key={t}
                    onClick={() => setWorkspaceType(t)}
                    className={`w-full flex items-center gap-5 p-5 rounded-2xl border-2 text-left transition-all duration-200 ${
                      selected
                        ? `${c.border} ${c.bg}`
                        : 'border-border bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selected ? c.bg : 'bg-slate-100'} border ${selected ? c.border : 'border-slate-200'}`}>
                      <Icon className={`w-6 h-6 ${selected ? c.color : 'text-text-muted'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-text-main">{c.emoji} {c.label}</span>
                        {selected && <CheckCircle className={`w-4 h-4 ${c.color}`} />}
                      </div>
                      <p className="text-xs text-text-muted">{c.hint}</p>
                    </div>
                  </button>
                );
              })}

              <button
                disabled={!workspaceType}
                onClick={() => setStep('details')}
                className="btn-primary w-full py-4 mt-2 flex items-center justify-center gap-2 group disabled:opacity-40"
              >
                Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-center text-xs text-text-muted">
                Already have a workspace?{' '}
                <Link to="/login" className="text-brand font-semibold hover:underline">Login</Link>
              </p>
            </motion.div>
          )}

          {/* ── STEP 2: Organisation Details ──────────────────────── */}
          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="card p-8 bg-white/80 backdrop-blur-sm space-y-5"
            >
              {cfg && (
                <div className={`flex items-center gap-3 p-3 rounded-xl ${cfg.bg} border ${cfg.border}`}>
                  <cfg.Icon className={`w-5 h-5 ${cfg.color}`} />
                  <span className={`text-sm font-bold ${cfg.color}`}>{cfg.emoji} {cfg.label} Workspace</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">
                  Organisation Name <span className="text-error">*</span>
                </label>
                <input
                  className="input-field"
                  placeholder={`Enter your ${cfg?.label.toLowerCase()} organisation name`}
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  autoFocus
                />
                <p className="text-[10px] text-text-muted mt-1.5">{cfg?.hint}</p>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">
                  Brief Description <span className="text-text-muted font-normal">(optional)</span>
                </label>
                <textarea
                  className="input-field resize-none h-20"
                  placeholder="What does your organisation do?"
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep('type')} className="btn-secondary flex items-center gap-2 px-5">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  disabled={!orgName.trim()}
                  onClick={() => setStep('admin')}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 group disabled:opacity-40"
                >
                  Continue <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Admin Account ──────────────────────────────── */}
          {step === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="card p-8 bg-white/80 backdrop-blur-sm space-y-4"
            >
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-700">
                  This creates the <strong>primary admin</strong> for <strong className="font-bold">"{orgName}"</strong>.
                  You can add more users after setup.
                </p>
              </div>

              {[
                { label: 'Full Name', key: 'adminName', val: adminName, set: setAdminName, type: 'text', placeholder: 'Administrator full name' },
                { label: 'Email Address', key: 'adminEmail', val: adminEmail, set: setAdminEmail, type: 'email', placeholder: 'admin@yourorg.com' },
                { label: 'Phone Number', key: 'adminPhone', val: adminPhone, set: setAdminPhone, type: 'tel', placeholder: '10-digit mobile number' },
                { label: 'Password', key: 'adminPassword', val: adminPassword, set: setAdminPassword, type: 'password', placeholder: 'Min 8 characters' },
                { label: 'Confirm Password', key: 'confirmPassword', val: confirmPassword, set: setConfirmPassword, type: 'password', placeholder: 'Re-enter password' },
              ].map(({ label, key, val, set, type, placeholder }) => (
                <div key={key}>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1.5">
                    {label} {key !== 'adminPhone' && <span className="text-error">*</span>}
                  </label>
                  <input
                    type={type}
                    className="input-field"
                    placeholder={placeholder}
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    required={key !== 'adminPhone'}
                  />
                </div>
              ))}

              {error && (
                <div className="flex items-start gap-2 text-error text-xs bg-error/5 p-4 rounded-xl border border-error/10">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep('details')} className="btn-secondary flex items-center gap-2 px-5">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  disabled={isLoading || !adminName || !adminEmail || !adminPassword || !confirmPassword}
                  onClick={handleCreateWorkspace}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 group disabled:opacity-40"
                >
                  {isLoading ? 'Creating…' : (
                    <>Create Workspace <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Done ──────────────────────────────────────── */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="card p-10 bg-white/80 backdrop-blur-sm text-center space-y-6"
            >
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto border-2 border-success/20">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-text-main mb-2">{createdWorkspace?.name}</h2>
                <p className="text-text-muted text-sm">
                  Your <span className="font-semibold capitalize text-brand">{createdWorkspace?.type}</span> workspace is live on TrustOS.
                </p>
              </div>

              <div className="text-left p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Login Credentials</p>
                <p className="text-sm text-text-main"><span className="text-text-muted">Email:</span> <strong>{adminEmail}</strong></p>
                <p className="text-sm text-text-main"><span className="text-text-muted">Role:</span> <strong>Admin</strong></p>
              </div>

              <button
                onClick={() => navigate(`/login?mode=${createdWorkspace?.type}`)}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 group"
              >
                Go to Login <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
