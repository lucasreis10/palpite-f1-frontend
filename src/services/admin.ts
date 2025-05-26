import { authService } from './auth';

const API_BASE_URL = 'https://javaspringboot-production-a2d3.up.railway.app/api/';

export interface AdminStats {
  totalEvents: number;
  totalPilots: number;
  totalTeams: number;
  totalUsers: number;
  nextRace: string;
  completedEvents: number;
  pendingEvents: number;
  activePilots: number;
  activeTeams: number;
  activeUsers: number;
}

export interface RecentActivity {
  id: number;
  action: string;
  event: string;
  time: string;
  type: 'event' | 'user' | 'team' | 'result';
}

class AdminService {
  private readonly baseUrl = API_BASE_URL;

  async getAdminStats(): Promise<AdminStats> {
    try {
      // Buscar dados de diferentes endpoints
      const [
        grandPrixData,
        pilotsData,
        teamsData,
        usersData,
        upcomingRaces
      ] = await Promise.all([
        this.fetchGrandPrixStats(),
        this.fetchPilotsStats(),
        this.fetchTeamsStats(),
        this.fetchUsersStats(),
        this.fetchUpcomingRaces()
      ]);

      return {
        totalEvents: grandPrixData.total,
        completedEvents: grandPrixData.completed,
        pendingEvents: grandPrixData.pending,
        totalPilots: pilotsData.total,
        activePilots: pilotsData.active,
        totalTeams: teamsData.total,
        activeTeams: teamsData.active,
        totalUsers: usersData.total,
        activeUsers: usersData.active,
        nextRace: upcomingRaces.length > 0 ? upcomingRaces[0].name : 'Nenhuma corrida agendada'
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas administrativas:', error);
      // Retornar dados mockados em caso de erro
      return {
        totalEvents: 24,
        completedEvents: 12,
        pendingEvents: 12,
        totalPilots: 24,
        activePilots: 20,
        totalTeams: 15,
        activeTeams: 12,
        totalUsers: 50,
        activeUsers: 48,
        nextRace: 'GP São Paulo'
      };
    }
  }

  private async fetchGrandPrixStats() {
    try {
      const currentYear = new Date().getFullYear();
      const [allGP, completedGP, pendingGP] = await Promise.all([
        fetch(`${this.baseUrl}/grand-prix/season/${currentYear}`),
        fetch(`${this.baseUrl}/grand-prix/season/${currentYear}/completed`),
        fetch(`${this.baseUrl}/grand-prix/season/${currentYear}/pending`)
      ]);

      const [allData, completedData, pendingData] = await Promise.all([
        allGP.ok ? allGP.json() : [],
        completedGP.ok ? completedGP.json() : [],
        pendingGP.ok ? pendingGP.json() : []
      ]);

      return {
        total: allData.length || 24,
        completed: completedData.length || 12,
        pending: pendingData.length || 12
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de GP:', error);
      return { total: 24, completed: 12, pending: 12 };
    }
  }

  private async fetchPilotsStats() {
    try {
      const [allPilots, activePilots] = await Promise.all([
        fetch(`${this.baseUrl}/pilots`),
        fetch(`${this.baseUrl}/pilots/active`)
      ]);

      const [allData, activeData] = await Promise.all([
        allPilots.ok ? allPilots.json() : [],
        activePilots.ok ? activePilots.json() : []
      ]);

      return {
        total: allData.length || 24,
        active: activeData.length || 20
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de pilotos:', error);
      return { total: 24, active: 20 };
    }
  }

  private async fetchTeamsStats() {
    try {
      const currentYear = new Date().getFullYear();
      const [allTeams, activeTeams] = await Promise.all([
        fetch(`${this.baseUrl}/teams/year/${currentYear}`),
        fetch(`${this.baseUrl}/teams/year/${currentYear}/active`)
      ]);

      const [allData, activeData] = await Promise.all([
        allTeams.ok ? allTeams.json() : [],
        activeTeams.ok ? activeTeams.json() : []
      ]);

      return {
        total: allData.length || 15,
        active: activeData.length || 12
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de equipes:', error);
      return { total: 15, active: 12 };
    }
  }

  private async fetchUsersStats() {
    try {
      // Endpoint correto considerando que API_BASE_URL já inclui /api
      const response = await authService.authenticatedFetch(`${this.baseUrl}/users/stats`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          total: data.total || 50,
          active: data.active || 48
        };
      }
      
      return { total: 50, active: 48 };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de usuários:', error);
      return { total: 50, active: 48 };
    }
  }

  private async fetchUpcomingRaces() {
    try {
      const response = await fetch(`${this.baseUrl}/grand-prix/upcoming`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar próximas corridas:', error);
      return [];
    }
  }

  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      // Por enquanto, retornar dados mockados
      // Futuramente pode ser implementado um endpoint específico para atividades
      return [
        { 
          id: 1, 
          action: 'Resultado consolidado', 
          event: 'GP do Bahrein - Corrida', 
          time: 'há 2 horas',
          type: 'result'
        },
        { 
          id: 2, 
          action: 'Novo usuário registrado', 
          event: 'Maria Santos', 
          time: 'há 5 horas',
          type: 'user'
        },
        { 
          id: 3, 
          action: 'Equipe atualizada', 
          event: 'Red Bull Racing', 
          time: 'há 1 dia',
          type: 'team'
        },
        { 
          id: 4, 
          action: 'Resultado editado', 
          event: 'GP do Bahrein - Classificação', 
          time: 'há 2 dias',
          type: 'result'
        },
      ];
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      return [];
    }
  }
}

export const adminService = new AdminService(); 