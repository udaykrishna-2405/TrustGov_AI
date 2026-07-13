import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Brain,
  MessageSquare,
  BarChart3,
  ShieldAlert,
  Send,
  Loader2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const API_BASE = '/api/ai';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ComplaintClassification {
  category: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  department: string;
  summary: string;
  estimatedResolutionDays: number;
}

interface AnomalyDetectionResult {
  riskScore: number;
  flags: string[];
  recommendation: string;
  isSuspicious: boolean;
}

interface SentimentResult {
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  score: number;
  insight: string;
}

interface ChatMessage {
  q: string;
  a: string;
  actions: string[];
}

// ─── Helper components ────────────────────────────────────────────────────────

const PriorityBadge = ({ priority }: { priority: string }) => {
  const colours: Record<string, string> = {
    Critical: 'bg-red-100 text-red-700 border-red-200',
    High: 'bg-orange-100 text-orange-700 border-orange-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`badge border ${colours[priority] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      {priority}
    </span>
  );
};

const ProgressBar = ({ value, colour }: { value: number; colour: string }) => (
  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
    <motion.div
      className={`h-2 rounded-full ${colour}`}
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    />
  </div>
);

const FeatureCard = ({
  icon: Icon,
  title,
  subtitle,
  colour,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  colour: string;
  children: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="card p-8"
  >
    <div className="flex items-start space-x-4 mb-6">
      <div className={`p-3 rounded-2xl ${colour}`}>
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-text-main">{title}</h2>
        <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>
      </div>
    </div>
    {children}
  </motion.div>
);

// ─── Complaint Classifier ─────────────────────────────────────────────────────

function ComplaintClassifier() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ComplaintClassification | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const classify = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/classify-complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Classification failed');
      setResult(data.data as ComplaintClassification);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
    setLoading(false);
  };

  const EXAMPLES = [
    'The road in our area has huge potholes causing accidents every week.',
    'No water supply for 5 days in Sector 14. Children are suffering.',
    'Electricity cuts for 10 hours daily — food is spoiling and work is disrupted.',
  ];

  return (
    <FeatureCard
      icon={Brain}
      title="AI Complaint Classifier"
      subtitle="Automatically categorises and prioritises citizen complaints using AI"
      colour="bg-blue-50 text-blue-600"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setText(ex)}
              className="text-xs text-brand border border-brand/20 bg-brand/5 rounded-lg px-3 py-1.5 hover:bg-brand/10 transition-colors"
            >
              Example {i + 1}
            </button>
          ))}
        </div>

        <textarea
          id="complaint-input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Describe your complaint... e.g. The road in our area has huge potholes causing accidents every week and no one is fixing it despite multiple requests."
          className="input-field min-h-[110px] resize-none text-sm"
        />

        <button
          id="classify-btn"
          onClick={classify}
          disabled={loading || !text.trim()}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          <span>{loading ? 'Classifying...' : 'Classify Complaint'}</span>
        </button>

        {error && (
          <div className="flex items-center space-x-2 text-error text-sm bg-red-50 border border-red-100 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-border rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-2 text-success text-sm font-semibold">
                  <CheckCircle className="w-4 h-4" />
                  <span>Classification complete</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">Category</p>
                    <p className="font-semibold text-text-main">{result.category}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">Priority</p>
                    <PriorityBadge priority={result.priority} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">Department</p>
                    <p className="font-semibold text-text-main text-sm">{result.department}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">Est. Resolution</p>
                    <p className="font-semibold text-text-main">{result.estimatedResolutionDays} days</p>
                  </div>
                </div>

                <div className="space-y-1 border-t border-border pt-3">
                  <p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">AI Summary</p>
                  <p className="text-sm text-text-main">{result.summary}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FeatureCard>
  );
}

// ─── Chatbot ──────────────────────────────────────────────────────────────────

