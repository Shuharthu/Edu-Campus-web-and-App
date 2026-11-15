'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SmartEduApiClient } from '@smart-edu/api-client';
import type { RoleTier } from '@smart-edu/types';

export interface MeResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    preferredLocale: string;
    mfaEnabled: boolean;
    lastLoginAt: string | null;
  };
  institution: {
    id: string;
    name: string;
    shortName: string;
    domain: string;
    supportEmail: string;
    defaultCurrency: string;
    timezone: string;
  };
  activeContext: {
    assignmentId: string;
    roleId: string;
    roleSlug: string;
    roleTier: RoleTier;
    campusId: string | null;
    departmentCode: string | null;
    programCode: string | null;
    scopeType: string;
    isActing: boolean;
    isPreview: boolean;
  };
  permissions: Array<{
    module: string;
    action: string;
    scopeLevel: string;
  }>;
  assignments: Array<{
    id: string;
    roleId: string;
    roleSlug: string;
    roleName: string;
    roleTier: RoleTier;
    scopeType: string;
    departmentCode: string | null;
    programCode: string | null;
    isActing: boolean;
    validTo: string | null;
    campus: { id: string; code: string; name: string } | null;
  }>;
}

interface AuthContextValue {
  api: SmartEduApiClient;
  token: string | null;
  me: MeResponse | null;
  isLoading: boolean;
  wsConnected: boolean;
  lastWsEventAt: string | null;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setSessionTokens: (accessToken: string, refreshToken?: string) => Promise<MeResponse | null>;
  refreshMe: () => Promise<MeResponse | null>;
  switchRole: (assignmentId: string) => Promise<void>;
  startPreview: (roleId: string) => Promise<void>;
  exitPreview: () => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:4000/ws';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastWsEventAt, setLastWsEventAt] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const tokenRef = React.useRef<string | null>(null);
  tokenRef.current = token;

  const api = useMemo(
    () =>
      new SmartEduApiClient({
        baseUrl: API_BASE,
        getToken: () => tokenRef.current,
      }),
    [],
  );

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('smartedu_theme');
    const resolved = savedTheme === 'light' ? 'light' : 'dark';
    setTheme(resolved);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem('smartedu_theme', next);
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  const refreshMe = useCallback(async () => {
    if (!tokenRef.current) {
      setMe(null);
      return null;
    }
    try {
      const data = await api.authMe<MeResponse>();
      setMe(data);
      return data;
    } catch {
      window.localStorage.removeItem('smartedu_access_token');
      window.localStorage.removeItem('smartedu_refresh_token');
      if (typeof document !== 'undefined') {
        document.cookie = 'se_access_token=; path=/; max-age=0; SameSite=Lax';
      }
      tokenRef.current = null;
      setToken(null);
      setMe(null);
      return null;
    }
  }, [api]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryToken = urlParams.get('token');
    if (queryToken) {
      window.localStorage.setItem('smartedu_access_token', queryToken);
    }

    const saved = queryToken || window.localStorage.getItem('smartedu_access_token');
    if (!saved) {
      setIsLoading(false);
      return;
    }
    tokenRef.current = saved;
    setToken(saved);
    refreshMe().finally(() => setIsLoading(false));
  }, [refreshMe]);

  useEffect(() => {
    if (!token) {
      setWsConnected(false);
      return;
    }
    let ws: WebSocket | null = null;
    let alive = true;
    try {
      ws = new WebSocket(`${WS_BASE}?token=${encodeURIComponent(token)}`);
      ws.onopen = () => {
        if (alive) setWsConnected(true);
      };
      ws.onmessage = () => {
        if (alive) setLastWsEventAt(new Date().toISOString());
      };
      ws.onclose = () => {
        if (alive) setWsConnected(false);
      };
      ws.onerror = () => {
        if (alive) setWsConnected(false);
      };
    } catch {
      setWsConnected(false);
    }
    return () => {
      alive = false;
      ws?.close();
    };
  }, [token]);

  const setSessionTokens = useCallback(
    async (accessToken: string, refreshToken?: string) => {
      window.localStorage.setItem('smartedu_access_token', accessToken);
      if (typeof document !== 'undefined') {
        document.cookie = `se_access_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
      }
      if (refreshToken) {
        window.localStorage.setItem('smartedu_refresh_token', refreshToken);
      }
      tokenRef.current = accessToken;
      setToken(accessToken);
      return refreshMe();
    },
    [refreshMe],
  );

  const switchRole = useCallback(
    async (assignmentId: string) => {
      const res = await api.authSwitchRole<{ accessToken: string }>({ assignmentId });
      await setSessionTokens(res.accessToken);
    },
    [api, setSessionTokens],
  );

  const startPreview = useCallback(
    async (roleId: string) => {
      const res = await api.authPreviewRole<{ accessToken: string }>({ roleId });
      await setSessionTokens(res.accessToken);
    },
    [api, setSessionTokens],
  );

  const exitPreview = useCallback(async () => {
    const res = await api.authExitPreview<{ accessToken: string }>();
    await setSessionTokens(res.accessToken);
  }, [api, setSessionTokens]);

  const signOut = useCallback(async () => {
    try {
      await api.authLogout();
    } catch {
      // Ignore if session already expired
    }
    window.localStorage.removeItem('smartedu_access_token');
    window.localStorage.removeItem('smartedu_refresh_token');
    if (typeof document !== 'undefined') {
      document.cookie = 'se_access_token=; path=/; max-age=0; SameSite=Lax';
    }
    tokenRef.current = null;
    setToken(null);
    setMe(null);
  }, [api]);

  const hasPermission = useCallback(
    (module: string, action: string) => {
      if (!me) return false;
      if (me.activeContext.roleTier === 'SUPER_ADMIN') return true;
      return me.permissions.some((p) => p.module === module && p.action === action);
    },
    [me],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      api,
      token,
      me,
      isLoading,
      wsConnected,
      lastWsEventAt,
      theme,
      toggleTheme,
      setSessionTokens,
      refreshMe,
      switchRole,
      startPreview,
      exitPreview,
      signOut,
      hasPermission,
    }),
    [
      api,
      token,
      me,
      isLoading,
      wsConnected,
      lastWsEventAt,
      theme,
      toggleTheme,
      setSessionTokens,
      refreshMe,
      switchRole,
      startPreview,
      exitPreview,
      signOut,
      hasPermission,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
