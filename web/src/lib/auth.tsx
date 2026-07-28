// AMBOT 365 - Admin session state
//
// This tracks only *whether* the visitor is signed in. The session itself is an
// httpOnly cookie the browser attaches automatically and JavaScript cannot
// read, so there is no token to store here — which is precisely what keeps an
// XSS bug from being able to steal it.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as api from './api';

type AuthState = {
  authenticated: boolean;
  /** True until the initial session check finishes, so guards don't flash the login page. */
  loading: boolean;
  signIn: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .me()
      .then((result) => {
        if (!cancelled) setAuthenticated(result.authenticated);
      })
      .catch(() => {
        if (!cancelled) setAuthenticated(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (password: string) => {
    await api.login(password);
    setAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      // Clear local state even if the request failed — the user asked to leave.
      setAuthenticated(false);
    }
  }, []);

  const value = useMemo(
    () => ({ authenticated, loading, signIn, signOut }),
    [authenticated, loading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}
