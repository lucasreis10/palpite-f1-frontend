import axios from 'axios';
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
    try {
      const response = await axios.post(`${this.baseUrl}/login`, credentials);
      const data = response.data;
      
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
    } catch (error: any) {
      console.error('Erro no login:', error);
      
      // Tratar diferentes tipos de erro
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 401:
            throw new Error('❌ E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.');
          case 403:
            throw new Error('🚫 Acesso negado. Sua conta pode estar desativada.');
          case 404:
            throw new Error('❌ Usuário não encontrado. Verifique o e-mail informado.');
          case 429:
            throw new Error('⏳ Muitas tentativas de login. Tente novamente em alguns minutos.');
          case 500:
            throw new Error('🔧 Erro interno do servidor. Tente novamente mais tarde.');
          default:
            // Se a API retornar uma mensagem específica, usar ela
            if (typeof data === 'string') {
              throw new Error(data);
            } else if (data && data.message) {
              throw new Error(data.message);
            } else {
              throw new Error(`❌ Erro no servidor (${status}). Tente novamente.`);
            }
        }
      } else if (error.request) {
        // Erro de rede
        throw new Error('🌐 Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        // Erro desconhecido
        throw new Error(error.message || '❌ Erro inesperado. Tente novamente.');
      }
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseUrl}/register`, userData);
      const data = response.data;
      
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
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Tratar diferentes tipos de erro
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            if (data && data.includes('email')) {
              throw new Error('📧 Este e-mail já está em uso. Tente fazer login ou use outro e-mail.');
            } else if (data && data.includes('password')) {
              throw new Error('🔒 Senha muito fraca. Use pelo menos 6 caracteres com letras e números.');
            } else {
              throw new Error('❌ Dados inválidos. Verifique as informações e tente novamente.');
            }
          case 409:
            throw new Error('📧 Este e-mail já está cadastrado. Tente fazer login.');
          case 429:
            throw new Error('⏳ Muitas tentativas de registro. Tente novamente em alguns minutos.');
          case 500:
            throw new Error('🔧 Erro interno do servidor. Tente novamente mais tarde.');
          default:
            // Se a API retornar uma mensagem específica, usar ela
            if (typeof data === 'string') {
              throw new Error(data);
            } else if (data && data.message) {
              throw new Error(data.message);
            } else {
              throw new Error(`❌ Erro no servidor (${status}). Tente novamente.`);
            }
        }
      } else if (error.request) {
        // Erro de rede
        throw new Error('🌐 Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        // Erro desconhecido
        throw new Error(error.message || '❌ Erro inesperado. Tente novamente.');
      }
    }
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
    const token = this.getToken();
    if (!token) return false;
    
    // Verificar se o token não está expirado
    return this.isTokenValid(token);
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  // Verificar se o token JWT está válido e não expirado
  isTokenValid(token?: string): boolean {
    const authToken = token || this.getToken();
    if (!authToken) {
      console.log('[AUTH] Token não encontrado');
      return false;
    }

    try {
      // Decodificar o payload do JWT (sem verificar assinatura)
      const parts = authToken.split('.');
      if (parts.length !== 3) {
        console.error('[AUTH] Token JWT inválido - formato incorreto:', authToken);
        this.logout();
        return false;
      }

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      console.log('[AUTH] Verificando token:', {
        payload,
        currentTime,
        exp: payload.exp,
        timeUntilExpiry: payload.exp ? payload.exp - currentTime : 'sem expiração',
        isExpired: payload.exp && payload.exp < currentTime
      });
      
      // Verificar se o token expirou
      if (payload.exp && payload.exp < currentTime) {
        console.warn('[AUTH] Token JWT expirado');
        this.logout();
        return false;
      }
      
      console.log('[AUTH] Token válido');
      return true;
    } catch (error) {
      console.error('[AUTH] Erro ao validar token JWT:', error);
      this.logout();
      return false;
    }
  }

  // Verificar token periodicamente e redirecionar se expirado
  startTokenValidation(): void {
    if (typeof window === 'undefined') return;

    // Verificar token a cada 30 segundos
    const interval = setInterval(() => {
      if (this.getToken() && !this.isTokenValid()) {
        console.warn('Token expirado detectado durante verificação periódica');
        
        // Limpar dados
        this.logout();
        
        // Mostrar mensagem e redirecionar
        sessionStorage.setItem('auth_message', '🔒 Sua sessão expirou. Por favor, faça login novamente.');
        showWarningToast('🔒 Sua sessão expirou. Redirecionando para o login...');
        
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
        
        // Limpar interval
        clearInterval(interval);
      }
    }, 30000); // 30 segundos

    // Salvar interval ID para poder limpar depois se necessário
    if (typeof window !== 'undefined') {
      (window as any).tokenValidationInterval = interval;
    }
  }

  // Parar verificação periódica do token
  stopTokenValidation(): void {
    if (typeof window !== 'undefined' && (window as any).tokenValidationInterval) {
      clearInterval((window as any).tokenValidationInterval);
      delete (window as any).tokenValidationInterval;
    }
  }

  // Método para fazer requisições autenticadas usando axios
  async authenticatedRequest(config: any): Promise<any> {
    const token = this.getToken();
    
    const requestConfig = {
      ...config,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    };

    if (token) {
      requestConfig.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await axios(requestConfig);
      return response;
    } catch (error: any) {
      // Verificar se o token expirou (401 ou 403)
      if (error.response?.status === 401 || error.response?.status === 403) {
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

      throw error;
    }
  }

  // Método legacy para compatibilidade (será removido depois)
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