import React, { useState } from 'react';
import { Bot, FileText, Heart, ShieldAlert, Send, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LANGUAGES = [
  'English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi',
  'Gujarati', 'Punjabi', 'Odia', 'Assamese', 'Urdu', 'Sanskrit', 'Sindhi', 'Kashmiri',
  'Nepali', 'Konkani', 'Manipuri', 'Bodo', 'Dogri', 'Maithili'
];

export function GovAI() {
  const [activeTab, setActiveTab] = useState<'chat' | 'classify' | 'sentiment' | 'fraud'>('chat');
  
  // Chat state
  const [chatLanguage, setChatLanguage] = useState('Tamil');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'வணக்கம்! நான் TN Trust AI. உங்கள் குறைகளை பதிவு செய்ய அல்லது அரச சேவைகள் பற்றி அறிய நான் எப்படி உதவலாம்?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Fraud state
  const [fraudInput, setFraudInput] = useState('');
  const [fraudResult, setFraudResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    const input = chatInput;
    setChatInput('');
    setIsTyping(true);

    try {
      await new Promise(r => setTimeout(r, 1500));
      // Fake response based on language selection and input to simulate 22-language NVIDIA AI
      let response = `I am an AI assistant responding in ${chatLanguage}. Your query was: "${input}".`;
      if (chatLanguage === 'Tamil' && input.includes('கண்காணிப்பது')) {
        response = 'உங்கள் புகாரின் தற்போதைய நிலையை "Grievances" பகுதியில் பார்க்கலாம். உங்களுக்கு வழங்கப்பட்ட குறிப்பு எண்ணை (Blockchain TX) பயன்படுத்தவும்.';
      } else if (chatLanguage === 'Hindi') {
        response = 'नमस्ते! मैं आपकी शिकायत को ट्रैक करने में मदद कर सकता हूँ। कृपया अपना संदर्भ नंबर प्रदान करें।';
      }
      setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFraudAnalysis = async () => {
    if (!fraudInput) return;
    setIsAnalyzing(true);
    setFraudResult(null);
    try {
      await new Promise(r => setTimeout(r, 2000));
      setFraudResult({
        score: 84,
        flags: ['Multiple submissions from same IP', 'Unusual financial request amount', 'Suspicious document signature'],
        status: 'High Risk'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900">AI Intelligence Hub</h2>
        <p className="text-slate-500">NVIDIA-powered multimodal AI models for governance.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-200 p-4 space-y-2 flex-shrink-0">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <Bot className="w-5 h-5" />
            Citizen Chatbot
          </button>
          <button 
            onClick={() => setActiveTab('classify')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'classify' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <FileText className="w-5 h-5" />
            Text Classifier
          </button>
          <button 
            onClick={() => setActiveTab('sentiment')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'sentiment' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <Heart className="w-5 h-5" />
            Sentiment Analysis
          </button>
          <button 
            onClick={() => setActiveTab('fraud')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'fraud' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <ShieldAlert className="w-5 h-5" />
            Fraud Detection
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 relative">
          <AnimatePresence mode="wait">
            
            {activeTab === 'chat' && (
              <motion.div key="chat" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-blue-600" />
                    Multilingual Citizen Assistant
                  </h3>
                  <select 
                    value={chatLanguage} 
                    onChange={(e) => setChatLanguage(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-500"
                  >
                    {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                  </select>
                </div>
                
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 text-slate-800 p-3 rounded-2xl rounded-bl-none flex gap-1">
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}} />
                      </div>
                    </div>
                  )}
                </div>
                
                <form onSubmit={handleChatSubmit} className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your query here..."
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50"
                  />
                  <button type="submit" disabled={!chatInput || isTyping} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {activeTab === 'fraud' && (
              <motion.div key="fraud" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col">
                <div className="mb-6 border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    Fraud Detection & Risk Analysis
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Analyze documents, financial requests, or grievance texts for potential fraud patterns.</p>
                </div>

                <div className="space-y-6">
                  <textarea 
                    value={fraudInput}
                    onChange={(e) => setFraudInput(e.target.value)}
                    placeholder="Paste application text or financial data here for analysis..."
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none resize-none"
                  />
                  <button 
                    onClick={handleFraudAnalysis}
                    disabled={!fraudInput || isAnalyzing}
                    className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-colors"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Run AI Fraud Check
                  </button>

                  {fraudResult && (
                    <div className="p-6 rounded-2xl border border-red-200 bg-red-50 mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm font-bold uppercase tracking-wider text-red-600 mb-1">Risk Assessment</p>
                          <p className="text-2xl font-bold text-red-700">{fraudResult.status}</p>
                        </div>
                        <div className="w-16 h-16 rounded-full border-4 border-red-200 flex items-center justify-center bg-white">
                          <span className="text-xl font-bold text-red-600">{fraudResult.score}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4 pt-4 border-t border-red-200/50">
                        <p className="text-sm font-bold text-red-800 mb-2">Detected Anomalies:</p>
                        {fraudResult.flags.map((flag: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 text-red-700 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{flag}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {(activeTab === 'classify' || activeTab === 'sentiment') && (
              <motion.div key="other" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                  </div>
                  <p>Model loading in background...</p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
