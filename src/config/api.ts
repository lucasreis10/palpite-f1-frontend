// Configuração centralizada da API
export const API_CONFIG = {
  BASE_URL: 'https://javaspringboot-production-a2d3.up.railway.app/api',
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
} as const; 