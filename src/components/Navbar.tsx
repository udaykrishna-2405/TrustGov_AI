import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'Architecture', path: '/architecture' },
    { name: 'Security', path: '/security' },
    { name: 'Blockchain', path: '/blockchain' },
    { name: 'AI Features', path: '/ai-features' },
    { name: 'Developers', path: '/developers' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-text-main">
              AI TrustOS
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "text-[13px] font-bold uppercase tracking-widest transition-all hover:text-brand",
                  location.pathname === item.path ? "text-brand" : "text-text-muted"
                )}
              >
                {item.name}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center space-x-6 ml-6 pl-6 border-l border-border">
                <Link to="/dashboard" className="flex items-center space-x-2 text-sm font-bold text-brand hover:opacity-80 transition-opacity">
                  <User className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-text-muted hover:text-error transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-primary py-2.5 px-6 text-sm"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-text-muted hover:text-text-main"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-white/5 py-4 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-base font-medium text-text-muted hover:text-brand hover:bg-brand/5 rounded-md"
            >
              {item.name}
            </Link>
          ))}
          {user ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 text-base font-medium text-brand hover:bg-brand/5 rounded-md"
              >
                Dashboard
              </Link>
              <button
                onClick={() => { logout(); setIsOpen(false); }}
                className="w-full text-left px-3 py-2 text-base font-medium text-error hover:bg-white/5 rounded-md"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-base font-medium bg-brand text-white rounded-md text-center"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
