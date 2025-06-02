'use client';

import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function PerfilPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600 mb-6">Você precisa estar logado para acessar seu perfil.</p>
          <Link
            href="/login"
            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-4xl p-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Voltar ao início
          </Link>
          
          <h1 className="text-3xl font-bold text-black mb-2">Meu Perfil</h1>
          <p className="text-black">
            Gerencie suas informações pessoais e preferências da conta.
          </p>
        </div>

        {/* Informações do Usuário */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-black">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              {user.role === 'ADMIN' && (
                <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full font-medium">
                  Administrador
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Seções do Perfil */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Informações Pessoais */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              👤 Informações Pessoais
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <p className="text-black bg-gray-50 p-2 rounded border">{user.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-black bg-gray-50 p-2 rounded border">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                <p className="text-black bg-gray-50 p-2 rounded border">
                  {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                Editar Informações
              </button>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              📊 Minhas Estatísticas
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Palpites Realizados</span>
                <span className="font-bold text-black">Em breve</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Pontuação Total</span>
                <span className="font-bold text-black">Em breve</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Posição no Ranking</span>
                <span className="font-bold text-black">Em breve</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="text-gray-700">Melhor Resultado</span>
                <span className="font-bold text-black">Em breve</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">🚧 Em Desenvolvimento</h3>
          <p className="text-yellow-700">
            Esta página está em desenvolvimento. Em breve você poderá editar suas informações, 
            ver estatísticas detalhadas e gerenciar suas preferências.
          </p>
        </div>
      </div>
    </div>
  );
} 