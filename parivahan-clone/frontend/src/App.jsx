import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DrivingLicense from './pages/DrivingLicense.jsx';
import VehicleRegistration from './pages/VehicleRegistration.jsx';
import ApplicationStatus from './pages/ApplicationStatus.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import TrustGovPopup from './components/TrustGovPopup.jsx';

// ─── Auth Context ─────────────────────────────────────────────
export const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('parivahanUser')); }
    catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('parivahanToken'));

  // Memoize callbacks so they don't change on every render
  const login = useCallback((userData, tok) => {
    setUser(userData);
    setToken(tok);
    localStorage.setItem('parivahanUser', JSON.stringify(userData));
    localStorage.setItem('parivahanToken', tok);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('parivahanUser');
    localStorage.removeItem('parivahanToken');
  }, []);

  // Memoize the context value so consumers only re-render when user/token actually changes
  const value = useMemo(
    () => ({ user, token, login, logout, isAuthenticated: !!user }),
    [user, token, login, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Protected Route ──────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// ─── App ──────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <TrustGovPopup />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/"                     element={<Home />} />
              <Route path="/login"                element={<Login />} />
              <Route path="/application-status"   element={<ApplicationStatus />} />
              <Route path="/dashboard"            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/driving-license"      element={<ProtectedRoute><DrivingLicense /></ProtectedRoute>} />
              <Route path="/vehicle-registration" element={<ProtectedRoute><VehicleRegistration /></ProtectedRoute>} />
              <Route path="*"                     element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
