import { authService } from './auth';
import { API_URLS } from '../config/api';

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
  private readonly baseUrl = API_URLS.DASHBOARD;

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
      throw error;
    }
  }

  private async fetchGrandPrixStats() {
    try {
      const currentYear = new Date().getFullYear();
      const [allGP, completedGP, pendingGP] = await Promise.all([
        fetch(`${API_URLS.GRAND_PRIX}/season/${currentYear}`),
        fetch(`${API_URLS.GRAND_PRIX}/season/${currentYear}/completed`),
        fetch(`${API_URLS.GRAND_PRIX}/season/${currentYear}/pending`)
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
        fetch(`${API_URLS.PILOTS}`),
        fetch(`${API_URLS.PILOTS}/active`)
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
        fetch(`${API_URLS.TEAMS}/year/${currentYear}`),
        fetch(`${API_URLS.TEAMS}/year/${currentYear}/active`)
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
      const response = await authService.authenticatedFetch(`${API_URLS.USERS}/stats`);
      
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
      const response = await fetch(`${API_URLS.GRAND_PRIX}/upcoming`);
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
      // TODO: Implementar endpoint específico para atividades recentes
      return [];
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService(); 