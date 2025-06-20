import axiosInstance from '../config/axios';
import { API_URLS } from '../config/api';

export interface NextRace {
  id: number;
  name: string;
  circuitName: string;
  city: string;
  country: string;
  season: number;
  round: number;
  raceDateTime: string;
  qualifyingDateTime?: string;
  practice1DateTime?: string;
  practice2DateTime?: string;
  practice3DateTime?: string;
  sprintDateTime?: string;
  timezone?: string;
  laps?: number;
  circuitLength?: number;
  isSprintWeekend?: boolean;
  active: boolean;
  completed: boolean;
  // Campos legados para compatibilidade
  circuit?: string;
  date?: string;
  time?: string;
  location?: string;
}

export interface LastResult {
  grandPrixName: string;
  qualifyingResults: PilotResult[];
  raceResults: PilotResult[];
  qualifyingGuesses: ParticipantGuess[];
  raceGuesses: ParticipantGuess[];
}

export interface PilotResult {
  position: number;
  pilotName: string;
  teamName: string;
}

export interface TopUser {
  id: number;
  name: string;
  email: string;
  totalScore: number;
  position: number;
  lastPosition?: number;
  teamName?: string;
  teamId?: number;
}

export interface TopTeam {
  id: number;
  name: string;
  totalScore: number;
  position: number;
  memberCount: number;
  topMembers: {
    name: string;
    score: number;
  }[];
}

export interface DashboardStats {
  totalUsers: number;
  totalPredictions: number;
  totalRaces: number;
  averageScore: number;
  totalEvents: number;
  totalGuesses: number;
  averageGuessesPerRace: number;
  bestScore: {
    score: number;
    userName: string;
    grandPrixName: string;
  };
}

export interface DashboardData {
  nextRace: NextRace | null;
  lastResult: LastResult | null;
  topUsers: TopUser[];
  topTeams: TopTeam[];
  stats: DashboardStats;
}

export interface ParticipantGuess {
  userId: number;
  userName: string;
  userEmail: string;
  teamName: string;
  score: number;
  position: number;
  hasGuess: boolean;
}

class DashboardService {
  private readonly baseUrl = API_URLS.DASHBOARD;

  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await axiosInstance.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  }

  async getTopUsers(limit: number = 10, season: number = 2025): Promise<TopUser[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/top-users`, {
        params: { limit, season }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar top usuários:', error);
      return [];
    }
  }

  async getTopTeams(limit: number = 10, season: number = 2025): Promise<TopTeam[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/top-teams`, {
        params: { limit, season }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar top equipes:', error);
      return [];
    }
  }

  async getStats(): Promise<DashboardStats> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/stats`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      throw error;
    }
  }

  async getNextRace(): Promise<NextRace | null> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/next-race`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Erro ao buscar próxima corrida:', error);
      return null;
    }
  }

  async getNextRaces(limit: number = 5): Promise<NextRace[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/next-races`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      console.error('Erro ao buscar próximas corridas:', error);
      return [];
    }
  }

  async getLastResult(): Promise<LastResult | null> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/last-result`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Erro ao buscar último resultado:', error);
      return null;
    }
  }

  async getUserPreviewData(userId: number): Promise<any> {
    try {
      const response = await axiosInstance.get(`${API_URLS.GUESSES}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados de preview do usuário:', error);
      return [];
    }
  }
}

export const dashboardService = new DashboardService(); 