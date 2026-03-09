import { useState, useEffect, lazy, Suspense } from 'react';
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

// Eager-load critical pages
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Landing from '@/pages/Landing';

// Lazy-load everything else
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Compliance = lazy(() => import('@/pages/Compliance'));
const Forecast = lazy(() => import('@/pages/Forecast'));
const Recommendations = lazy(() => import('@/pages/Recommendations'));
const Employees = lazy(() => import('@/pages/Employees'));
const Regulatory = lazy(() => import('@/pages/Regulatory'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));
const Onboarding = lazy(() => import('@/pages/Onboarding'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const AIAssistant = lazy(() => import('@/components/ai/AIAssistant').then(m => ({ default: m.AIAssistant })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min
      gcTime: 10 * 60 * 1000, // 10 min
    },
  },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center animate-pulse">
        <span className="text-primary-foreground font-jetbrains font-bold text-xs">N</span>
      </div>
    </div>
  );
}

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
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={
          user || isDemoMode ? <Navigate to="/dashboard" replace /> : <Landing />
        } />

        {/* Auth routes */}
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
              <OnboardingGuard>
                <AppShell />
              </OnboardingGuard>
            </EntityProvider>
          </ProtectedRoute>
        }>
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
    </Suspense>
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
