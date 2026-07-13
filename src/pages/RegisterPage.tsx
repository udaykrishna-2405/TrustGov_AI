import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, User, Mail, Phone, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await register({ name, email, phone, password });
      if (!res.success) {
        setError(res.message || 'Registration failed.');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1800);
    } catch (err: any) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.02),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center space-x-3 group mb-8">
            <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-text-main">TrustGov</span>
          </Link>
          <h1 className="text-3xl font-bold text-text-main mb-2">Create Secure Identity</h1>
          <p className="text-text-muted">Register to access national e-governance services.</p>
        </div>

        <form onSubmit={handleRegister} className="card p-8 md:p-10 bg-white/80 backdrop-blur-sm border-white/50 space-y-5">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input className="input-field pl-12" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input type="email" className="input-field pl-12" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input type="tel" className="input-field pl-12" placeholder="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} required minLength={10} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input type="password" className="input-field pl-12" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-error text-xs bg-error/5 p-4 rounded-xl border border-error/10">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center justify-between text-sm bg-success/5 border border-success/20 p-4 rounded-xl">
              <span className="flex items-center text-success"><CheckCircle className="w-4 h-4 mr-2" />Registration Successful! Redirecting...</span>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 flex items-center justify-center group">
            {isLoading ? 'Creating Account...' : (
              <>
                Register Account
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <p className="text-xs text-center text-text-muted">
            Already registered? <Link to="/login" className="font-semibold text-brand hover:underline">Login with email and password</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
