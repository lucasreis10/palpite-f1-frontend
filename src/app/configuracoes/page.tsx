'use client';

import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function ConfiguracoesPage() {
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
          <p className="text-gray-600 mb-6">Você precisa estar logado para acessar as configurações.</p>
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
          
          <h1 className="text-3xl font-bold text-black mb-2">Configurações</h1>
          <p className="text-black">
            Personalize sua experiência no F1 Bolão.
          </p>
        </div>

        {/* Configurações */}
        <div className="space-y-6">
          {/* Preferências de Notificação */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              🔔 Notificações
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">Lembrete de Palpites</p>
                  <p className="text-sm text-gray-600">Receba notificações antes dos prazos de palpites</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">Resultados de GP</p>
                  <p className="text-sm text-gray-600">Notificações quando os resultados forem divulgados</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">Atualizações do Ranking</p>
                  <p className="text-sm text-gray-600">Seja notificado sobre mudanças na sua posição</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preferências de Exibição */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              🎨 Aparência
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                <select className="w-full p-2 border border-gray-300 rounded-md bg-white text-black">
                  <option value="light">Claro</option>
                  <option value="dark" disabled>Escuro (Em breve)</option>
                  <option value="system" disabled>Sistema (Em breve)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuso Horário</label>
                <select className="w-full p-2 border border-gray-300 rounded-md bg-white text-black">
                  <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                  <option value="America/Brasilia">Brasília (GMT-3)</option>
                  <option value="America/Fortaleza">Fortaleza (GMT-3)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Privacidade */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              🔒 Privacidade
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">Perfil Público</p>
                  <p className="text-sm text-gray-600">Permitir que outros vejam seus palpites e estatísticas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">Aparecer no Ranking</p>
                  <p className="text-sm text-gray-600">Mostrar seu nome na classificação geral</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Zona de Perigo */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-red-200">
            <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
              ⚠️ Zona de Perigo
            </h3>
            <div className="space-y-4">
              <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors">
                Deletar Conta
              </button>
              <p className="text-sm text-gray-600">
                Esta ação é irreversível. Todos os seus palpites e dados serão permanentemente removidos.
              </p>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end gap-4">
            <button className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors">
              Cancelar
            </button>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Salvar Configurações
            </button>
          </div>
        </div>

        {/* Aviso de Desenvolvimento */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-bold text-yellow-800 mb-2">🚧 Em Desenvolvimento</h3>
          <p className="text-yellow-700">
            As configurações estão em desenvolvimento. As alterações não serão salvas no momento, 
            mas em breve você poderá personalizar completamente sua experiência.
          </p>
        </div>
      </div>
    </div>
  );
} 