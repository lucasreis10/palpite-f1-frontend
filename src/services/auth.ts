import { API_URLS } from '../config/api';
import { showWarningToast } from '../utils/notifications';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  id: number;
  token: string;
  name: string;
  email: string;
  role: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

class AuthService {
  private readonly baseUrl = API_URLS.AUTH;

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao fazer login');
    }

    const data = await response.json();
    
    // Salvar token no localStorage e cookie
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      }));
      
      // Salvar também em cookie para o middleware
      document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }

    return data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Erro ao criar conta');
    }

    const data = await response.json();
    
    // Salvar token no localStorage e cookie
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role
      }));
      
      // Salvar também em cookie para o middleware
      document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }

    return data;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    
    // Remover cookie também
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    // Tentar primeiro do localStorage
    const localToken = localStorage.getItem('auth_token');
    if (localToken) return localToken;
    
    // Se não encontrar, tentar do cookie
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_token') {
        return value;
      }
    }
    
    return null;
  }

  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem('user_data');
    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  // Interceptor para adicionar token nas requisições
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Verificar se o token expirou (401 ou 403)
    if (response.status === 401 || response.status === 403) {
      // Limpar dados de autenticação
      this.logout();
      
      // Mostrar mensagem de token expirado
      if (typeof window !== 'undefined') {
        // Guardar mensagem no sessionStorage para mostrar na tela de login
        sessionStorage.setItem('auth_message', '🔒 Sua sessão expirou. Por favor, faça login novamente.');
        
        // Mostrar toast imediatamente
        showWarningToast('🔒 Sua sessão expirou. Redirecionando para o login...');
        
        // Redirecionar para login após um pequeno delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      
      throw new Error('Token expirado. Redirecionando para login...');
    }

    return response;
  }
}

export const authService = new AuthService(); 