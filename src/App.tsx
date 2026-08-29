import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { ProtectedView } from './pages/ProtectedView';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<'dashboard' | 'history' | 'security'>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF8F5] text-stone-700 font-sans">
        <div className="w-10 h-10 rounded-2xl bg-stone-900 flex items-center justify-center text-amber-100 shadow-xs mb-4">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <span className="text-sm font-sans font-medium text-stone-600">
          Verifying security credentials...
        </span>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onNavigateToDashboard={() => setCurrentRoute('dashboard')} />;
  }

  return (
    <ProtectedView
      currentRoute={currentRoute}
      onNavigate={(route) => setCurrentRoute(route)}
    />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
