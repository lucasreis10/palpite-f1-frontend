'use client'

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { StandingsTable } from '@/components/StandingsTable';
import { Toast } from '@/components/Toast';
import { dashboardService, TopUser, DashboardStats } from '@/services/dashboard';

interface Participant {
  id: number;
  name: string;
  team: string;
  points: number;
  lastPosition: number;
  bestResult: number;
  totalPredictions: number;
}

export default function RankingPage() {
  const [standings, setStandings] = useState<Participant[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  // Função para mostrar toast
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    });
  };

  // Função para fechar toast
  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Converter TopUser para Participant
  const convertTopUserToParticipant = (topUser: TopUser, index: number): Participant => ({
    id: topUser.id,
    name: topUser.name,
    team: 'Equipe F1', // Placeholder até termos dados de equipe
    points: topUser.totalScore,
    lastPosition: topUser.lastPosition || index + 1,
    bestResult: 1, // Placeholder
    totalPredictions: 15 // Placeholder
  });

  useEffect(() => {
    const loadRankingData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar dados em paralelo
        const [topUsersData, statsData] = await Promise.all([
          dashboardService.getTopUsers(20),
          dashboardService.getDashboardStats()
        ]);

        // Converter dados para formato esperado
        const participantsData = topUsersData.map((user, index) => 
          convertTopUserToParticipant(user, index)
        );

        setStandings(participantsData);
        setStats(statsData);

        if (participantsData.length > 0) {
          showToast(`Ranking carregado com ${participantsData.length} participantes! 🏆`, 'success');
        }

      } catch (error) {
        console.error('Erro ao carregar dados do ranking:', error);
        showToast('Erro ao carregar dados do ranking. Tente novamente.', 'error');
        
        // Fallback para dados mockados em caso de erro
        const mockStandings = [
          {
            id: 1,
            name: 'João Silva',
            team: 'Red Bull Racing',
            points: 245,
            lastPosition: 1,
            bestResult: 1,
            totalPredictions: 15,
          },
          {
            id: 2,
            name: 'Maria Santos',
            team: 'Ferrari',
            points: 220,
            lastPosition: 2,
            bestResult: 1,
            totalPredictions: 15,
          },
          {
            id: 3,
            name: 'Pedro Oliveira',
            team: 'Mercedes',
            points: 198,
            lastPosition: 4,
            bestResult: 2,
            totalPredictions: 14,
          }
        ];
        setStandings(mockStandings);
      } finally {
        setIsLoading(false);
      }
    };

    loadRankingData();
  }, []);

  const handleRefreshRanking = async () => {
    try {
      showToast('Atualizando ranking...', 'info');
      
      const [topUsersData, statsData] = await Promise.all([
        dashboardService.getTopUsers(20),
        dashboardService.getDashboardStats()
      ]);

      const participantsData = topUsersData.map((user, index) => 
        convertTopUserToParticipant(user, index)
      );

      setStandings(participantsData);
      setStats(statsData);
      
      showToast('Ranking atualizado com sucesso! 🔄', 'success');
    } catch (error) {
      console.error('Erro ao atualizar ranking:', error);
      showToast('Erro ao atualizar ranking. Tente novamente.', 'error');
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Carregando ranking...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Classificação do Campeonato</h1>
              <p className="text-gray-600 mt-2">
                Acompanhe a pontuação e o desempenho dos palpiteiros ao longo da temporada
              </p>
            </div>
            <button
              onClick={handleRefreshRanking}
              className="px-4 py-2 bg-f1-red text-black rounded-md hover:bg-f1-red/90 transition-colors font-bold text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Temporada 2024</h2>
                <p className="text-gray-600">
                  {standings.length > 0 ? `${standings.length} participantes` : 'Carregando...'}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-100"></span>
                  <span className="text-sm text-gray-600">Top 3</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-100"></span>
                  <span className="text-sm text-gray-600">Top 6</span>
                </div>
              </div>
            </div>

            {standings.length > 0 ? (
              <StandingsTable standings={standings} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum dado de ranking disponível</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Maior Pontuação</h3>
            <p className="text-3xl font-bold text-f1-red">
              {stats?.bestScore?.score ? `${stats.bestScore.score} pontos` : '32 pontos'}
            </p>
            <p className="text-gray-600">
              {stats?.bestScore?.userName && stats?.bestScore?.grandPrixName 
                ? `${stats.bestScore.userName} - ${stats.bestScore.grandPrixName}`
                : 'João Silva - GP da Austrália'
              }
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Média de Palpites</h3>
            <p className="text-3xl font-bold text-f1-red">
              {stats?.averageGuessesPerRace ? stats.averageGuessesPerRace.toFixed(1) : '18.5'}
            </p>
            <p className="text-gray-600">por corrida</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Total de Palpites</h3>
            <p className="text-3xl font-bold text-f1-red">
              {stats?.totalGuesses || '114'}
            </p>
            <p className="text-gray-600">
              em {stats?.totalRaces || '15'} corridas
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 