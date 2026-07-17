import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Shield, Building2, Factory, ArrowRight,
  CheckCircle, Lock, Cpu, Globe
} from 'lucide-react';

const MODES = [
  {
    id: 'government',
    label: 'CivicAI',
    emoji: '🏗️',
    tagline: 'AI-powered public sector transparency & citizen services',
    color: 'from-blue-600 to-indigo-700',
    shadowColor: 'shadow-blue-500/30',
    borderColor: 'border-blue-500/20',
    hoverBorder: 'hover:border-blue-500/60',
    badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    Icon: Shield,
    features: ['Citizen Complaint Portal', 'Public Fund Transparency', 'AI Issue Resolution', 'Blockchain Audit Trail'],
  },
  {
    id: 'corporate',
    label: 'EnterpriseAI',
    emoji: '🏢',
    tagline: 'Intelligent enterprise compliance & employee management',
    color: 'from-violet-600 to-purple-700',
    shadowColor: 'shadow-violet-500/30',
    borderColor: 'border-violet-500/20',
    hoverBorder: 'hover:border-violet-500/60',
    badgeColor: 'bg-violet-500/10 text-violet-300 border-violet-500/20',
    Icon: Building2,
    features: ['Employee Issue Tracking', 'Compliance Monitoring', 'AI Risk Detection', 'Policy Enforcement'],
  },
  {
    id: 'industry',
    label: 'IndustrialAI',
    emoji: '🏗️',
    tagline: 'Smart manufacturing quality & supply chain integrity',
    color: 'from-emerald-600 to-teal-700',
    shadowColor: 'shadow-emerald-500/30',
    borderColor: 'border-emerald-500/20',
    hoverBorder: 'hover:border-emerald-500/60',
    badgeColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    Icon: Factory,
    features: ['NCR / Quality Reports', 'Predictive Maintenance', 'Production Batch Tracking', 'ISO Compliance AI'],
  },
];

export function ModeSelectorPage() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.05,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.opacity})`;
        ctx.fill();
      });

      // Draw lines between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(99,102,241,${0.07 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleSelect = (modeId: string) => {
    navigate(`/login?mode=${modeId}`);
  };

  return (
    <div className="min-h-screen bg-[#050814] relative overflow-hidden flex flex-col">
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Gradient blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/5 blur-[120px]" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 flex items-center justify-between px-8 py-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">AI TrustOS</span>
        </div>
        <div className="flex items-center gap-2 text-white/30 text-xs font-mono">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          SYSTEM ACTIVE
        </div>
      </motion.header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/50 text-[11px] font-bold uppercase tracking-widest mb-6">
            <Lock className="w-3 h-3" />
            Unified Trust & Transparency Platform
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            Choose Your
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Workspace Mode
            </span>
          </h1>
          <p className="text-white/40 text-lg font-light max-w-xl mx-auto leading-relaxed">
            Intelligent Transparency. For Every Institution.
          </p>
          <p className="text-white/25 text-sm font-light max-w-lg mx-auto mt-2">
            AI TrustOS adapts to your organisation type. Select the mode that matches
            your sector to access the right AI tools and workflows.
          </p>
        </motion.div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {MODES.map((mode, i) => {
            const Icon = mode.Icon;
            return (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(mode.id)}
                className={`group relative text-left rounded-3xl border ${mode.borderColor} ${mode.hoverBorder} bg-white/[0.03] backdrop-blur-sm p-8 transition-all duration-500 overflow-hidden cursor-pointer`}
              >
                {/* Gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-500 rounded-3xl`} />

                {/* Glow blob */}
                <div className={`absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-20 blur-3xl transition-all duration-500`} />

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${mode.color} flex items-center justify-center mb-6 shadow-lg ${mode.shadowColor} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider mb-4 ${mode.badgeColor}`}>
                  {mode.emoji} {mode.label}
                </div>

                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">{mode.label}</h2>
                <p className="text-white/40 text-sm leading-relaxed mb-6">{mode.tagline}</p>

                {/* Features */}
                <ul className="space-y-2 mb-8">
                  {mode.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-white/50 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-white/30 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center gap-2 text-white/50 group-hover:text-white text-sm font-semibold transition-colors duration-300">
                  Enter {mode.label} Portal
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Footer hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex items-center gap-6 text-white/20 text-xs"
        >
          <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> End-to-end encrypted</span>
          <span className="flex items-center gap-1.5"><Cpu className="w-3 h-3" /> AI-powered</span>
          <span className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Blockchain verified</span>
        </motion.div>

        {/* Setup link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-white/20 text-xs"
        >
          New organisation?{' '}
          <button
            onClick={() => navigate('/setup')}
            className="text-white/40 hover:text-white/70 underline transition-colors"
          >
            Register your workspace
          </button>
        </motion.p>
      </main>
    </div>
  );
}
