import React, { createContext, useContext, useState, useEffect, FC, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const DEMO_USERS: Record<UserRole, User> = {
  ADMIN: {
    id: 1,
    email: 'admin@telds.gov',
    full_name: 'Chief Grid Administrator',
    role: 'ADMIN',
    is_active: true,
    created_at: new Date().toISOString()
  },
  ENGINEER: {
    id: 2,
    email: 'engineer@telds.gov',
    full_name: 'Rajesh Kumar (Senior Distribution Engineer)',
    role: 'ENGINEER',
    is_active: true,
    created_at: new Date().toISOString()
  },
  OPERATOR: {
    id: 3,
    email: 'operator@telds.gov',
    full_name: 'Priya Sharma (Substation Operator)',
    role: 'OPERATOR',
    is_active: true,
    created_at: new Date().toISOString()
  },
  FIELD_INSPECTOR: {
    id: 4,
    email: 'inspector@telds.gov',
    full_name: 'Amit Patel (Field Inspection Lead)',
    role: 'FIELD_INSPECTOR',
    is_active: true,
    created_at: new Date().toISOString()
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(DEMO_USERS.ENGINEER);
  const [token, setToken] = useState<string | null>(localStorage.getItem('telds_token') || 'demo-jwt-token');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const savedRole = localStorage.getItem('telds_demo_role') as UserRole;
    if (savedRole && DEMO_USERS[savedRole]) {
      setUser(DEMO_USERS[savedRole]);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const data = await api.login(email, pass);
      localStorage.setItem('telds_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } catch {
      // Fallback for demo testing
      const matched = Object.values(DEMO_USERS).find(u => u.email === email) || DEMO_USERS.ENGINEER;
      setUser(matched);
      setToken('demo-token');
      localStorage.setItem('telds_token', 'demo-token');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('telds_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoRole = (role: UserRole) => {
    const newUser = DEMO_USERS[role];
    setUser(newUser);
    localStorage.setItem('telds_demo_role', role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      switchDemoRole,
      isAuthenticated: !!user,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
