import axios from 'axios';
import { API_URLS } from './api';
import { showWarningToast } from '../utils/notifications';

// Função para verificar se estamos no browser
const isBrowser = () => typeof window !== 'undefined';

// Função para limpar dados de autenticação
const clearAuthData = () => {
  if (!isBrowser()) return;
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_data');
  
  // Remover cookie também
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

// Função para verificar se o erro é relacionado a JWT expirado
const isJwtExpiredError = (error: any): boolean => {
  // Verificar status HTTP de não autorizado
  if (error.response?.status === 401 || error.response?.status === 403) {
    return true;
  }
  
  // Verificar mensagem de erro específica do JWT
  const errorMessage = error.response?.data?.message || error.response?.data || error.message || '';
  const lowerMessage = errorMessage.toLowerCase();
  
  // Verificar diferentes formas de erro de JWT expirado
  const jwtExpiredPatterns = [
    'jwt',
    'token',
    'expired',
    'expiredJwtException',
    'jsonwebtoken.ExpiredJwtException',
    'unauthorized',
    'access denied',
    'invalid token',
    'token has expired'
  ];
  
  return jwtExpiredPatterns.some(pattern => lowerMessage.includes(pattern.toLowerCase()));
};

// Função para redirecionar para login
const redirectToLogin = () => {
  if (!isBrowser()) return;
  
  // Guardar mensagem no sessionStorage para mostrar na tela de login
  sessionStorage.setItem('auth_message', '🔒 Sua sessão expirou. Por favor, faça login novamente.');
  
  // Mostrar toast imediatamente
  showWarningToast('🔒 Sua sessão expirou. Redirecionando para o login...');
  
  // Redirecionar para login imediatamente
  setTimeout(() => {
    window.location.href = '/login';
  }, 1500);
};

// Verificar se o token está expirado antes de fazer a requisição
const isTokenExpired = (token: string): boolean => {
  try {
    // Decodificar o payload do JWT (sem verificar assinatura)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Verificar se o token expirou
    return payload.exp && payload.exp < currentTime;
  } catch (error) {
    // Se não conseguir decodificar, assumir que está inválido
    console.warn('Erro ao decodificar token JWT:', error);
    return true;
  }
};

// Listener para verificar token quando o usuário volta para a aba
const setupVisibilityListener = () => {
  if (!isBrowser()) return;
  
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // Usuário voltou para a aba, verificar token
      const token = localStorage.getItem('auth_token');
      if (token && isTokenExpired(token)) {
        console.warn('Token expirado detectado ao voltar para a aba');
        clearAuthData();
        redirectToLogin();
      }
    }
  });

  // Também verificar quando a janela ganha foco
  window.addEventListener('focus', () => {
    const token = localStorage.getItem('auth_token');
    if (token && isTokenExpired(token)) {
      console.warn('Token expirado detectado ao focar na janela');
      clearAuthData();
      redirectToLogin();
    }
  });
};

// Inicializar listener apenas no browser
if (isBrowser()) {
  setupVisibilityListener();
}

// Criar instância do axios com configuração base
const axiosInstance = axios.create({
  baseURL: API_URLS.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição para adicionar token automaticamente
axiosInstance.interceptors.request.use(
  (config) => {
    // Só tentar acessar localStorage no browser
    if (isBrowser()) {
      const token = localStorage.getItem('auth_token');
      
      if (token) {
        // Verificar se o token está expirado antes de fazer a requisição
        if (isTokenExpired(token)) {
          console.warn('Token JWT expirado detectado antes da requisição');
          clearAuthData();
          redirectToLogin();
          return Promise.reject(new Error('Token expirado'));
        }
        
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para tratar erros de autenticação
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Erro na resposta da API:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Verificar se é erro de JWT expirado
    if (isJwtExpiredError(error)) {
      console.warn('JWT expirado detectado na resposta da API');
      
      // Limpar dados de autenticação
      clearAuthData();
      
      // Redirecionar para login
      redirectToLogin();
      
      return Promise.reject(new Error('Token expirado. Redirecionando para login...'));
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance; 