'use client'

import { useState, useEffect } from 'react';
import { Header } from './../../components/Header';
import { TeamStandingsTable } from './../../components/TeamStandingsTable';
import { Toast } from './../../components/Toast';
import { dashboardService, TopTeam } from './../../services/dashboard';

interface TeamMember {
  id: number;
  name: string;
  points: number;
  bestResult: number;
}

interface Team {
  id: number;
  name: string;
  points: number;
  members: [TeamMember, TeamMember];
  lastPosition: number;
  bestResult: number;
}

// Serviço para equipes
class TeamsService {
  private readonly baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

  async getTeamsByYear(year: number): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/year/${year}/ranking`);
      if (!response.ok) {
        throw new Error('Erro ao buscar equipes');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      return [];
    }
  }

  async getActiveTeamsByYear(year: number): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/year/${year}/active`);
      if (!response.ok) {
        throw new Error('Erro ao buscar equipes ativas');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar equipes ativas:', error);
      return [];
    }
  }
}

const teamsService = new TeamsService();

export default function TeamStandingsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
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

  // Converter dados da API para formato esperado
  const convertApiTeamToTeam = (apiTeam: any, index: number): Team => {
    // Dados mockados para membros até termos API completa
    const mockMembers: [TeamMember, TeamMember] = [
      { id: apiTeam.id * 10 + 1, name: 'Membro 1', points: Math.floor(apiTeam.totalScore * 0.6), bestResult: 1 },
      { id: apiTeam.id * 10 + 2, name: 'Membro 2', points: Math.floor(apiTeam.totalScore * 0.4), bestResult: 2 }
    ];

    return {
      id: apiTeam.id,
      name: apiTeam.name,
      points: apiTeam.totalScore || 0,
      members: mockMembers,
      lastPosition: index + 1,
      bestResult: Math.min(index + 1, 3)
    };
  };

  // Converter TopTeam para Team
  const convertTopTeamToTeam = (topTeam: TopTeam, index: number): Team => {
    const members: [TeamMember, TeamMember] = [
      { 
        id: topTeam.id * 10 + 1, 
        name: topTeam.topMembers[0]?.name || 'Membro 1', 
        points: topTeam.topMembers[0]?.score || Math.floor(topTeam.totalScore * 0.6), 
        bestResult: 1 
      },
      { 
        id: topTeam.id * 10 + 2, 
        name: topTeam.topMembers[1]?.name || 'Membro 2', 
        points: topTeam.topMembers[1]?.score || Math.floor(topTeam.totalScore * 0.4), 
        bestResult: 2 
      }
    ];

    return {
      id: topTeam.id,
      name: topTeam.name,
      points: topTeam.totalScore,
      members,
      lastPosition: topTeam.position,
      bestResult: Math.min(topTeam.position, 3)
    };
  };

  useEffect(() => {
    const loadTeamsData = async () => {
      try {
        setIsLoading(true);
        const currentYear = new Date().getFullYear();
        
        // Tentar carregar dados da API de equipes primeiro
        const teamsData = await teamsService.getTeamsByYear(currentYear);
        
        if (teamsData && teamsData.length > 0) {
          const convertedTeams = teamsData.map((team, index) => convertApiTeamToTeam(team, index));
          setTeams(convertedTeams);
          showToast(`${teamsData.length} equipes carregadas com sucesso! 👥`, 'success');
        } else {
          // Fallback: tentar dashboard service
          try {
            const topTeams = await dashboardService.getTopTeams(10);
            if (topTeams && topTeams.length > 0) {
              const convertedTeams = topTeams.map((team, index) => convertTopTeamToTeam(team, index));
              setTeams(convertedTeams);
              showToast(`${topTeams.length} equipes carregadas do dashboard! 📊`, 'info');
            } else {
              throw new Error('Nenhuma equipe encontrada');
            }
          } catch (dashboardError) {
            throw new Error('Erro ao carregar dados do dashboard');
          }
        }

      } catch (error) {
        console.error('Erro ao carregar dados das equipes:', error);
        showToast('Erro ao carregar dados. Usando dados de exemplo.', 'error');
        
        // Fallback para dados mockados
        const mockTeamStandings: Team[] = [
          {
            id: 1,
            name: 'Red Bull Racing',
            points: 465,
            members: [
              { id: 1, name: 'João Silva', points: 245, bestResult: 1 },
              { id: 2, name: 'Pedro Alves', points: 220, bestResult: 2 }
            ] as [TeamMember, TeamMember],
            lastPosition: 1,
            bestResult: 1,
          },
          {
            id: 2,
            name: 'Ferrari',
            points: 398,
            members: [
              { id: 3, name: 'Maria Santos', points: 220, bestResult: 1 },
              { id: 4, name: 'Carlos Lima', points: 178, bestResult: 3 }
            ] as [TeamMember, TeamMember],
            lastPosition: 2,
            bestResult: 1,
          },
          {
            id: 3,
            name: 'Mercedes',
            points: 385,
            members: [
              { id: 5, name: 'Pedro Oliveira', points: 198, bestResult: 2 },
              { id: 6, name: 'Ana Silva', points: 187, bestResult: 2 }
            ] as [TeamMember, TeamMember],
            lastPosition: 3,
            bestResult: 2,
          }
        ];
        setTeams(mockTeamStandings);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamsData();
  }, []);

  const handleRefreshTeams = async () => {
    try {
      showToast('Atualizando dados das equipes...', 'info');
      const currentYear = new Date().getFullYear();
      
      const teamsData = await teamsService.getTeamsByYear(currentYear);
      
      if (teamsData && teamsData.length > 0) {
        const convertedTeams = teamsData.map((team, index) => convertApiTeamToTeam(team, index));
        setTeams(convertedTeams);
        showToast('Dados das equipes atualizados com sucesso! 🔄', 'success');
      } else {
        showToast('Nenhuma equipe encontrada para o ano atual.', 'info');
      }
    } catch (error) {
      console.error('Erro ao atualizar dados das equipes:', error);
      showToast('Erro ao atualizar dados. Tente novamente.', 'error');
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
              <p className="text-gray-600 text-lg">Carregando dados das equipes...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const bestTeam = teams[0];
  const averagePoints = teams.length > 0 ? Math.round(teams.reduce((sum, team) => sum + team.points, 0) / teams.length) : 0;
  const strongestPair = bestTeam ? `${bestTeam.members[0].name} e ${bestTeam.members[1].name}` : 'N/A';

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
              <h1 className="text-3xl font-bold text-gray-900">Classificação de Equipes</h1>
              <p className="text-gray-600 mt-2">
                Acompanhe o desempenho das equipes e seus palpiteiros na temporada
              </p>
            </div>
            <button
              onClick={handleRefreshTeams}
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
                  {teams.length > 0 ? `${teams.length} equipes ativas` : 'Carregando...'}
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

            {teams.length > 0 ? (
              <TeamStandingsTable standings={teams} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhum dado de equipe disponível</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Melhor Equipe</h3>
            <p className="text-3xl font-bold text-f1-red">
              {bestTeam?.name || 'N/A'}
            </p>
            <p className="text-gray-600">
              {bestTeam ? `${bestTeam.points} pontos na temporada` : 'Dados não disponíveis'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Média por Equipe</h3>
            <p className="text-3xl font-bold text-f1-red">{averagePoints}</p>
            <p className="text-gray-600">pontos por equipe</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Dupla Mais Forte</h3>
            <p className="text-3xl font-bold text-f1-red">
              {bestTeam ? `${bestTeam.points} pts` : 'N/A'}
            </p>
            <p className="text-gray-600">{strongestPair}</p>
          </div>
        </div>
      </div>
    </main>
  );
} 