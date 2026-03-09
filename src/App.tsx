import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { EntityProvider } from '@/contexts/EntityContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/hooks/use-theme';
import { AppShell } from '@/components/layout/AppShell';
import { AIAssistant } from '@/components/ai/AIAssistant';

// Pages
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Compliance from '@/pages/Compliance';
import Forecast from '@/pages/Forecast';
import Recommendations from '@/pages/Recommendations';
import Employees from '@/pages/Employees';
import Regulatory from '@/pages/Regulatory';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Onboarding from '@/pages/Onboarding';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isDemoMode } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center animate-pulse">
            <span className="text-primary-foreground font-jetbrains font-bold text-lg">N</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !isDemoMode) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Onboarding guard — redirects to /onboarding if user has no entities
function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { user, isDemoMode } = useAuth();
  const [checked, setChecked] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (isDemoMode) { setChecked(true); return; }
    if (!user) { setChecked(true); return; }

    supabase
      .from('entities')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => {
        setNeedsOnboarding((count ?? 0) === 0);
        setChecked(true);
      });
  }, [user, isDemoMode]);

  if (!checked) return null;
  if (needsOnboarding && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
}

// App Routes Component
function AppRoutes() {
  const { user, isDemoMode } = useAuth();

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          user || isDemoMode ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="/signup" element={
          user || isDemoMode ? <Navigate to="/dashboard" replace /> : <Signup />
        } />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes with app shell */}
        <Route element={
          <ProtectedRoute>
            <EntityProvider>
              <AppShell />
            </EntityProvider>
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/forecast" element={<Forecast />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/regulatory" element={<Regulatory />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings/*" element={<Settings />} />
        </Route>

        {/* Onboarding (protected but without app shell) */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <EntityProvider>
              <Onboarding />
            </EntityProvider>
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* AI Assistant - shown on protected routes */}
      {(user || isDemoMode) && <AIAssistant />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LanguageProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
