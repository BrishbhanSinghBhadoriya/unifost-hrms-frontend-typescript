"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from './auth';
import { User } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (partial: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('AuthContext: login called with:', { username, password });
    const result = await authService.login(username, password);
    console.log('AuthContext: authService result:', result);
    
    if (result.success && result.user) {
      console.log('AuthContext: Setting user:', result.user);
      setUser(result.user);
      return true;
    }
    console.log('AuthContext: Login failed');
    return false;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev: User | null) => {
      const next = prev ? { ...prev, ...partial } : (partial as User);
      try {
        localStorage.setItem('user', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
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
