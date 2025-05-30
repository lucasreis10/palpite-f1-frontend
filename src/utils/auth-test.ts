// Utilitário para testar verificação de JWT expirado
// Este arquivo pode ser removido em produção

export const createExpiredJWT = (): string => {
  // Criar um JWT que expirou há 1 hora
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    sub: 'test-user',
    exp: Math.floor(Date.now() / 1000) - 3600, // Expirado há 1 hora
    iat: Math.floor(Date.now() / 1000) - 7200,  // Criado há 2 horas
    userId: 1,
    email: 'test@example.com'
  };

  const signature = 'fake-signature-for-testing';

  // Codificar em base64
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const testExpiredToken = () => {
  if (typeof window !== 'undefined') {
    console.log('🧪 Testando token expirado...');
    
    const expiredToken = createExpiredJWT();
    
    // Salvar token expirado no localStorage
    localStorage.setItem('auth_token', expiredToken);
    localStorage.setItem('user_data', JSON.stringify({
      id: 1,
      name: 'Usuário Teste',
      email: 'test@example.com',
      role: 'USER'
    }));
    
    console.log('✅ Token expirado salvo no localStorage');
    console.log('⚠️ O sistema deve detectar e redirecionar para login em breve...');
    
    // Forçar uma verificação
    setTimeout(() => {
      window.dispatchEvent(new Event('focus'));
    }, 1000);
  }
};

// Para usar no console do navegador:
// import { testExpiredToken } from './utils/auth-test';
// testExpiredToken();

console.log('🔧 Auth Test Utils carregado. Use testExpiredToken() para testar token expirado.'); 