import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { useCartStore } from '@/store/useCartStore';
import { authService } from '@/services/auth.service';
import { toApiError } from '@/services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const session = isSignUp
        ? await authService.registerAndLogin({ fullname: name, email, password })
        : await authService.login({ email, password });

      login(session.user, session.token);
      // Push the guest bag to the server and load the authoritative cart.
      void useCartStore.getState().syncOnAuth();
      toast.success(isSignUp ? 'Account created successfully!' : 'Welcome back!');
      onClose();
      setEmail(''); setPassword(''); setName('');
    } catch (err) {
      setError(toApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 text-primary mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">
            {isSignUp ? t('auth.signup_title') : t('auth.login_title')}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isSignUp ? t('auth.signup_sub') : t('auth.login_sub')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p role="alert" className="text-xs font-medium text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                {t('auth.name')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-9 pr-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {t('auth.email')}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-muted/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-primary/20 mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSignUp ? t('auth.submit_signup') : t('auth.submit_login')}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          {isSignUp ? t('auth.already_have_account') : t('auth.dont_have_account')}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-primary hover:underline ml-1"
          >
            {isSignUp ? t('auth.submit_login') : t('auth.submit_signup')}
          </button>
        </div>
      </div>
    </div>
  );
};
