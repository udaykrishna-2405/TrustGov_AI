import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/UI';
import Header from './components/Header';
import Footer from './components/Footer';
import { LoginModal, RegisterModal } from './components/AuthModals';
import TrustGovPopup from './components/TrustGovPopup';

import Home from './pages/Home';
import ApplyForm from './pages/ApplyForm';
import Appointment from './pages/Appointment';
import { Track, Dashboard } from './pages/TrackAndDashboard';
import { Offices, FAQ, DocAdvisor, FeeCalculator, Grievance, PhotoGuidelines, Contact } from './pages/OtherPages';

function AppInner() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);

  return (
    <>
      <TrustGovPopup />
      <Header
        onLoginClick={() => setLoginOpen(true)}
        onRegisterClick={() => setRegisterOpen(true)}
      />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/apply/:type" element={<ApplyForm />} />
          <Route path="/track" element={<Track />} />
          <Route path="/appointment" element={<Appointment />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/offices" element={<Offices />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/doc-advisor" element={<DocAdvisor />} />
          <Route path="/fee-calculator" element={<FeeCalculator />} />
          <Route path="/grievance" element={<Grievance />} />
          <Route path="/photo-guidelines" element={<PhotoGuidelines />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchRegister={() => { setLoginOpen(false); setRegisterOpen(true); }}
      />
      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onSwitchLogin={() => { setRegisterOpen(false); setLoginOpen(true); }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppInner />
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
