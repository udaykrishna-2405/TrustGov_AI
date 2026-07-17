import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Fingerprint, Network, Cpu, Key, Database, CheckCircle, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useAuth } from '../../../AuthContext';

export interface VerificationSession {
  sessionId: string;
  txHash: string;
  blockId: string;
  prevHash: string;
  currentHash: string;
  sha256: string;
  merkleRoot: string;
  timestamp: string;
  portalName: string;
  portalUrl: string;
  citizenId: string;
  workspace: string;
  geo: string;
  ip: string;
  browser: string;
  device: string;
  trustScore: string;
  network: string;
  verifTimeMs: number;
  securityLevel: string;
  status: 'Verified';
}

interface Props {
  portalName: string;
  portalUrl: string;
  onComplete: () => void;
}

const generateHex = (length: number) => {
  const chars = '0123456789abcdef';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const STEPS = [
  { label: 'Initializing Secure Session...', icon: Fingerprint },
  { label: 'Generating Session Token...', icon: Key },
  { label: 'Creating Blockchain Transaction...', icon: Network },
  { label: 'Calculating SHA-256 Hash...', icon: Cpu },
  { label: 'Submitting to Ledger...', icon: Database },
  { label: 'Consensus Validation...', icon: Shield },
  { label: 'Transaction Confirmed', icon: CheckCircle },
];

export function BlockchainVerificationOverlay({ portalName, portalUrl, onComplete }: Props) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionData, setSessionData] = useState<VerificationSession | null>(null);

  useEffect(() => {
    // Generate simulated cryptographic metadata
    const newData: VerificationSession = {
      sessionId: `SESS-${generateHex(12).toUpperCase()}`,
      txHash: `0x${generateHex(64)}`,
      blockId: `BLK-${Math.floor(100000 + Math.random() * 900000)}`,
      prevHash: `0x${generateHex(64)}`,
      currentHash: `0x${generateHex(64)}`,
      sha256: generateHex(64),
      merkleRoot: `0x${generateHex(64)}`,
      timestamp: new Date().toISOString(),
      portalName,
      portalUrl,
      citizenId: user?.id || 'USR-UNKNOWN',
      workspace: 'CivicAI',
      geo: 'Chennai, India', // Simulated
      ip: `192.168.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`, // Masked internal
      browser: 'Secure Browser',
      device: 'Verified Endpoint',
      trustScore: '98/100',
      network: 'TrustOS Mainnet',
      verifTimeMs: Math.floor(250 + Math.random() * 150),
      securityLevel: 'A-Grade',
      status: 'Verified'
    };
    
    setSessionData(newData);

    // Save to local storage for history
    const existing = JSON.parse(localStorage.getItem('trustos_gov_sessions') || '[]');
    localStorage.setItem('trustos_gov_sessions', JSON.stringify([newData, ...existing]));

    // Animate steps
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < STEPS.length) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
        // After final step, wait 1s then open portal
        setTimeout(() => {
          onComplete();
        }, 1500);
      }
    }, 500); // 3.5 seconds total for 7 steps

    return () => clearInterval(interval);
  }, [portalName, portalUrl, onComplete, user]);

  if (!sessionData) return null;

  const CurrentIcon = STEPS[currentStep].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
               <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">TrustOS Verification</h2>
              <p className="text-blue-200 text-sm font-medium">Securing connection to {portalName}...</p>
            </div>
          </div>
          <Lock className="w-8 h-8 text-white/30" />
        </div>

        {/* Animation Sequence */}
        <div className="p-8 flex flex-col items-center justify-center min-h-[250px] bg-slate-50 border-b border-slate-200">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 mb-6 relative">
                {currentStep === STEPS.length - 1 ? (
                   <motion.div 
                     initial={{ scale: 0.8 }} 
                     animate={{ scale: 1 }} 
                     className="w-full h-full bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                   >
                     <CheckCircle className="w-10 h-10 text-white" />
                   </motion.div>
                ) : (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-4 border-slate-200 border-t-blue-600 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full m-1 shadow-sm">
                      <CurrentIcon className="w-8 h-8 text-blue-600" />
                    </div>
                  </>
                )}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {STEPS[currentStep].label}
              </h3>
              <p className="text-sm text-slate-500 font-mono">
                {currentStep === STEPS.length - 1 ? 'Session Verified' : `Processing step ${currentStep + 1} of ${STEPS.length}`}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="w-full max-w-md bg-slate-200 rounded-full h-1.5 mt-8 overflow-hidden">
            <motion.div
              className={`h-full ${currentStep === STEPS.length - 1 ? 'bg-emerald-500' : 'bg-blue-600'}`}
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Expandable Details */}
        <div className="bg-white">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-4 flex items-center justify-between text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              View Blockchain Metadata
            </span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-slate-900 text-slate-300 font-mono text-[11px]"
              >
                <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-4">
                  <div><span className="text-slate-500">SESSION_ID:</span> <span className="text-blue-400">{sessionData.sessionId}</span></div>
                  <div><span className="text-slate-500">BLOCK_ID:</span> <span className="text-emerald-400">{sessionData.blockId}</span></div>
                  <div className="col-span-2"><span className="text-slate-500">TX_HASH:</span> <span className="text-slate-100 break-all">{sessionData.txHash}</span></div>
                  <div className="col-span-2"><span className="text-slate-500">SHA256:</span> <span className="text-slate-100 break-all">{sessionData.sha256}</span></div>
                  <div><span className="text-slate-500">TIMESTAMP:</span> {sessionData.timestamp}</div>
                  <div><span className="text-slate-500">LATENCY:</span> {sessionData.verifTimeMs}ms</div>
                  <div><span className="text-slate-500">TRUST_SCORE:</span> <span className="text-emerald-400 font-bold">{sessionData.trustScore}</span></div>
                  <div><span className="text-slate-500">NETWORK:</span> {sessionData.network}</div>
                  <div><span className="text-slate-500">CITIZEN_ID:</span> {sessionData.citizenId.substring(0,8)}...</div>
                  <div><span className="text-slate-500">IP_ADDR:</span> {sessionData.ip}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
