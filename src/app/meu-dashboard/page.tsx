'use client';

import { useState, useEffect } from 'react';
import { Header } from './../../components/Header';
import { useAuth } from './../../hooks/useAuth';
import { userStatsService, UserStatsResponse, ScoreEvolution } from './../../services/userStats';
import Link from 'next/link';

export default function UserDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [userStats, setUserStats] = useState<UserStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(2025);

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !user) {
      setError('Você precisa fazer login para ver suas estatísticas');
      setIsLoading(false);
      return;
    }

    loadUserStats();
  }, [isAuthenticated, user, authLoading, selectedSeason]);

  const loadUserStats = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const stats = await userStatsService.getUserAdvancedStats(user.id, selectedSeason);
      setUserStats(stats);
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas:', error);
      setError(error.message || 'Erro ao carregar suas estatísticas');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
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

  if (!isAuthenticated || !user) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
            <p className="text-gray-600 mb-6">Você precisa fazer login para ver seu dashboard pessoal.</p>
            <Link href="/login" className="inline-flex items-center px-4 py-2 bg-f1-red text-white rounded-lg hover:bg-f1-red/90 transition-colors">
              Fazer Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

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

  if (error || !userStats) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar estatísticas</h1>
            <p className="text-gray-600 mb-6">{error || 'Ocorreu um erro inesperado'}</p>
            <button 
              onClick={loadUserStats}
              className="inline-flex items-center px-4 py-2 bg-f1-red text-white rounded-lg hover:bg-f1-red/90 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </main>
    );
  }

  const summaryStats = userStatsService.calculateSummaryStats(userStats);
  const chartData = userStatsService.formatScoreEvolutionForChart(userStats.scoreEvolution);
  const topPilots = userStatsService.getTopPilots(userStats.pilotPerformance, 5);
  const mostAccuratePilots = userStatsService.getMostAccuratePilots(userStats.pilotPerformance, 3);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header da página */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meu Dashboard</h1>
              <p className="text-gray-600">Suas estatísticas avançadas de palpites na temporada {selectedSeason}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-f1-red focus:border-transparent"
              >
                <option value={2025}>Temporada 2025</option>
                <option value={2024}>Temporada 2024</option>
              </select>
            </div>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Estatísticas Gerais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏆</span>
                <h3 className="font-semibold text-gray-900">Posição Atual</h3>
              </div>
              <p className="text-3xl font-bold text-f1-red">#{userStats.generalStats.currentRanking}</p>
              <p className="text-sm text-gray-600">de {userStats.generalStats.totalParticipants} participantes</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📊</span>
                <h3 className="font-semibold text-gray-900">Pontuação Total</h3>
              </div>
              <p className="text-3xl font-bold text-f1-red">{userStats.generalStats.totalScore.toFixed(1)}</p>
              <p className="text-sm text-gray-600">em {userStats.generalStats.eventsParticipated} eventos</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎯</span>
                <h3 className="font-semibold text-gray-900">Média por Evento</h3>
              </div>
              <p className="text-3xl font-bold text-f1-red">{userStats.generalStats.averageScore.toFixed(1)}</p>
              <p className="text-sm text-gray-600">pontos por evento</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⭐</span>
                <h3 className="font-semibold text-gray-900">Melhor Evento</h3>
              </div>
              <p className="text-3xl font-bold text-f1-red">{userStats.generalStats.bestEventScore.toFixed(1)}</p>
              <p className="text-sm text-gray-600">{userStats.generalStats.bestEventName}</p>
            </div>
          </div>
        </section>

        {/* Evolução da Pontuação */}
        <section className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Evolução da Pontuação</h2>
            {userStats.scoreEvolution.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {userStats.scoreEvolution.map((evolution, index) => (
                        <div key={evolution.grandPrixId} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900">R{evolution.round}</span>
                            <span className="text-xs text-gray-500">{evolution.country}</span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-3 text-sm">{evolution.grandPrixName}</h4>
                          
                          {evolution.hasQualifyingGuess && (
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-600">Quali:</span>
                              <span className="text-sm font-medium text-blue-600">{evolution.qualifyingScore.toFixed(1)}</span>
                            </div>
                          )}
                          
                          {evolution.hasRaceGuess && (
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs text-gray-600">Corrida:</span>
                              <span className="text-sm font-medium text-green-600">{evolution.raceScore.toFixed(1)}</span>
                            </div>
                          )}
                          
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-sm font-medium text-gray-900">Total:</span>
                            <span className="text-lg font-bold text-f1-red">{evolution.totalScore.toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum evento participado ainda nesta temporada.</p>
              </div>
            )}
          </div>
        </section>

        {/* Performance por Piloto */}
        <section className="mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pilotos Mais Apostados</h3>
              {topPilots.length > 0 ? (
                <div className="space-y-3">
                  {topPilots.map((pilot, index) => (
                    <div key={pilot.pilotId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-f1-red text-white font-bold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{pilot.pilotName}</p>
                          <p className="text-sm text-gray-600">{pilot.teamName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-f1-red">{pilot.timesGuessed}x</p>
                        <p className="text-xs text-gray-600">{pilot.accuracy.toFixed(1)}% acerto</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum palpite realizado ainda.</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Maior Taxa de Acerto</h3>
              {mostAccuratePilots.length > 0 ? (
                <div className="space-y-3">
                  {mostAccuratePilots.map((pilot, index) => (
                    <div key={pilot.pilotId} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white font-bold text-sm">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{pilot.pilotName}</p>
                          <p className="text-sm text-gray-600">{pilot.teamName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{pilot.accuracy.toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">{pilot.timesGuessed} apostas</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">Dados insuficientes para análise.</p>
              )}
            </div>
          </div>
        </section>

        {/* Resumo de Performance */}
        <section className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumo de Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-f1-red mb-2">{summaryStats.overallAccuracy.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Taxa de Acerto Geral</div>
              </div>
              
              {summaryStats.mostBetPilot && (
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900 mb-2">{summaryStats.mostBetPilot.pilotName}</div>
                  <div className="text-sm text-gray-600">Piloto Mais Apostado</div>
                  <div className="text-xs text-gray-500">{summaryStats.mostBetPilot.timesGuessed} apostas</div>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-3xl font-bold text-f1-red mb-2">{summaryStats.avgPointsPerEvent.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Pontos por Evento</div>
              </div>
            </div>
          </div>
        </section>

        {/* Análise por Tipo de Circuito */}
        {userStats.circuitPerformance.length > 0 && (
          <section className="mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance por Tipo de Circuito</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userStats.circuitPerformance.map((circuit, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{circuit.circuitType}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Média:</span>
                        <span className="font-medium">{circuit.averageScore.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Melhor:</span>
                        <span className="font-medium text-green-600">{circuit.bestScore.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Eventos:</span>
                        <span className="font-medium">{circuit.eventsParticipated}</span>
                      </div>
                      {circuit.bestEvent !== "Nenhum" && (
                        <div className="text-xs text-gray-500">
                          Melhor: {circuit.bestEvent}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
} 