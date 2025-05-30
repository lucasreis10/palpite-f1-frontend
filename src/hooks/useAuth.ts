'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { authService, User, LoginRequest, RegisterRequest } from './../services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    
    // Verificar se o token ainda está válido
    if (currentUser && authService.isTokenValid()) {
      setUser(currentUser);
      
      // Iniciar verificação periódica do token
      authService.startTokenValidation();
    } else if (currentUser) {
      // Token inválido ou expirado, fazer logout
      authService.logout();
      setUser(null);
    }
    
    setIsLoading(false);

    // Cleanup: parar verificação quando o componente for desmontado
    return () => {
      authService.stopTokenValidation();
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      const userData: User = {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
      };
      setUser(userData);
      
      // Iniciar verificação periódica do token após login
      authService.startTokenValidation();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      const newUser: User = {
        id: response.id,
        name: response.name,
        email: response.email,
        role: response.role,
      };
      setUser(newUser);
      
      // Iniciar verificação periódica do token após registro
      authService.startTokenValidation();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Parar verificação periódica antes do logout
    authService.stopTokenValidation();
    authService.logout();
    setUser(null);
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && authService.isTokenValid(),
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
