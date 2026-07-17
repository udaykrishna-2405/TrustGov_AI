/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Core Pages
import { ModeSelectorPage } from './pages/ModeSelectorPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { WorkspaceSetupPage } from './pages/WorkspaceSetupPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { SecurityPage } from './pages/SecurityPage';
import { DevelopersPage } from './pages/DevelopersPage';
import { AboutPage } from './pages/AboutPage';
import { BlockchainExplorer } from './pages/BlockchainExplorer';
import { AIFeaturesPage } from './pages/AIFeaturesPage';
import { SecurityAlertBanner } from './components/SecurityAlertBanner';

// Modules: Government
import { GovernmentLayout } from './modules/government/layouts/GovernmentLayout';
import { GovDashboard } from './modules/government/pages/GovDashboard';
import { GovServicesHub } from './modules/government/pages/GovServicesHub';
import { GovSessionHistory } from './modules/government/pages/GovSessionHistory';
import { GovComplaints } from './modules/government/pages/GovComplaints';
import { GovProjects } from './modules/government/pages/GovProjects';
import { GovFunds } from './modules/government/pages/GovFunds';
import { GovDepartments } from './modules/government/pages/GovDepartments';
import { GovIssues } from './modules/government/pages/GovIssues';
import { GovNewIssue } from './modules/government/pages/GovNewIssue';
import { GovOfficer } from './modules/government/pages/GovOfficer';
import { GovCollector } from './modules/government/pages/GovCollector';
import { GovMinister } from './modules/government/pages/GovMinister';
import { GovAI } from './modules/government/pages/GovAI';
import { GovSecurity } from './modules/government/pages/GovSecurity';



const FULLSCREEN_PATHS = ['/', '/setup', '/login', '/register'];

const ProtectedRoute = ({ children, requiredMode }: { children: React.ReactNode, requiredMode?: string }) => {
  const { user, isLoading, workspaceType } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  // If user is trying to access a mode they don't have, redirect them to their actual mode
  if (requiredMode && workspaceType !== requiredMode) {
    if (workspaceType === 'government') return <Navigate to="/gov/dashboard" replace />;
    if (workspaceType === 'corporate') return <Navigate to="/corp/dashboard" replace />;
    if (workspaceType === 'industry') return <Navigate to="/industry/dashboard" replace />;
    return <Navigate to="/" replace />; // Fallback
  }
  
  return <>{children}</>;
};

// Component to handle dynamic routing for the legacy /dashboard route
const DynamicDashboardRouter = () => {
  const { user, isLoading, workspaceType } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  if (workspaceType === 'government') return <Navigate to="/gov/dashboard" replace />;
  if (workspaceType === 'corporate') return <Navigate to="/corp/dashboard" replace />;
  if (workspaceType === 'industry') return <Navigate to="/industry/dashboard" replace />;
  return <Navigate to="/" replace />;
};

function AppContent() {
  const pathname = window.location.pathname;
  // Dynamic fullscreen check
  const isFullscreen = FULLSCREEN_PATHS.includes(pathname) || pathname.startsWith('/gov');

  return (
    <div className="flex flex-col min-h-screen">
      {!isFullscreen && <SecurityAlertBanner />}
      {!isFullscreen && <Navbar />}

      <main className={isFullscreen ? '' : 'flex-grow'}>
        <Routes>
          {/* ── Platform entry ── */}
          <Route path="/"       element={<ModeSelectorPage />} />
          <Route path="/setup"  element={<WorkspaceSetupPage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Public info pages ── */}
          <Route path="/architecture" element={<ArchitecturePage />} />
          <Route path="/security"     element={<SecurityPage />} />
          <Route path="/blockchain"   element={<BlockchainExplorer />} />
          <Route path="/developers"   element={<DevelopersPage />} />
          <Route path="/about"        element={<AboutPage />} />
          <Route path="/ai-features"  element={<AIFeaturesPage />} />

          {/* ── Legacy Dashboard Redirect ── */}
          <Route path="/dashboard" element={<DynamicDashboardRouter />} />

          {/* ── Government Workspace ── */}
          <Route path="/gov" element={
            <ProtectedRoute requiredMode="government">
              <GovernmentLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<GovDashboard />} />
            <Route path="services" element={<GovServicesHub />} />
            <Route path="session-history" element={<GovSessionHistory />} />
            <Route path="complaints" element={<GovComplaints />} />
            <Route path="projects" element={<GovProjects />} />
            <Route path="funds" element={<GovFunds />} />
            <Route path="departments" element={<GovDepartments />} />
            <Route path="issues" element={<GovIssues />} />
            <Route path="issues/new" element={<GovNewIssue />} />
            <Route path="officer" element={<GovOfficer />} />
            <Route path="collector" element={<GovCollector />} />
            <Route path="minister" element={<GovMinister />} />
            <Route path="ai" element={<GovAI />} />
            <Route path="security" element={<GovSecurity />} />
          </Route>

          {/* ── Redirect Corporate and Industry to Government ── */}
          <Route path="/corp/*" element={<Navigate to="/gov/dashboard" replace />} />
          <Route path="/industry/*" element={<Navigate to="/gov/dashboard" replace />} />
          <Route path="/enterprise/*" element={<Navigate to="/gov/dashboard" replace />} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isFullscreen && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
