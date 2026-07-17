import React, { useState, useEffect } from 'react';
import { Bot, FileText, Heart, ShieldAlert, Send, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const LANGUAGES = [
  'English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi',
  'Gujarati', 'Punjabi', 'Odia', 'Assamese', 'Urdu', 'Sanskrit', 'Sindhi', 'Kashmiri',
  'Nepali', 'Konkani', 'Manipuri', 'Bodo', 'Dogri', 'Maithili'
];

const WELCOME_MESSAGES: Record<string, string> = {
  'English': 'Hello! I am TN Trust AI. How can I help you register grievances or learn about government services?',
  'Tamil': 'வணக்கம்! நான் TN Trust AI. உங்கள் குறைகளை பதிவு செய்ய அல்லது அரச சேவைகள் பற்றி அறிய நான் எப்படி உதவலாம்?',
  'Hindi': 'नमस्ते! मैं TN Trust AI हूँ। मैं आपकी शिकायतें दर्ज करने या सरकारी सेवाओं के बारे में जानने में कैसे मदद कर सकता हूँ?',
  'Telugu': 'నమస్కారం! నేను TN Trust AI. నేను మీ ఫిర్యాదులను నమోదు చేయడానికి లేదా ప్రభుత్వ సేవల గురించి తెలుసుకోవడానికి ఎలా సహాయపడగలను?',
  'Kannada': 'ನಮಸ್ಕಾರ! ನಾನು TN Trust AI. ದೂರುಗಳನ್ನು ನೋಂದಾಯಿಸಲು ಅಥವಾ ಸರ್ಕಾರಿ ಸೇವೆಗಳ ಬಗ್ಗೆ ತಿಳಿಯಲು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಲ್ಲೆ?'
};

export function GovAI() {
  const [activeTab, setActiveTab] = useState<'chat' | 'classify' | 'sentiment' | 'fraud'>('chat');
  
  // Chat state
  const [chatLanguage, setChatLanguage] = useState('English');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: WELCOME_MESSAGES['English'] }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const msg = WELCOME_MESSAGES[chatLanguage] || `Hello! I am TN Trust AI. I am now speaking in ${chatLanguage}. How can I help?`;
    setChatMessages(prev => {
      // If only the welcome message is present, replace it.
      if (prev.length === 1 && prev[0].role === 'ai') {
        return [{ role: 'ai', text: msg }];
      }
      // Otherwise, append a transition message.
      return [...prev, { role: 'ai', text: msg }];
    });
  }, [chatLanguage]);

  // Fraud state
  const [fraudInput, setFraudInput] = useState('');
  const [fraudResult, setFraudResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Classify state
  const [classifyInput, setClassifyInput] = useState('');
  const [classifyResult, setClassifyResult] = useState<any>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  // Sentiment state
  const [sentimentInput, setSentimentInput] = useState('');
  const [sentimentResult, setSentimentResult] = useState<any>(null);
  const [isAnalyzingSentiment, setIsAnalyzingSentiment] = useState(false);

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

  const handleClassify = async () => {
    if (!classifyInput) return;
    setIsClassifying(true);
    setClassifyResult(null);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setClassifyResult({
        department: 'Public Works Department',
        category: 'Infrastructure',
        confidence: 94
      });
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSentimentAnalysis = async () => {
    if (!sentimentInput) return;
    setIsAnalyzingSentiment(true);
    setSentimentResult(null);
    try {
      await new Promise(r => setTimeout(r, 1500));
      // Simple logic to mock sentiment
      const isPositive = sentimentInput.toLowerCase().includes('good') || sentimentInput.toLowerCase().includes('great') || sentimentInput.toLowerCase().includes('thank');
      setSentimentResult({
        sentiment: isPositive ? 'Positive' : 'Negative',
        emotion: isPositive ? 'Satisfaction' : 'Frustration',
        score: isPositive ? 0.85 : -0.75
      });
    } finally {
      setIsAnalyzingSentiment(false);
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

            {activeTab === 'classify' && (
              <motion.div key="classify" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col">
                <div className="mb-6 border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Text Classifier
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Automatically categorize grievances and route them to the appropriate department.</p>
                </div>
                <div className="space-y-6">
                  <textarea 
                    value={classifyInput}
                    onChange={(e) => setClassifyInput(e.target.value)}
                    placeholder="Enter text to classify..."
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none resize-none"
                  />
                  <button 
                    onClick={handleClassify}
                    disabled={!classifyInput || isClassifying}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isClassifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Classify Text
                  </button>
                  {classifyResult && (
                    <div className="p-6 rounded-2xl border border-blue-200 bg-blue-50 mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-bold text-blue-800 mb-1">Department</p>
                        <p className="text-lg font-bold text-slate-900">{classifyResult.department}</p>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-800 mb-1">Category</p>
                        <p className="text-lg font-bold text-slate-900">{classifyResult.category}</p>
                      </div>
                      <div className="col-span-2 pt-4 border-t border-blue-200">
                        <p className="text-sm font-bold text-blue-800 mb-1">Confidence Score</p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-blue-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${classifyResult.confidence}%` }} />
                          </div>
                          <span className="text-sm font-bold text-blue-700">{classifyResult.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'sentiment' && (
              <motion.div key="sentiment" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="h-full flex flex-col">
                <div className="mb-6 border-b border-slate-100 pb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-blue-600" />
                    Sentiment Analysis
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">Analyze public feedback to gauge citizen satisfaction and emotional response.</p>
                </div>
                <div className="space-y-6">
                  <textarea 
                    value={sentimentInput}
                    onChange={(e) => setSentimentInput(e.target.value)}
                    placeholder="Enter feedback or review..."
                    className="w-full h-32 p-4 rounded-xl border border-slate-200 focus:border-blue-500 outline-none resize-none"
                  />
                  <button 
                    onClick={handleSentimentAnalysis}
                    disabled={!sentimentInput || isAnalyzingSentiment}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isAnalyzingSentiment ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    Analyze Sentiment
                  </button>
                  {sentimentResult && (
                    <div className={`p-6 rounded-2xl border mt-6 ${
                      sentimentResult.sentiment === 'Positive' ? 'border-emerald-200 bg-emerald-50' : 
                      sentimentResult.sentiment === 'Negative' ? 'border-red-200 bg-red-50' : 
                      'border-slate-200 bg-slate-50'
                    }`}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className={`text-sm font-bold mb-1 ${
                            sentimentResult.sentiment === 'Positive' ? 'text-emerald-800' : 
                            sentimentResult.sentiment === 'Negative' ? 'text-red-800' : 
                            'text-slate-800'
                          }`}>Overall Sentiment</p>
                          <p className={`text-2xl font-bold ${
                            sentimentResult.sentiment === 'Positive' ? 'text-emerald-700' : 
                            sentimentResult.sentiment === 'Negative' ? 'text-red-700' : 
                            'text-slate-700'
                          }`}>{sentimentResult.sentiment}</p>
                        </div>
                        <div>
                          <p className={`text-sm font-bold mb-1 ${
                            sentimentResult.sentiment === 'Positive' ? 'text-emerald-800' : 
                            sentimentResult.sentiment === 'Negative' ? 'text-red-800' : 
                            'text-slate-800'
                          }`}>Key Emotion</p>
                          <p className="text-lg font-bold text-slate-900">{sentimentResult.emotion}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