function Chatbot() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(prev => [
          ...prev,
          { q, a: data.data.answer as string, actions: (data.data.suggestedActions as string[]) ?? [] },
        ]);
      }
    } catch {
      /* silent */
    }
    setLoading(false);
  };

  const SUGGESTIONS = [
    'How do I track my complaint?',
    'What documents are needed for a passport?',
    'How long does Aadhaar update take?',
  ];

  return (
    <FeatureCard
      icon={MessageSquare}
      title="TrustGov AI Assistant"
      subtitle="Ask anything about government services, schemes, and complaint tracking"
      colour="bg-violet-50 text-violet-600"
    >
      <div className="space-y-4">
        {/* Chat window */}
        <div className="bg-slate-50/60 border border-border rounded-2xl p-4 min-h-[200px] max-h-[360px] overflow-y-auto space-y-4">
          {history.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Sparkles className="w-8 h-8 text-brand/30 mb-2" />
              <p className="text-sm text-text-muted">Ask me anything about government services</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="text-xs text-brand border border-brand/20 bg-white rounded-full px-3 py-1.5 hover:bg-brand/5 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.map((msg, i) => (
            <div key={i} className="space-y-2">
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-brand text-white text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[75%] shadow-sm shadow-brand/10">
                  {msg.q}
                </div>
              </div>
              {/* Bot reply */}
              <div className="flex justify-start">
                <div className="bg-white border border-border text-sm rounded-2xl rounded-tl-sm px-4 py-2.5 max-w-[80%] shadow-sm space-y-2">
                  <p className="text-text-main">{msg.a}</p>
                  {msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-border">
                      {msg.actions.map((action, j) => (
                        <span
                          key={j}
                          className="inline-flex items-center space-x-1 text-[11px] bg-brand/5 text-brand border border-brand/10 rounded-full px-2.5 py-1"
                        >
                          <ChevronRight className="w-3 h-3" />
                          <span>{action}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-brand" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input row */}
        <div className="flex space-x-2">
          <input
            id="chat-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask about government services, schemes..."
            className="input-field text-sm"
          />
          <button
            id="chat-send-btn"
            onClick={send}
            disabled={loading || !input.trim()}
            className="btn-primary px-4 py-3 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </FeatureCard>
  );
}

// ─── Sentiment Analysis ───────────────────────────────────────────────────────

function SentimentAnalyzer() {
  const [feedback, setFeedback] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!feedback.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/sentiment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setResult(data.data as SentimentResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
    setLoading(false);
  };

  const EXAMPLES = [
    'The water supply team responded within 2 days and fixed our problem. Very happy!',
    'Still waiting for my complaint to be resolved after 3 weeks. Very disappointed.',
    "It's okay, took a week but got resolved eventually.",
  ];

  const sentimentConfig = result
    ? {
        Positive: {
          icon: TrendingUp,
          colour: 'text-emerald-600',
          bg: 'bg-emerald-50 border-emerald-100',
          bar: 'bg-emerald-500',
          emoji: '😊',
        },
        Negative: {
          icon: TrendingDown,
          colour: 'text-red-600',
          bg: 'bg-red-50 border-red-100',
          bar: 'bg-red-500',
          emoji: '😠',
        },
        Neutral: {
          icon: Minus,
          colour: 'text-amber-600',
          bg: 'bg-amber-50 border-amber-100',
          bar: 'bg-amber-500',
          emoji: '😐',
        },
      }[result.sentiment]
    : null;

  return (
    <FeatureCard
      icon={BarChart3}
      title="Citizen Sentiment Analysis"
      subtitle="Analyses feedback to measure citizen satisfaction with government services"
      colour="bg-emerald-50 text-emerald-600"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              onClick={() => setFeedback(ex)}
              className="text-xs text-emerald-700 border border-emerald-200 bg-emerald-50 rounded-lg px-3 py-1.5 hover:bg-emerald-100 transition-colors"
            >
              Example {i + 1}
            </button>
          ))}
        </div>

        <textarea
          id="sentiment-input"
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          placeholder="Enter citizen feedback..."
          className="input-field min-h-[90px] resize-none text-sm"
        />

        <button
          id="sentiment-btn"
          onClick={analyze}
          disabled={loading || !feedback.trim()}
          className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
          <span>{loading ? 'Analyzing...' : 'Analyze Sentiment'}</span>
        </button>

        {error && (
          <div className="flex items-center space-x-2 text-error text-sm bg-red-50 border border-red-100 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence>
          {result && sentimentConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className={`border rounded-2xl p-6 space-y-4 ${sentimentConfig.bg}`}>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{sentimentConfig.emoji}</span>
                  <span className={`text-2xl font-bold ${sentimentConfig.colour}`}>{result.sentiment}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold text-text-muted">
                    <span>Sentiment Score</span>
                    <span className={sentimentConfig.colour}>{(result.score * 100).toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={Math.abs(result.score) * 100} colour={sentimentConfig.bar} />
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">AI Insight</p>
                  <p className="text-sm text-text-main">{result.insight}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FeatureCard>
  );
}

// ─── Anomaly Detection ────────────────────────────────────────────────────────

function AnomalyDetector() {
  const [result, setResult] = useState<AnomalyDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const SAMPLE_TRANSACTION = {
    id: 'TXN-2024-8847',
    department: 'Public Works',
    amount: 4750000,
    vendor: 'BuildFast Contractors Pvt Ltd',
    description: 'Road resurfacing - Sector 12',
    date: '2024-07-10',
    previousPayments: [1200000, 1200000, 1200000],
    currentPayment: 4750000,
    note: 'Urgent advance payment requested by vendor before work completion',
  };

  const detect = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/detect-anomaly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction: SAMPLE_TRANSACTION }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Detection failed');
      setResult(data.data as AnomalyDetectionResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    }
    setLoading(false);
  };

  const riskColour = result
    ? result.riskScore > 70
      ? 'bg-red-500'
      : result.riskScore > 40
      ? 'bg-amber-500'
      : 'bg-emerald-500'
    : 'bg-slate-300';

  return (
    <FeatureCard
      icon={ShieldAlert}
      title="Fund Anomaly Detection"
      subtitle="AI analyses government transactions for fraud, corruption, and anomalous spending"
      colour="bg-red-50 text-red-600"
    >
      <div className="space-y-4">
        {/* Transaction preview */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-sm">
          <p className="font-semibold text-amber-800 text-xs uppercase tracking-wider">Demo Transaction</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-amber-900">
            <span className="text-amber-600">Vendor:</span>
            <span className="font-medium">BuildFast Contractors Pvt Ltd</span>
            <span className="text-amber-600">Amount:</span>
            <span className="font-medium">₹47,50,000</span>
            <span className="text-amber-600">Department:</span>
            <span className="font-medium">Public Works</span>
            <span className="text-amber-600">Note:</span>
            <span className="font-medium text-amber-800">Urgent advance before work completion</span>
          </div>
        </div>

        <button
          id="anomaly-btn"
          onClick={detect}
          disabled={loading}
          className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
          <span>{loading ? 'Detecting...' : 'Run Anomaly Detection'}</span>
        </button>

        {error && (
          <div className="flex items-center space-x-2 text-error text-sm bg-red-50 border border-red-100 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className={`border rounded-2xl p-6 space-y-4 ${
                  result.isSuspicious ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <div
                  className={`flex items-center space-x-2 text-lg font-bold ${
                    result.isSuspicious ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {result.isSuspicious ? (
                    <>
                      <AlertTriangle className="w-5 h-5" />
                      <span>SUSPICIOUS TRANSACTION</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>TRANSACTION APPEARS NORMAL</span>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-semibold text-text-muted">
                    <span>Risk Score</span>
                    <span className={result.riskScore > 70 ? 'text-red-600' : result.riskScore > 40 ? 'text-amber-600' : 'text-emerald-600'}>
                      {result.riskScore}/100
                    </span>
                  </div>
                  <ProgressBar value={result.riskScore} colour={riskColour} />
                </div>

                {result.flags.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">🚩 Flags Detected</p>
                    <ul className="space-y-1">
                      {result.flags.map((flag, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-red-800">
                          <span className="text-red-500 mt-0.5">•</span>
                          <span>{flag}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-1 border-t border-black/5 pt-3">
                  <p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold">Recommendation</p>
                  <p className="text-sm text-text-main">{result.recommendation}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FeatureCard>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AIFeaturesPage() {
  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="section-label">Powered by Gemini AI</span>
          <h1 className="text-5xl font-bold text-text-main mb-4">
            🤖 TrustGov{' '}
            <span className="text-brand">AI Features</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto">
            Intelligent governance for a transparent India — four live AI capabilities
            that make public services smarter, faster, and corruption-proof.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {[
              { label: 'Complaint Classifier', colour: 'bg-blue-50 text-blue-700 border-blue-200' },
              { label: 'AI Assistant', colour: 'bg-violet-50 text-violet-700 border-violet-200' },
              { label: 'Sentiment Analysis', colour: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { label: 'Fraud Detection', colour: 'bg-red-50 text-red-700 border-red-200' },
            ].map(({ label, colour }) => (
              <span key={label} className={`badge border text-[11px] py-1.5 px-4 ${colour}`}>
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ComplaintClassifier />
          <Chatbot />
          <SentimentAnalyzer />
          <AnomalyDetector />
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-text-muted mt-12"
        >
          All AI responses are generated in real-time by Google Gemini. Results are for demonstration purposes.
        </motion.p>
      </div>
    </div>
  );
}
