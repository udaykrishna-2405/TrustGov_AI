import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Loader2, Globe, ChevronDown } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../AuthContext';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  language?: string;
}

const MODE_LABEL: Record<string, string> = {
  government: 'CivicAI',
  corporate:  'EnterpriseAI',
  industry:   'IndustrialAI',
};

const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  government: [
    'What is the status of road repair complaints?',
    'How do I track my submitted grievance?',
    'What documents are needed for ration card?',
    'Explain the RTI process',
  ],
  corporate: [
    'Summarize this week\'s pulse check results',
    'What are the top compliance deadlines?',
    'How do I submit a meeting transcript for AI analysis?',
    'Explain the employee feedback process',
  ],
  industry: [
    'Which machines have high failure probability?',
    'What is the current quality pass rate?',
    'How do I report a safety incident?',
    'Explain the supplier risk scoring system',
  ],
};

export function ChatbotTab() {
  const { workspaceType } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [languages, setLanguages] = useState<Record<string, string>>({});
  const [selectedLang, setSelectedLang] = useState('english');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    api.ai.languages().then(d => setLanguages(d.languages || {})).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = useCallback(async (text?: string) => {
    const question = (text || input).trim();
    if (!question || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: question, language: selectedLang }]);
    setLoading(true);
    try {
      const res = await api.ai.chat(question, selectedLang);
      const reply = res.data?.answer || res.data?.response || 'I could not generate a response.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply, language: selectedLang }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, selectedLang]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const langEntries = Object.entries(languages);
  const currentLangLabel = languages[selectedLang] || 'English';

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[700px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Assistant</h2>
          <p className="text-sm text-gray-500 mt-1">
            {MODE_LABEL[workspaceType || 'government']} · Powered by NVIDIA NIM · 22 Languages
          </p>
        </div>
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(v => !v)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Globe className="w-4 h-4 text-blue-500" />
            {currentLangLabel}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          <AnimatePresence>
            {showLangMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-gray-200 shadow-xl z-30 overflow-hidden"
              >
                <div className="max-h-64 overflow-y-auto p-2">
                  {langEntries.map(([code, label]) => (
                    <button
                      key={code}
                      onClick={() => { setSelectedLang(code); setShowLangMenu(false); }}
                      className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-colors ${
                        selectedLang === code ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {String(label)}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-4 mb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">How can I help?</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
              Ask anything about your workspace. I support all 22 Indian languages.
            </p>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {(SUGGESTED_QUESTIONS[workspaceType || 'government'] || []).map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  className="text-left px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-md'
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-md'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    {[0,1,2].map(n => (
                      <motion.span key={n} animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, delay: n * 0.15, repeat: Infinity }}
                        className="w-2 h-2 bg-blue-400 rounded-full" />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3 flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Ask in ${currentLangLabel}… (Enter to send)`}
          rows={1}
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none leading-relaxed"
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 shadow"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
