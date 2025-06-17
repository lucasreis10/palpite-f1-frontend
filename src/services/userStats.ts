import axiosInstance from '../config/axios';
import { API_URLS } from '../config/api';

// Interfaces correspondentes ao backend
export interface UserStatsResponse {
  userId: number;
  userName: string;
  userEmail: string;
  season: number;
  generalStats: GeneralStats;
  scoreEvolution: ScoreEvolution[];
  positionAccuracy: PositionAccuracy[];
  pilotPerformance: PilotPerformance[];
  circuitPerformance: CircuitTypePerformance[];
  weatherPerformance: WeatherPerformance[];
}

export interface GeneralStats {
  totalScore: number;
  averageScore: number;
  bestEventScore: number;
  bestEventName: string;
  totalGuesses: number;
  eventsParticipated: number;
  currentRanking: number;
  totalParticipants: number;
  qualifyingScore: number;
  raceScore: number;
  qualifyingAverage: number;
  raceAverage: number;
}

export interface ScoreEvolution {
  grandPrixId: number;
  grandPrixName: string;
  country: string;
  round: number;
  qualifyingScore: number;
  raceScore: number;
  totalScore: number;
  cumulativeScore: number;
  position?: number;
  hasQualifyingGuess: boolean;
  hasRaceGuess: boolean;
}

export interface PositionAccuracy {
  position: number;
  positionName: string;
  correctGuesses: number;
  totalGuesses: number;
  accuracy: number;
  averagePoints: number;
  guessType: string;
}

export interface PilotPerformance {
  pilotId: number;
  pilotName: string;
  teamName: string;
  timesGuessed: number;
  correctGuesses: number;
  accuracy: number;
  averagePoints: number;
  bestPosition?: number;
  worstPosition?: number;
}

export interface CircuitTypePerformance {
  circuitType: string;
  eventsParticipated: number;
  averageScore: number;
  bestScore: number;
  bestEvent: string;
  qualifyingAverage: number;
  raceAverage: number;
}

export interface WeatherPerformance {
  weatherCondition: string;
  eventsParticipated: number;
  averageScore: number;
  bestScore: number;
  bestEvent: string;
  qualifyingAverage: number;
  raceAverage: number;
}

class UserStatsService {
  private readonly baseUrl = API_URLS.DASHBOARD;

  async getUserAdvancedStats(userId: number, season: number = 2025): Promise<UserStatsResponse> {
    try {
      console.log(`🔍 Buscando estatísticas avançadas do usuário ${userId} para temporada ${season}`);
      
      const response = await axiosInstance.get(`${this.baseUrl}/user-stats/${userId}`, {
        params: { season }
      });
      
      console.log('✅ Estatísticas avançadas carregadas:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao buscar estatísticas do usuário';
      console.error('❌ Erro ao buscar estatísticas avançadas:', error);
      throw new Error(errorMessage);
    }
  }

  // Método para formatar dados para gráficos
  formatScoreEvolutionForChart(scoreEvolution: ScoreEvolution[]) {
    return scoreEvolution.map(evolution => ({
      name: `${evolution.round}. ${evolution.grandPrixName}`,
      qualifying: evolution.qualifyingScore,
      race: evolution.raceScore,
      total: evolution.totalScore,
      cumulative: evolution.cumulativeScore,
      round: evolution.round,
      country: evolution.country
    }));
  }

  // Método para obter os top 5 pilotos mais apostados
  getTopPilots(pilotPerformance: PilotPerformance[], limit: number = 5) {
    return pilotPerformance
      .sort((a, b) => b.timesGuessed - a.timesGuessed)
      .slice(0, limit);
  }

  // Método para obter os pilotos com maior taxa de acerto
  getMostAccuratePilots(pilotPerformance: PilotPerformance[], limit: number = 5) {
    return pilotPerformance
      .filter(pilot => pilot.timesGuessed >= 3) // Filtrar apenas pilotos com pelo menos 3 apostas
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, limit);
  }

  // Método para calcular estatísticas resumidas
  calculateSummaryStats(userStats: UserStatsResponse) {
    const { generalStats, positionAccuracy, pilotPerformance } = userStats;
    
    // Taxa de acerto geral
    const totalCorrectGuesses = positionAccuracy.reduce((sum, pos) => sum + pos.correctGuesses, 0);
    const totalGuesses = positionAccuracy.reduce((sum, pos) => sum + pos.totalGuesses, 0);
    const overallAccuracy = totalGuesses > 0 ? (totalCorrectGuesses / totalGuesses) * 100 : 0;
    
    // Piloto mais apostado
    const mostBetPilot = pilotPerformance.length > 0 
      ? pilotPerformance.reduce((max, pilot) => pilot.timesGuessed > max.timesGuessed ? pilot : max)
      : null;
    
    // Piloto com maior taxa de acerto (com pelo menos 3 apostas)
    const qualifiedPilots = pilotPerformance.filter(pilot => pilot.timesGuessed >= 3);
    const mostAccuratePilot = qualifiedPilots.length > 0
      ? qualifiedPilots.reduce((max, pilot) => pilot.accuracy > max.accuracy ? pilot : max)
      : null;

    return {
      overallAccuracy: Math.round(overallAccuracy * 100) / 100,
      mostBetPilot,
      mostAccuratePilot,
      participationRate: generalStats.totalParticipants > 0 
        ? Math.round((generalStats.eventsParticipated / generalStats.totalParticipants) * 100 * 100) / 100
        : 0,
      avgPointsPerEvent: generalStats.eventsParticipated > 0 
        ? Math.round((generalStats.totalScore / generalStats.eventsParticipated) * 100) / 100
        : 0
    };
  }
}

export const userStatsService = new UserStatsService(); 