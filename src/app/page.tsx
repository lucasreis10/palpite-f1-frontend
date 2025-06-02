'use client';

import { useState, useEffect } from 'react';
import { Header } from './../components/Header';
import Link from 'next/link';
import { dashboardService, NextRace, LastResult, TopUser, DashboardStats } from './../services/dashboard';

export default function Home() {
  const [nextRaces, setNextRaces] = useState<NextRace[]>([]);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar dados em paralelo
        const [racesData, resultData, usersData, statsData] = await Promise.all([
          dashboardService.getNextRaces(),
          dashboardService.getLastResult(),
          dashboardService.getTopUsers(10),
          dashboardService.getDashboardStats(),
        ]);

        setNextRaces(racesData);
        setLastResult(resultData);
        setTopUsers(usersData);
        setStats(statsData);
      } catch (error) {
        console.error('Erro ao carregar dados da dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);
  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <section className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Bem-vindo ao Bolão F1</h1>
          <p className="text-xl mb-8 text-gray-600">Faça seus palpites e acompanhe o ranking da temporada!</p>
        </section>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Próximas Corridas */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Próximas Corridas</h2>
            <div className="space-y-6">
              {nextRaces.map((race) => (
                <div key={race.id} className="flex items-start justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div>
                    <h3 className="font-bold text-gray-900">{race.name}</h3>
                    <p className="text-gray-600">{race.circuit}</p>
                    <p className="text-sm text-gray-500">{race.date} - {race.time}</p>
                  </div>
                  {race.id === 1 && (
                    <Link 
                      href="/palpites"
                      className="bg-f1-red text-black py-2 px-4 rounded-md hover:bg-f1-red/90 transition-colors font-bold text-sm"
                    >
                      Fazer Palpite
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Último Resultado */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Último Resultado - {lastResult?.grandPrixName || 'Nenhum resultado disponível'}
            </h2>
            {lastResult ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Classificação</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {lastResult.qualifyingResults.slice(0, 3).map((result) => (
                      <div key={result.position} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">
                          {result.position}
                        </span>
                        <span className="text-gray-600">{result.pilotName}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Corrida</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {lastResult.raceResults.slice(0, 3).map((result) => (
                      <div key={result.position} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">
                          {result.position}
                        </span>
                        <span className="text-gray-600">{result.pilotName}</span>
                      </div>
                    ))}
                  </div>
                  <Link 
                    href="/ultimo-evento"
                    className="inline-block mt-4 text-f1-red hover:text-f1-red/80 transition-colors font-medium text-sm"
                  >
                    Ver resultado completo →
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Nenhum resultado disponível ainda.</p>
            )}
          </div>
        </div>

        {/* Top 10 Palpiteiros */}
        <section className="mb-12">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Top 10 Palpiteiros</h2>
              <Link 
                href="/ranking"
                className="text-f1-red hover:text-f1-red/80 transition-colors font-medium"
              >
                Ver ranking completo →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {topUsers.map((user) => (
                <div 
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      user.position <= 3 ? 'bg-green-100 text-green-800' : 
                      user.position <= 6 ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.position}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{user.totalScore} pts</p>
                    <p className="text-sm text-gray-500">
                      Posição {user.position}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Estatísticas Gerais */}
        <section>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Melhor Pontuação</h3>
              <p className="text-3xl font-bold text-f1-red">
                {stats?.bestScore.score || 0} pontos
              </p>
              <p className="text-gray-600">
                {stats?.bestScore.userName || 'N/A'} - {stats?.bestScore.grandPrixName || 'N/A'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Total de Palpites</h3>
              <p className="text-3xl font-bold text-f1-red">{stats?.totalGuesses || 0}</p>
              <p className="text-gray-600">em {stats?.totalRaces || 0} corridas</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Média por Corrida</h3>
              <p className="text-3xl font-bold text-f1-red">
                {stats?.averageGuessesPerRace?.toFixed(1) || '0.0'}
              </p>
              <p className="text-gray-600">palpites por corrida</p>
            </div>
          </div>
        </section>

        {/* Nova Funcionalidade - Live Timing */}
        <section className="mt-12">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-2xl font-bold text-white">Live Timing F1 - Ranking do Bolão</h3>
                  <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                    EXPERIMENTAL
                  </span>
                </div>
                <p className="text-gray-300 mb-4">
                  Veja em tempo real quem está ganhando o bolão durante a corrida! 
                  Acompanhe como seus palpites reais se comparam aos outros participantes conforme as posições mudam na pista.
                </p>
                <div className="flex items-center gap-2 text-blue-400 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">
                    Funcionalidade usa palpites reais dos usuários. Dados da F1 disponíveis apenas durante sessões oficiais.
                  </span>
                </div>
                <Link 
                  href="/live-timing"
                  className="inline-flex items-center gap-2 bg-f1-red text-black py-3 px-6 rounded-md hover:bg-f1-red/90 transition-colors font-bold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Ver Ranking ao Vivo
                </Link>
              </div>
              <div className="hidden md:block ml-6">
                <div className="bg-gray-700/50 p-4 rounded-lg">
                  <div className="text-xs text-gray-400 mb-2">Recursos disponíveis:</div>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      Ranking em tempo real
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      Pontuação dinâmica
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                      Acertos em tempo real
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
