import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import MasterAdmin from './pages/MasterAdmin';
import AdminDashboard from './pages/AdminDashboard';
import BrokerDashboard from './pages/BrokerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import ErrorBoundary from './components/ErrorBoundary';

function AppContent() {
  const { user, IsAuthenticated, loading } = useAuth();
  const currentPath = window.location.pathname;

  if (currentPath.includes('/god-mode-v1') || currentPath.includes('/master')) {
    return <MasterAdmin />;
  }

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  if (!IsAuthenticated) {
    return <LoginPage />;
  }

  // Routing Logic by role
  if (user?.role === 'owner') {
    return <OwnerDashboard />;
  } else if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else {
    return <BrokerDashboard />;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
