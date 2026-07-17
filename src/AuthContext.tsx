import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from './services/authService';

export interface Workspace {
  id: string;
  name: string;
  type: 'government' | 'corporate' | 'industry';
  logo_url?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  workspace_id: string;
  department_id?: string;
  last_login?: string;
  workspace?: Workspace;
}

interface LoginParams {
  email: string;
  password: string;
  workspaceId?: string;
}

interface RegisterParams {
  workspaceId: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  workspaceType: 'government' | 'corporate' | 'industry' | null;
  login: (params: LoginParams) => Promise<{ success: boolean; message?: string }>;
  register: (params: RegisterParams) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const workspaceType = (user?.workspace?.type ?? null) as 'government' | 'corporate' | 'industry' | null;

  const getCurrentUser = async (): Promise<User | null> => {
    if (authService.isAuthenticated()) {
      return authService.getCurrentUser();
    }

    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const res = await fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  };

  const bootstrapSession = async () => {
    try {
      let currentUser = await getCurrentUser();
      if (!currentUser) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshed = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (refreshed.ok) {
            const data = await refreshed.json();
            localStorage.setItem('accessToken', data.accessToken);
            currentUser = await getCurrentUser();
          }
        }
      }

      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('Session bootstrap failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrapSession();
  }, []);

  const login = async ({ email, password, workspaceId }: LoginParams) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, workspaceId }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Login failed' };
      }
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const register = async (params: RegisterParams) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Registration failed' };
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    await authService.logout();

    const refreshToken = localStorage.getItem('refreshToken');
    const token = localStorage.getItem('accessToken');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, workspaceType, login, register, logout, isLoading }}>
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
