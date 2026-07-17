import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Shield, User, Mail, Phone, Lock, ArrowRight,
  AlertCircle, CheckCircle, Building2, ChevronDown,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

interface Workspace {
  id: string;
  name: string;
  type: 'government' | 'corporate' | 'industry';
  logo_url?: string;
}

const WORKSPACE_ICONS: Record<string, string> = {
  government: '🏛️',
  corporate: '🏢',
  industry: '🏭',
};

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch workspaces for the dropdown
  useEffect(() => {
    fetch('/api/workspaces')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.workspaces?.length) {
          setWorkspaces(d.workspaces);
          setWorkspaceId(d.workspaces[0].id); // default to first
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingWorkspaces(false));
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId) {
      setError('Please select a workspace.');
      return;
    }
    setIsLoading(true);
    setError('');

    const res = await register({ workspaceId, name, email, phone, password });
    setIsLoading(false);

    if (!res.success) {
      setError(res.message || 'Registration failed.');
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/login'), 1800);
  };

  const selectedWs = workspaces.find((w) => w.id === workspaceId);

  return (
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
          <Link to="/" className="inline-flex items-center space-x-3 group mb-8">
            <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-text-main">TrustOS</span>
          </Link>
          <h1 className="text-3xl font-bold text-text-main mb-2">Create Account</h1>
          <p className="text-text-muted">Join your organisation's TrustOS workspace.</p>
        </div>

        <form onSubmit={handleRegister} className="card p-8 md:p-10 bg-white/80 backdrop-blur-sm border-white/50 space-y-5">

          {/* Workspace Selector */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-text-muted block mb-2">
              Select Workspace
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              <select
                value={workspaceId}
                onChange={(e) => setWorkspaceId(e.target.value)}
                required
                disabled={isLoadingWorkspaces}
                className="input-field pl-12 pr-10 appearance-none cursor-pointer"
              >
                {isLoadingWorkspaces ? (
                  <option>Loading workspaces…</option>
                ) : (
                  workspaces.map((ws) => (
                    <option key={ws.id} value={ws.id}>
                      {WORKSPACE_ICONS[ws.type]} {ws.name} ({ws.type})
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
            {selectedWs && (
              <p className="text-[10px] text-text-muted mt-1.5 pl-1">
                Mode: <span className="font-bold capitalize text-brand">{selectedWs.type}</span>
              </p>
            )}
          </div>

          {/* Name */}
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              className="input-field pl-12"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="email"
              className="input-field pl-12"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="tel"
              className="input-field pl-12"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              minLength={10}
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="password"
              className="input-field pl-12"
              placeholder="Create Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-2 text-error text-xs bg-error/5 p-4 rounded-xl border border-error/10">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-center text-sm bg-success/5 border border-success/20 p-4 rounded-xl">
              <CheckCircle className="w-4 h-4 mr-2 text-success" />
              <span className="text-success">Registration successful! Redirecting to login…</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || isLoadingWorkspaces}
            className="btn-primary w-full py-4 flex items-center justify-center group"
          >
            {isLoading ? 'Creating Account…' : (
              <>
                Register Account
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-xs text-center text-text-muted">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Login
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
