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
  const [updateTrigger, setUpdateTrigger] = useState(0); // Trigger para forçar re-render

  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true);
      try {
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
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Listener para mudanças no localStorage (login/logout em outras abas)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' || e.key === 'user_data') {
        console.log('🔄 AuthProvider - Detectada mudança no localStorage:', e.key);
        loadUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup: parar verificação quando o componente for desmontado
    return () => {
      authService.stopTokenValidation();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateTrigger]); // Adicionar updateTrigger como dependência

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
      
      // Atualizar estado imediatamente
      setUser(userData);
      
      // Iniciar verificação periódica do token após login
      authService.startTokenValidation();

      // Forçar re-render de todos os componentes dependentes
      setUpdateTrigger(prev => prev + 1);
      
      // Disparar evento customizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { type: 'login', user: userData } 
      }));
      
      // Aguardar um pouco para garantir que o estado seja propagado
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log('✅ AuthProvider - Login realizado com sucesso:', userData.email);
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
      
      // Atualizar estado imediatamente
      setUser(newUser);
      
      // Iniciar verificação periódica do token após registro
      authService.startTokenValidation();

      // Forçar re-render de todos os componentes dependentes
      setUpdateTrigger(prev => prev + 1);
      
      // Disparar evento customizado para notificar outros componentes
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { type: 'register', user: newUser } 
      }));
      
      // Aguardar um pouco para garantir que o estado seja propagado
      await new Promise(resolve => setTimeout(resolve, 50));
      
      console.log('✅ AuthProvider - Registro realizado com sucesso:', newUser.email);
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
    setUpdateTrigger(prev => prev + 1);
    
    // Disparar evento customizado para notificar outros componentes
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { type: 'logout', user: null } 
    }));
    
    console.log('✅ AuthProvider - Logout realizado');
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
