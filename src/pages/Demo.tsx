import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * /demo route — enters demo mode and redirects to the dashboard.
 * The demo banner is rendered in AppShell when isDemoMode is true.
 */
export default function Demo() {
  const { enterDemoMode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    enterDemoMode();
    navigate('/dashboard', { replace: true });
  }, [enterDemoMode, navigate]);

  return null;
}
