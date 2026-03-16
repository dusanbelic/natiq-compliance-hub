import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { UserProfile, UserRole } from '@/types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  exitDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_PROFILE: UserProfile = {
  id: 'demo-user',
  company_id: 'demo-company',
  full_name: 'Demo User',
  role: 'hr_director',
  language_pref: 'en',
  notification_email: true,
  notification_in_app: true,
  created_at: new Date().toISOString(),
};

async function fetchUserProfile(userId: string): Promise<UserProfile> {
  // Fetch profile and role in parallel
  const [profileRes, roleRes] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', userId).single(),
    supabase.from('user_roles').select('role').eq('user_id', userId).limit(1).single(),
  ]);

  const p = profileRes.data;
  const r = roleRes.data;

  return {
    id: userId,
    company_id: p?.company_id ?? null,
    full_name: p?.full_name ?? 'User',
    role: (r?.role as UserRole) ?? 'hr_manager',
    language_pref: (p?.language_pref as 'en' | 'ar') ?? 'en',
    notification_email: p?.notification_email ?? true,
    notification_in_app: p?.notification_in_app ?? true,
    created_at: p?.created_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem('natiq_demo_mode') === 'true';
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          setIsDemoMode(false);
          localStorage.removeItem('natiq_demo_mode');
          
          // Fetch real profile + role from database
          try {
            const userProfile = await fetchUserProfile(newSession.user.id);
            setProfile(userProfile);
          } catch {
            // Fallback if fetch fails
            setProfile({
              id: newSession.user.id,
              company_id: null,
              full_name: newSession.user.user_metadata?.full_name ?? newSession.user.email?.split('@')[0] ?? 'User',
              role: 'hr_manager',
              language_pref: 'en',
              notification_email: true,
              notification_in_app: true,
              created_at: newSession.user.created_at ?? new Date().toISOString(),
            });
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        try {
          const userProfile = await fetchUserProfile(existingSession.user.id);
          setProfile(userProfile);
        } catch {
          setProfile({
            id: existingSession.user.id,
            company_id: null,
            full_name: existingSession.user.user_metadata?.full_name ?? existingSession.user.email?.split('@')[0] ?? 'User',
            role: 'hr_manager',
            language_pref: 'en',
            notification_email: true,
            notification_in_app: true,
            created_at: existingSession.user.created_at ?? new Date().toISOString(),
          });
        }
      }
      
      // Always finish loading regardless of session state
      if (!isDemoMode) {
        setLoading(false);
      }
    });

    if (isDemoMode) {
      setProfile(DEMO_PROFILE);
      setLoading(false);
    }

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: window.location.origin,
        },
      });
      return { error: error ? new Error(error.message) : null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsDemoMode(false);
    localStorage.removeItem('natiq_demo_mode');
  };

  const enterDemoMode = () => {
    setIsDemoMode(true);
    setProfile(DEMO_PROFILE);
    localStorage.setItem('natiq_demo_mode', 'true');
  };

  const exitDemoMode = () => {
    setIsDemoMode(false);
    setProfile(null);
    localStorage.removeItem('natiq_demo_mode');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        enterDemoMode,
        exitDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
