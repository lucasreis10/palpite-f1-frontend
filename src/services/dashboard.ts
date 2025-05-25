import { authService } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api';

export interface NextRace {
  id: number;
  name: string;
  circuit: string;
  date: string;
  time: string;
  location: string;
  country: string;
  season: number;
}

export interface LastResult {
  grandPrixName: string;
  qualifyingResults: PilotResult[];
  raceResults: PilotResult[];
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
  bestScore: {
    score: number;
    userName: string;
    grandPrixName: string;
  };
  totalGuesses: number;
  averageGuessesPerRace: number;
  totalUsers: number;
  totalRaces: number;
}

class DashboardService {
  private readonly baseUrl = API_BASE_URL;

  async getNextRaces(): Promise<NextRace[]> {
    try {
      const response = await fetch(`${this.baseUrl}/grand-prix/upcoming`);
      if (!response.ok) {
        throw new Error('Erro ao buscar próximas corridas');
      }
      const data = await response.json();
      
      // Mapear os dados do backend para o formato esperado
      return data.map((gp: any) => ({
        id: gp.id,
        name: gp.name,
        circuit: gp.circuitName,
        date: new Date(gp.raceDateTime).toLocaleDateString('pt-BR'),
        time: new Date(gp.raceDateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        location: gp.location,
        country: gp.country,
        season: gp.season,
      }));
    } catch (error) {
      console.error('Erro ao buscar próximas corridas:', error);
      return [];
    }
  }

  async getLastResult(): Promise<LastResult | null> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/last-result`);
      if (!response.ok) {
        throw new Error('Erro ao buscar último resultado');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar último resultado:', error);
      return null;
    }
  }

  async getTopUsers(limit: number = 10): Promise<TopUser[]> {
    try {
      const currentYear = new Date().getFullYear();
      const response = await fetch(`${this.baseUrl}/dashboard/top-users?limit=${limit}&season=${currentYear}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar ranking de usuários');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar ranking de usuários:', error);
      return [];
    }
  }

  async getTopTeams(limit: number = 5): Promise<TopTeam[]> {
    try {
      const currentYear = new Date().getFullYear();
      const response = await fetch(`${this.baseUrl}/teams/ranking/season/${currentYear}?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar ranking de equipes');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar ranking de equipes:', error);
      return [];
    }
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${this.baseUrl}/dashboard/stats`);
      if (!response.ok) {
        throw new Error('Erro ao buscar estatísticas');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return {
        bestScore: { score: 0, userName: '', grandPrixName: '' },
        totalGuesses: 0,
        averageGuessesPerRace: 0,
        totalUsers: 0,
        totalRaces: 0,
      };
    }
  }

  async getUserGuesses(userId: number): Promise<any[]> {
    try {
      const response = await authService.authenticatedFetch(`${this.baseUrl}/guesses/user/${userId}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar palpites do usuário');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar palpites do usuário:', error);
      return [];
    }
  }
}

export const dashboardService = new DashboardService(); 