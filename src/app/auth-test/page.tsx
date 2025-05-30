'use client';

import { useEffect, useState } from 'react';
import { authService } from '../../services/auth';
import { authDebug } from '../../utils/auth-debug';

export default function AuthTestPage() {
  const [authStatus, setAuthStatus] = useState<any>({});
  
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    const isAuthenticated = authService.isAuthenticated();
    
    setAuthStatus({
      hasToken: !!token,
      tokenValue: token,
      hasUser: !!user,
      userData: user,
      isAuthenticated,
      timestamp: new Date().toLocaleString('pt-BR')
    });
  };

  const handleLogin = async () => {
    try {
      // Tente fazer login com credenciais de teste
      const response = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('Login bem-sucedido:', response);
      checkAuthStatus();
    } catch (error) {
      console.error('Erro no login:', error);
      alert('Erro no login. Verifique as credenciais.');
    }
  };

  const handleCheckToken = () => {
    authDebug.checkToken();
    checkAuthStatus();
  };

  const handleClearAuth = () => {
    authDebug.clearAuth();
    checkAuthStatus();
  };

  const handleSetTestToken = () => {
    authDebug.setTestToken(24); // 24 horas
    checkAuthStatus();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔧 Teste de Autenticação</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status Atual</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(authStatus, null, 2)}
          </pre>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Ações de Teste</h2>
          <div className="space-y-4">
            <div>
              <button
                onClick={handleCheckToken}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
              >
                🔍 Verificar Token (Console)
              </button>
              <span className="text-sm text-gray-600">Abre detalhes no console do navegador</span>
            </div>

            <div>
              <button
                onClick={handleSetTestToken}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
              >
                🔧 Criar Token de Teste
              </button>
              <span className="text-sm text-gray-600">Cria um token válido para testes</span>
            </div>

            <div>
              <button
                onClick={handleClearAuth}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mr-2"
              >
                🗑️ Limpar Autenticação
              </button>
              <span className="text-sm text-gray-600">Remove todos os dados de autenticação</span>
            </div>

            <div>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 mr-2"
              >
                🔑 Fazer Login de Teste
              </button>
              <span className="text-sm text-gray-600">Tenta fazer login com credenciais de teste</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Links de Navegação</h2>
          <div className="space-x-4">
            <a href="/" className="text-blue-600 hover:underline">Home</a>
            <a href="/login" className="text-blue-600 hover:underline">Login</a>
            <a href="/palpites" className="text-blue-600 hover:underline">Palpites (Protegida)</a>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <p><strong>Dica:</strong> Abra o Console do navegador (F12) para ver logs detalhados.</p>
          <p>Use os comandos no console:</p>
          <ul className="list-disc ml-6 mt-2">
            <li><code>authDebug.checkToken()</code> - Verificar token atual</li>
            <li><code>authDebug.clearAuth()</code> - Limpar autenticação</li>
            <li><code>authDebug.setTestToken(hours)</code> - Criar token de teste</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 