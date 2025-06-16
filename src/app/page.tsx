'use client';

import { useState, useEffect } from 'react';
import { Header } from './../components/Header';
import Link from 'next/link';
import { NextRaceWidget } from './../components/NextRaceWidget';
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

        <div className="grid-cols-1 pb-8 grid gap-8">
          {/* Top 10 Palpiteiros */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                🏆 Top 10 Palpiteiros
              </h2>
              <Link
                  href="/ranking"
                  className="text-f1-red hover:text-f1-red/80 transition-colors font-medium text-sm sm:text-base"
              >
                Ver ranking completo →
              </Link>
            </div>
            <div className="space-y-3">
              {topUsers.map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:border-f1-red/20 hover:bg-gray-50/50 transition-all duration-200">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Posição */}
                      <div className={`
                        flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-lg
                        ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                          index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                              index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                                  'bg-gradient-to-br from-blue-500 to-blue-700'}
                      `}>
                        {index + 1}
                      </div>

                      {/* Informações do usuário */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {user.name}
                        </h3>
                        {user.teamName && (
                            <p className="text-sm text-gray-600 truncate">
                              {user.teamName}
                            </p>
                        )}
                      </div>
                    </div>

                    {/* Pontuação */}
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="font-bold text-lg text-gray-900">
                        {user.totalScore.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">
                        pontos
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid-cols-1 pb-8 grid gap-8">
          <NextRaceWidget /> 
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8  pb-8">
          {/* Widget da Próxima Corrida */}
         
          
          {/* Próximas Corridas (Lista) */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              📅 Calendário de Corridas
            </h2>
            <div className="space-y-4">
              {nextRaces.length > 0 ? nextRaces.map((race, index) => (
                <div key={race.id} className="relative">
                  <div className="p-4 rounded-lg border border-gray-100 hover:border-f1-red/30 hover:bg-gray-50/50 transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* Conteúdo principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-f1-red text-white font-bold text-sm flex-shrink-0">
                            {race.round || index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-900 text-lg truncate">{race.name}</h3>
                            <p className="text-f1-red font-medium truncate">{race.circuitName || race.circuit}</p>
                          </div>
                        </div>
                        
                        <div className="ml-11 space-y-2">
                          <div className="flex items-center gap-2 text-gray-600">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm truncate">{race.city}, {race.country}</span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-sm font-medium">
                                {race.raceDateTime 
                                  ? new Date(race.raceDateTime).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  : race.date || 'Data não disponível'
                                }
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-600">
                              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm">
                                {race.raceDateTime 
                                  ? new Date(race.raceDateTime).toLocaleTimeString('pt-BR', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : race.time || 'Horário não disponível'
                                }
                              </span>
                              {race.isSprintWeekend && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                  Sprint
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {race.qualifyingDateTime && (
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                              <span>🏎️ Classificação:</span>
                              <span>
                                {new Date(race.qualifyingDateTime).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit'
                                })} às {new Date(race.qualifyingDateTime).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Botão de ação */}
                      {index === 0 && (
                        <div className="flex-shrink-0">
                          <Link 
                            href="/palpites"
                            className="inline-flex items-center justify-center gap-2 bg-f1-red text-white py-2 px-4 rounded-md hover:bg-f1-red/90 transition-colors font-bold text-sm w-full sm:w-auto"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            <span className="hidden sm:inline">Fazer Palpite</span>
                            <span className="sm:hidden">Palpite</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Badge "Próxima" */}
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Próxima
                      </span>
                    </div>
                  )}
                </div>
              )) : (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma corrida programada</h3>
                  <p className="text-gray-600">
                    Não há corridas futuras disponíveis no momento.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Último Resultado */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Último Resultado - {lastResult?.grandPrixName || 'Nenhum resultado disponível'}
            </h2>
            {lastResult ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Classificação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Mobile: Top 3, Desktop: Top 10 */}
                    {lastResult.qualifyingResults.slice(0, 10).map((result, index) => (
                      <div 
                        key={result.position} 
                        className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                          index >= 3 ? 'hidden md:flex' : ''
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                          result.position <= 3 ? 'bg-green-100 text-green-800' : 
                          result.position <= 6 ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.position}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-900 font-medium truncate block">{result.pilotName}</span>
                          <span className="text-gray-500 text-sm truncate block">{result.teamName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Corrida</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Mobile: Top 3, Desktop: Top 10 */}
                    {lastResult.raceResults.slice(0, 10).map((result, index) => (
                      <div 
                        key={result.position} 
                        className={`flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                          index >= 3 ? 'hidden md:flex' : ''
                        }`}
                      >
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm ${
                          result.position <= 3 ? 'bg-green-100 text-green-800' : 
                          result.position <= 6 ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.position}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-gray-900 font-medium truncate block">{result.pilotName}</span>
                          <span className="text-gray-500 text-sm truncate block">{result.teamName}</span>
                        </div>
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
                  className="inline-flex items-center gap-2 bg-f1-red text-white py-3 px-6 rounded-md hover:bg-f1-red/90 transition-colors font-bold"
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

        {/* Nova Funcionalidade - Calculadora de Pontos */}
        <section className="mt-8">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-800 p-6 rounded-lg shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-2xl font-bold text-white">Calculadora de Pontos</h3>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    NOVO
                  </span>
                </div>
                <p className="text-gray-300 mb-4">
                  Simule seus palpites e veja exatamente como seriam pontuados! 
                  Perfeita para treinar suas estratégias antes de fazer o palpite oficial.
                </p>
                <div className="flex items-center gap-2 text-green-400 mb-4">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">
                    100% offline - não salva dados, apenas para simulação e aprendizado
                  </span>
                </div>
                <Link 
                  href="/calculadora-pontos"
                  className="inline-flex items-center gap-2 bg-f1-red text-white py-3 px-6 rounded-md hover:bg-f1-red/90 transition-colors font-bold"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Experimentar Calculadora
                </Link>
              </div>
              <div className="hidden md:block ml-6">
                <div className="bg-blue-700/50 p-4 rounded-lg">
                  <div className="text-xs text-gray-400 mb-2">Recursos:</div>
                  <ul className="space-y-1 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                      Qualifying e Corrida
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                      Estatísticas detalhadas
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                      Sistema de pontuação
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
