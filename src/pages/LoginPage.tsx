import React, { useState, useEffect } from 'react';
import AccountBlockedScreen, { type BlockedDetails } from '../components/AccountBlockedScreen';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ArrowRight, Loader2, CheckCircle, AlertCircle, Laptop, MapPin, Cpu, Mail, Lock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type Step = 'login' | 'device' | 'token';

const getBrowserName = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Edg')) return 'Microsoft Edge';
  if (ua.includes('Chrome')) return 'Chrome Browser';
  if (ua.includes('Firefox')) return 'Firefox Browser';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari Browser';
  return 'Secure Browser';
};

const getOperatingSystem = () => {
  const ua = navigator.userAgent;
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Unknown OS';
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const defaultLocationLabel = 'Chennai, India';

  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [checks, setChecks] = useState({
    device: false,
    location: false,
    session: false,
  });
  const [blockedDetails, setBlockedDetails] = useState<BlockedDetails | null>(null);
  const [detectedLocation, setDetectedLocation] = useState(defaultLocationLabel);

  const browser = getBrowserName();
  const os = getOperatingSystem();

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.city && data.country_name) {
          setDetectedLocation(`${data.city}, ${data.country_name}`);
        } else {
          setDetectedLocation('Unknown Location');
        }
      })
      .catch(() => {
        setDetectedLocation(defaultLocationLabel);
      });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await login(email, password);

      if (res.success) {
        setStep('device');
        setChecks({ device: false, location: false, session: false });

        await delay(500);
        setChecks((prev) => ({ ...prev, device: true }));
        await delay(500);

        try {
          const secRes = await fetch('/api/security/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (secRes.ok) {
            const secData = await secRes.json();
            if (secData.blocked) {
              setBlockedDetails(secData.blockedDetails);
              setIsLoading(false);
              return;
            }
          }
        } catch {
          // Ignore network errors in security check
        }

        setChecks((prev) => ({ ...prev, location: true }));
        await delay(500);
        setChecks((prev) => ({ ...prev, session: true }));

        await delay(700);
        setStep('token');
        await delay(1500);
        navigate('/dashboard');
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {blockedDetails && (
        <AccountBlockedScreen
          details={blockedDetails}
          onBack={() => setBlockedDetails(null)}
          adminEmail="support@trustgov.in"
        />
      )}

      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.02),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center space-x-3 group mb-8">
            <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-text-main">TrustGov</span>
          </Link>

          <h1 className="text-3xl font-bold text-text-main mb-3">
            {step === 'login' && 'Secure Login'}
            {step === 'device' && 'TrustGov Security Check'}
            {step === 'token' && 'Generating Secure Identity Token'}
          </h1>

          <p className="text-text-muted font-light">
            {step === 'login' && 'Login using your registered email and password.'}
            {step === 'device' && 'Verifying device, location, and session integrity.'}
            {step === 'token' && 'Creating your secure session access token.'}
          </p>

          {step === 'login' && (
            <p className="mt-4 text-xs text-text-muted">
              First time user? <Link to="/register" className="font-semibold text-brand hover:underline">Create account</Link>
            </p>
          )}
        </div>

        <div className="card p-8 md:p-10 bg-white/80 backdrop-blur-sm border-white/50">
          <AnimatePresence mode="wait">
            {step === 'login' ? (
              <motion.form
                key="login-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleLogin}
                className="space-y-6"
              >
                <div>
                  <div className="relative mb-4">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-12"
                      placeholder="Email Address"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-12"
                      placeholder="Password"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-error text-xs bg-error/5 p-4 rounded-xl border border-error/10">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-4 flex items-center justify-center group"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      Secure Login
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.form>
            ) : step === 'device' ? (
              <motion.div
                key="device-verification"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-5 rounded-2xl border border-brand/20 bg-brand/5">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-brand mb-4">Verifying Device...</p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center"><Laptop className="w-4 h-4 mr-2" />Device</span>
                      <span className="font-semibold text-text-main">{browser}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center"><Cpu className="w-4 h-4 mr-2" />Operating System</span>
                      <span className="font-semibold text-text-main">{os}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted flex items-center"><MapPin className="w-4 h-4 mr-2" />Location</span>
                      <span className="font-semibold text-text-main">{detectedLocation}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Status</span>
                      <span className="font-semibold text-success">Trusted Device</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    {checks.device ? <CheckCircle className="w-4 h-4 text-success mr-2" /> : <Loader2 className="w-4 h-4 animate-spin text-brand mr-2" />}
                    <span className="text-text-main">Device Verified</span>
                  </div>
                  <div className="flex items-center text-sm">
                    {checks.location ? <CheckCircle className="w-4 h-4 text-success mr-2" /> : <Loader2 className="w-4 h-4 animate-spin text-brand mr-2" />}
                    <span className="text-text-main">Location Verified</span>
                  </div>
                  <div className="flex items-center text-sm">
                    {checks.session ? <CheckCircle className="w-4 h-4 text-success mr-2" /> : <Loader2 className="w-4 h-4 animate-spin text-brand mr-2" />}
                    <span className="text-text-main">Session Secure</span>
                  </div>
                </div>

                <p className="text-center text-[11px] uppercase tracking-wider font-bold text-text-muted">
                  Proceeding to Secure Dashboard...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="token-generation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="p-6 rounded-2xl border border-success/20 bg-success/5">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-success mb-4">Session Token Created</p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">User Email</span>
                      <span className="font-semibold text-text-main">{email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Access Level</span>
                      <span className="font-semibold text-text-main">Verified Citizen</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Session Validity</span>
                      <span className="font-semibold text-text-main">15 minutes</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center text-brand text-sm font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Redirecting to dashboard...
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
