// Utilitário para debug de autenticação
export const authDebug = {
  // Verificar e mostrar informações do token
  checkToken(): void {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      console.log('❌ Nenhum token encontrado no localStorage');
      return;
    }

    console.log('✅ Token encontrado:', token);
    
    try {
      const parts = token.split('.');
      
      if (parts.length !== 3) {
        console.error('❌ Token JWT inválido - deve ter 3 partes separadas por ponto');
        return;
      }

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      console.log('📋 Header do Token:', header);
      console.log('📋 Payload do Token:', payload);
      
      if (payload.exp) {
        const expirationDate = new Date(payload.exp * 1000);
        const timeUntilExpiry = payload.exp - currentTime;
        const isExpired = timeUntilExpiry < 0;
        
        console.log('⏰ Expiração:', {
          expirationTimestamp: payload.exp,
          expirationDate: expirationDate.toLocaleString('pt-BR'),
          currentTime,
          currentDate: new Date().toLocaleString('pt-BR'),
          timeUntilExpiry: timeUntilExpiry > 0 ? `${Math.floor(timeUntilExpiry / 60)} minutos` : 'EXPIRADO',
          isExpired
        });
        
        if (isExpired) {
          console.error('❌ TOKEN EXPIRADO!');
        } else {
          console.log('✅ Token ainda válido');
        }
      } else {
        console.log('⚠️ Token sem data de expiração');
      }
      
      // Verificar dados do usuário
      const userData = localStorage.getItem('user_data');
      if (userData) {
        console.log('👤 Dados do usuário:', JSON.parse(userData));
      } else {
        console.log('❌ Dados do usuário não encontrados');
      }
      
    } catch (error) {
      console.error('❌ Erro ao decodificar token:', error);
    }
  },

  // Limpar autenticação
  clearAuth(): void {
    console.log('🧹 Limpando dados de autenticação...');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    console.log('✅ Dados limpos');
  },

  // Criar token de teste (apenas para debug)
  setTestToken(hoursUntilExpiry: number = 24): void {
    console.log(`🔧 Criando token de teste válido por ${hoursUntilExpiry} horas...`);
    
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const currentTime = Math.floor(Date.now() / 1000);
    const payload = {
      sub: 'test@example.com',
      exp: currentTime + (hoursUntilExpiry * 60 * 60),
      iat: currentTime,
      email: 'test@example.com'
    };
    
    // Criar token fake (não é válido para o backend, apenas para testar o frontend)
    const fakeToken = `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.fake-signature`;
    
    localStorage.setItem('auth_token', fakeToken);
    localStorage.setItem('user_data', JSON.stringify({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'USER'
    }));
    
    console.log('✅ Token de teste criado');
    this.checkToken();
  }
};

// Expor globalmente para facilitar debug no console
if (typeof window !== 'undefined') {
  (window as any).authDebug = authDebug;
  console.log('🔧 Utilitário de debug de autenticação disponível. Use:');
  console.log('  authDebug.checkToken() - Verificar token atual');
  console.log('  authDebug.clearAuth() - Limpar autenticação');
  console.log('  authDebug.setTestToken(hours) - Criar token de teste');
} 