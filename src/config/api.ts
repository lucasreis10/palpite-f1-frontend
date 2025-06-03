// Configuração centralizada da API
const getBaseUrl = () => {
  // Se estiver em desenvolvimento ou variável de ambiente específica para desenvolvimento
  if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_USE_LOCAL_API === 'true') {
    return 'http://localhost:8081/api';
  }
  // Em produção, usar a URL do Railway
  return process.env.NEXT_PUBLIC_API_URL || 'https://javaspringboot-production-a2d3.up.railway.app/api';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    AUTH: '/auth',
    USERS: '/users',
    PILOTS: '/pilots',
    GUESSES: '/guesses',
    GRAND_PRIX: '/grand-prix',
    DASHBOARD: '/dashboard',
    TEAMS: '/teams',
    CONSTRUCTORS: '/constructors',
    HEALTH: '/health'
  }
} as const;

// Helper para construir URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// URLs específicas para cada serviço
export const API_URLS = {
  AUTH: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH),
  USERS: buildApiUrl(API_CONFIG.ENDPOINTS.USERS),
  PILOTS: buildApiUrl(API_CONFIG.ENDPOINTS.PILOTS),
  GUESSES: buildApiUrl(API_CONFIG.ENDPOINTS.GUESSES),
  GRAND_PRIX: buildApiUrl(API_CONFIG.ENDPOINTS.GRAND_PRIX),
  DASHBOARD: buildApiUrl(API_CONFIG.ENDPOINTS.DASHBOARD),
  TEAMS: buildApiUrl(API_CONFIG.ENDPOINTS.TEAMS),
  CONSTRUCTORS: buildApiUrl(API_CONFIG.ENDPOINTS.CONSTRUCTORS),
  HEALTH: buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH),
  BASE_URL: API_CONFIG.BASE_URL
} as const; 