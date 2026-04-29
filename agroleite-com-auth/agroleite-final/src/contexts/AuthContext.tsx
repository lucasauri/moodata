import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppUser } from '../types';
import { logout as authLogout, getCurrentUser } from '../auth';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: (userData: AppUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Na inicialização, verificamos se há um usuário válido
    const checkUser = async () => {
      try {
        const currentUser = getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Erro ao recuperar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = (userData: AppUser) => {
    setUser(userData);
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
