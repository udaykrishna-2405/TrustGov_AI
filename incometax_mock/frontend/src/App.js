import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import TrustGovPopup from './components/TrustGovPopup';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FileReturn from './pages/FileReturn';
import TaxCalculator from './pages/TaxCalculator';
import RefundStatus from './pages/RefundStatus';
import MyReturns from './pages/MyReturns';
import Profile from './pages/Profile';
import PayTax from './pages/PayTax';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  return (
    <div className="app">
      <TrustGovPopup />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tax-calculator" element={<TaxCalculator />} />
          <Route path="/refund-status" element={<RefundStatus />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/file-return" element={<ProtectedRoute><FileReturn /></ProtectedRoute>} />
          <Route path="/my-returns" element={<ProtectedRoute><MyReturns /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/pay-tax" element={<ProtectedRoute><PayTax /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
