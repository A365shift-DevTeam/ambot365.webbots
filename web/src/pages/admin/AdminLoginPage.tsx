import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { BRAND } from '@/lib/constants';
import { useAuth } from '@/lib/auth';
import { usePageTitle } from '@/lib/usePageTitle';

export default function AdminLoginPage() {
  usePageTitle('Admin Login');

  const navigate = useNavigate();
  const location = useLocation();
  const { authenticated, loading: checkingSession, signIn } = useAuth();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Where the guard bounced them from, so they land back there after signing in.
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/admin';

  if (!checkingSession && authenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Incorrect password');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-brand-50/30 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt={BRAND.name} className="h-10 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Panel</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage bots and demo sites.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5"
        >
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold shadow-md hover:shadow-lg hover:from-brand-600 hover:to-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
