import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Check } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { enterDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info('Coming soon! Email sign-in will be available shortly.');
  };

  const handleGoogleSignIn = () => {
    toast.info('Coming soon! Google sign-in will be available shortly.');
  };

  const handleDemoMode = () => {
    enterDemoMode();
    toast.success('Welcome to NatIQ Demo!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[60%] bg-secondary p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 rounded-full border-2 border-white" />
          <div className="absolute bottom-20 right-20 w-64 h-64 rounded-full border-2 border-white" />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-jetbrains font-bold text-xl">N</span>
            </div>
            <span className="text-white font-sora font-bold text-4xl tracking-tight">NatIQ</span>
          </Link>

          {/* Tagline */}
          <h1 className="text-white font-sora font-bold text-5xl leading-tight mb-6">
            Nationalization compliance,<br />simplified.
          </h1>

          {/* Benefits */}
          <div className="space-y-4 mt-12">
            {[
              'Real-time compliance tracking across all GCC countries',
              'AI-powered forecasting — know your risk 90 days ahead',
              'Actionable recommendations, not just alerts',
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-white/90 text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-white/60 text-sm">
          Trusted by 500+ companies across Saudi Arabia, UAE, Qatar & Oman
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-card">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-jetbrains font-bold text-lg">N</span>
            </div>
            <span className="text-foreground font-sora font-bold text-2xl">NatIQ</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="font-sora font-bold text-2xl text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => toast.info('Coming soon! Password reset will be available shortly.')}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Google SSO */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {googleLoading ? 'Connecting...' : 'Sign in with Google'}
          </Button>

          {/* Demo Mode Button */}
          <Button variant="outline" className="w-full" onClick={handleDemoMode}>
            <span className="mr-2">🚀</span>
            Explore Demo
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={() => toast.info('Coming soon! Sign-up will be available shortly.')}
              className="text-primary hover:underline font-medium"
            >
              Start free trial →
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
