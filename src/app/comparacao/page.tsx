'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useComparison } from '../../hooks/useComparison';
import { Header } from '../../components/Header';
import { 
  UserIcon, 
  ChartBarIcon, 
  TrophyIcon,
  FireIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  UsersIcon
} from '@heroicons/react/24/outline';

export default function ComparacaoPage() {
  const { user } = useAuth();
  const { users, comparison, loading, error, fetchUsers, compareUsers, clearComparison } = useComparison();
  const [selectedUser1, setSelectedUser1] = useState<any>(null);
  const [selectedUser2, setSelectedUser2] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user]);

  useEffect(() => {
    if (user && users.length > 0) {
      const currentUser = users.find(u => u.id === user.id);
      if (currentUser) {
        setSelectedUser1(currentUser);
      }
    }
  }, [user, users]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCompare = async () => {
    if (!selectedUser1 || !selectedUser2) return;
    
    await compareUsers(selectedUser1.id, selectedUser2.id);
  };

  const getWinPercentage = (wins: number, total: number) => {
    return total > 0 ? Math.round((wins / total) * 100) : 0;
  };

  const StatCard = ({ title, value, subtitle, color = 'text-gray-900', icon: Icon }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
    icon?: any;
  }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
      {Icon && <Icon className={`h-6 w-6 mx-auto mb-2 ${color}`} />}
      <div className={`text-2xl font-bold ${color} mb-1`}>
        {value}
      </div>
      <div className="text-sm text-gray-600">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
            <p className="text-gray-600">Você precisa estar logado para comparar usuários.</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => fetchUsers()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <UsersIcon className="h-8 w-8 text-red-600" />
                  Comparação Head-to-Head
                </h1>
                <p className="text-gray-600 mt-1">
                  Compare seu desempenho com outros usuários
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading && !comparison && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Carregando dados...</p>
            </div>
          )}

          {!loading && users.length === 0 && (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum usuário encontrado.</p>
            </div>
          )}

          {users.length > 0 && (
            <>
              {/* Seleção de Usuários */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecionar Usuários para Comparar</h2>
                
                {/* Busca */}
                <div className="mb-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Usuário 1 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Usuário 1
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredUsers.map((u) => (
                        <div
                          key={u.id}
                          onClick={() => setSelectedUser1(u)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedUser1?.id === u.id
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{u.name}</div>
                              <div className="text-sm text-gray-500">{u.email}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">#{u.position || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{u.totalPoints || 0} pts</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Usuário 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Usuário 2
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {filteredUsers.filter(u => u.id !== selectedUser1?.id).map((u) => (
                        <div
                          key={u.id}
                          onClick={() => setSelectedUser2(u)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedUser2?.id === u.id
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-900">{u.name}</div>
                              <div className="text-sm text-gray-500">{u.email}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">#{u.position || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{u.totalPoints || 0} pts</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Botão Comparar */}
                <div className="mt-6 text-center">
                  <button
                    onClick={handleCompare}
                    disabled={!selectedUser1 || !selectedUser2 || loading}
                    className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Comparando...' : 'Comparar Usuários'}
                  </button>
                </div>
              </div>

              {/* Resultados da Comparação */}
              {comparison && comparison.user1 && comparison.user2 && (
                <div className="space-y-8">
                  {/* Header da Comparação */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Resultados da Comparação</h2>
                      <button
                        onClick={clearComparison}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                      {/* Usuário 1 */}
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <UserIcon className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{comparison.user1?.name || 'Usuário 1'}</h3>
                        <p className="text-sm text-gray-500">Usuário 1</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">{comparison.user1Stats?.totalPoints || 0} pts</p>
                      </div>

                      {/* VS */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-400">VS</div>
                        <div className="mt-2 text-sm text-gray-600">
                          {comparison.directComparison?.totalRaces || 0} corridas
                        </div>
                      </div>

                      {/* Usuário 2 */}
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <UserIcon className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">{comparison.user2?.name || 'Usuário 2'}</h3>
                        <p className="text-sm text-gray-500">Usuário 2</p>
                        <p className="text-lg font-bold text-green-600 mt-2">{comparison.user2Stats?.totalPoints || 0} pts</p>
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas Comparativas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Estatísticas Usuário 1 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                        {comparison.user1?.name || 'Usuário 1'}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <StatCard
                          title="Média por Corrida"
                          value={(comparison.user1Stats?.averagePoints || 0).toFixed(1)}
                          icon={ChartBarIcon}
                          color="text-blue-600"
                        />
                        <StatCard
                          title="Melhor Pontuação"
                          value={comparison.user1Stats?.bestScore || 0}
                          icon={TrophyIcon}
                          color="text-blue-600"
                        />
                        <StatCard
                          title="Pódios"
                          value={comparison.user1Stats?.podiums || 0}
                          icon={TrophyIcon}
                          color="text-blue-600"
                        />
                        <StatCard
                          title="Precisão Quali"
                          value={`${(comparison.user1Stats?.qualifyingAccuracy || 0).toFixed(1)}%`}
                          icon={FireIcon}
                          color="text-blue-600"
                        />
                      </div>
                    </div>

                    {/* Estatísticas Usuário 2 */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                        {comparison.user2?.name || 'Usuário 2'}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <StatCard
                          title="Média por Corrida"
                          value={(comparison.user2Stats?.averagePoints || 0).toFixed(1)}
                          icon={ChartBarIcon}
                          color="text-green-600"
                        />
                        <StatCard
                          title="Melhor Pontuação"
                          value={comparison.user2Stats?.bestScore || 0}
                          icon={TrophyIcon}
                          color="text-green-600"
                        />
                        <StatCard
                          title="Pódios"
                          value={comparison.user2Stats?.podiums || 0}
                          icon={TrophyIcon}
                          color="text-green-600"
                        />
                        <StatCard
                          title="Precisão Quali"
                          value={`${(comparison.user2Stats?.qualifyingAccuracy || 0).toFixed(1)}%`}
                          icon={FireIcon}
                          color="text-green-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Head-to-Head */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                      Confronto Direto
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{comparison.directComparison?.user1Wins || 0}</div>
                        <div className="text-sm text-gray-600">Vitórias {comparison.user1?.name || 'Usuário 1'}</div>
                        <div className="text-xs text-gray-500">
                          {getWinPercentage(comparison.directComparison?.user1Wins || 0, comparison.directComparison?.totalRaces || 0)}%
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-400">{comparison.directComparison?.draws || 0}</div>
                        <div className="text-sm text-gray-600">Empates</div>
                        <div className="text-xs text-gray-500">
                          {getWinPercentage(comparison.directComparison?.draws || 0, comparison.directComparison?.totalRaces || 0)}%
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">{comparison.directComparison?.user2Wins || 0}</div>
                        <div className="text-sm text-gray-600">Vitórias {comparison.user2?.name || 'Usuário 2'}</div>
                        <div className="text-xs text-gray-500">
                          {getWinPercentage(comparison.directComparison?.user2Wins || 0, comparison.directComparison?.totalRaces || 0)}%
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                      <div className="flex h-4 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-600" 
                          style={{ width: `${getWinPercentage(comparison.directComparison?.user1Wins || 0, comparison.directComparison?.totalRaces || 0)}%` }}
                        ></div>
                        <div 
                          className="bg-gray-400" 
                          style={{ width: `${getWinPercentage(comparison.directComparison?.draws || 0, comparison.directComparison?.totalRaces || 0)}%` }}
                        ></div>
                        <div 
                          className="bg-green-600" 
                          style={{ width: `${getWinPercentage(comparison.directComparison?.user2Wins || 0, comparison.directComparison?.totalRaces || 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Corridas Recentes */}
                  {comparison.recentRaces && comparison.recentRaces.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        Corridas Recentes
                      </h3>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-3 px-4 font-medium text-gray-700">Grande Prêmio</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">Data</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">{comparison.user1?.name || 'Usuário 1'}</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">{comparison.user2?.name || 'Usuário 2'}</th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">Vencedor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {comparison.recentRaces?.map((race, index) => (
                              <tr key={index} className="border-b border-gray-100">
                                <td className="py-3 px-4 font-medium text-gray-900">{race.grandPrixName}</td>
                                <td className="py-3 px-4 text-center text-gray-600">
                                  {race.date ? new Date(race.date).toLocaleDateString('pt-BR') : 'N/A'}
                                </td>
                                <td className={`py-3 px-4 text-center font-medium ${
                                  race.winner === 'user1' ? 'text-blue-600' : 'text-gray-600'
                                }`}>
                                  {race.user1Points}
                                </td>
                                <td className={`py-3 px-4 text-center font-medium ${
                                  race.winner === 'user2' ? 'text-green-600' : 'text-gray-600'
                                }`}>
                                  {race.user2Points}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  {race.winner === 'user1' && (
                                    <span className="text-blue-600 font-medium">{comparison.user1?.name || 'Usuário 1'}</span>
                                  )}
                                  {race.winner === 'user2' && (
                                    <span className="text-green-600 font-medium">{comparison.user2?.name || 'Usuário 2'}</span>
                                  )}
                                  {race.winner === 'draw' && (
                                    <span className="text-gray-600 font-medium">Empate</span>
                                  )}
                                </td>
                              </tr>
                            )) || []}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}