import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2, Sparkles, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function GovNewIssue() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [aiPreview, setAiPreview] = useState<any>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState('');
  const [error, setError] = useState('');

  const handleAiPreview = async () => {
    if (!title || !description) {
      setError('Please provide a title and description for AI analysis.');
      return;
    }
    setError('');
    setIsLoadingAI(true);
    try {
      // Simulate AI classification
      await new Promise(r => setTimeout(r, 1500));
      setAiPreview({
        category: 'Infrastructure',
        department: 'Public Works Department (PWD)',
        priority: 'High',
        sentiment: 'Frustrated',
        riskScore: 24,
      });
    } catch (err) {
      setError('AI service temporarily unavailable. Please proceed with manual submission.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    setIsSubmitting(true);
    try {
      // Simulate blockchain submission
      await new Promise(r => setTimeout(r, 2000));
      const generatedTx = '0x' + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      setTxId(generatedTx);
    } catch (err) {
      setError('Submission failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (txId) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Grievance Successfully Filed</h2>
          <p className="text-slate-600 mb-8">Your grievance has been securely recorded on the blockchain.</p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Blockchain Transaction ID</p>
            <p className="font-mono text-sm text-slate-700 break-all">{txId}</p>
          </div>
          
          <button 
            onClick={() => navigate('/gov/issues')}
            className="btn-primary px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Return to Issues List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/gov/issues')}
        className="flex items-center text-slate-500 hover:text-slate-700 transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Issues
      </button>

      <div>
        <h2 className="text-2xl font-bold text-slate-900">File New Grievance</h2>
        <p className="text-slate-500">Provide details about the issue. Our AI will automatically route it to the correct department.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Grievance Title</label>
            <input 
              type="text" 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="E.g. Broken streetlights in Sector 4"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
            <textarea 
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
              placeholder="Please provide as much detail as possible..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Location / Address</label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Exact location of the issue"
            />
          </div>

          {/* AI Preview Section */}
          <div className="border-t border-slate-200 pt-6">
            {!aiPreview ? (
              <button
                type="button"
                onClick={handleAiPreview}
                disabled={isLoadingAI}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium disabled:opacity-50"
              >
                {isLoadingAI ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isLoadingAI ? 'Analyzing issue...' : 'Generate AI Preview & Routing'}
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold">
                  <Sparkles className="w-5 h-5" />
                  AI Analysis Complete
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block mb-1">Assigned Department</span>
                    <span className="font-semibold text-slate-900">{aiPreview.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Category</span>
                    <span className="font-semibold text-slate-900">{aiPreview.category}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Priority</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded font-bold text-xs ${
                      aiPreview.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {aiPreview.priority}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Sentiment</span>
                    <span className="font-semibold text-slate-900">{aiPreview.sentiment}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !aiPreview}
              className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Submitting to Blockchain...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Grievance
                </>
              )}
            </button>
          </div>
          
          {!aiPreview && !isSubmitting && (
             <p className="text-xs text-right text-slate-500 mt-2">Please run AI Preview before submitting.</p>
          )}

        </form>
      </div>
    </div>
  );
}
