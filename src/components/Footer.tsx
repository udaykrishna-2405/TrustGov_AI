import React from 'react';
import { Shield, Github, Twitter, Linkedin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-white border-t border-border pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          <div className="md:col-span-5">
            <Link to="/" className="flex items-center space-x-3 mb-8 group">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-text-main">
                AI TrustOS
              </span>
            </Link>
            <p className="text-text-muted max-w-sm mb-10 leading-relaxed font-light">
              AI TrustOS is a unified AI &amp; blockchain-powered transparency platform for government, enterprise, and industrial organizations. Intelligent Transparency. For Every Institution.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-text-muted hover:text-brand hover:bg-brand/5 transition-all duration-300"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-text-muted hover:text-brand hover:bg-brand/5 transition-all duration-300"><Github className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-text-muted hover:text-brand hover:bg-brand/5 transition-all duration-300"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-main mb-8">Platform</h4>
            <ul className="space-y-4 text-[13px] font-medium text-text-muted">
              <li><Link to="/#features" className="hover:text-brand transition-colors">Features</Link></li>
              <li><Link to="/architecture" className="hover:text-brand transition-colors">Architecture</Link></li>
              <li><Link to="/security" className="hover:text-brand transition-colors">Security Model</Link></li>
              <li><Link to="/developers" className="hover:text-brand transition-colors">API Docs</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-main mb-8">Resources</h4>
            <ul className="space-y-4 text-[13px] font-medium text-text-muted">
              <li><Link to="/about" className="hover:text-brand transition-colors">About Project</Link></li>
              <li><a href="#" className="hover:text-brand transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand transition-colors">Contact Support</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-main mb-8">Newsletter</h4>
            <p className="text-[13px] text-text-muted mb-6 font-light">Stay updated with national security updates.</p>
            <div className="relative">
              <input type="email" placeholder="Email address" className="input-field pr-12 text-sm" />
              <button className="absolute right-2 top-2 bottom-2 px-3 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-10 flex flex-col md:flex-row justify-between items-center text-[11px] uppercase tracking-widest font-bold text-text-muted">
          <p>© 2026 AI TrustOS. Intelligent Transparency Platform.</p>
          <div className="flex space-x-8 mt-6 md:mt-0">
            <p>Secure Digital Government</p>
            <p>Zero Trust Verified</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
