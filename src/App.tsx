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

// Modules: Corporate
import { CorporateLayout } from './modules/corporate/layouts/CorporateLayout';
import { CorpDashboard } from './modules/corporate/pages/CorpDashboard';
import { CorpHR } from './modules/corporate/pages/CorpHR';
import { CorpProjects } from './modules/corporate/pages/CorpProjects';
import { CorpTeams } from './modules/corporate/pages/CorpTeams';
import { CorpCompliance } from './modules/corporate/pages/CorpCompliance';
import { CorpAssets } from './modules/corporate/pages/CorpAssets';

// Modules: Industry
import { IndustryLayout } from './modules/industry/layouts/IndustryLayout';
import { IndustryDashboard } from './modules/industry/pages/IndustryDashboard';
import { IndustryProduction } from './modules/industry/pages/IndustryProduction';
import { IndustryMachines } from './modules/industry/pages/IndustryMachines';
import { IndustryInventory } from './modules/industry/pages/IndustryInventory';
import { IndustryQuality } from './modules/industry/pages/IndustryQuality';
import { IndustryMaintenance } from './modules/industry/pages/IndustryMaintenance';

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
  const isFullscreen = FULLSCREEN_PATHS.includes(pathname) || pathname.startsWith('/gov') || pathname.startsWith('/corp') || pathname.startsWith('/industry');

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
          </Route>

          {/* ── Corporate Workspace ── */}
          <Route path="/corp" element={
            <ProtectedRoute requiredMode="corporate">
              <CorporateLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<CorpDashboard />} />
            <Route path="hr" element={<CorpHR />} />
            <Route path="projects" element={<CorpProjects />} />
            <Route path="teams" element={<CorpTeams />} />
            <Route path="compliance" element={<CorpCompliance />} />
            <Route path="assets" element={<CorpAssets />} />
          </Route>

          {/* ── Industry Workspace ── */}
          <Route path="/industry" element={
            <ProtectedRoute requiredMode="industry">
              <IndustryLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<IndustryDashboard />} />
            <Route path="production" element={<IndustryProduction />} />
            <Route path="machines" element={<IndustryMachines />} />
            <Route path="inventory" element={<IndustryInventory />} />
            <Route path="quality" element={<IndustryQuality />} />
            <Route path="maintenance" element={<IndustryMaintenance />} />
          </Route>

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
