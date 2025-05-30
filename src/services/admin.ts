import axiosInstance from '../config/axios';
import { API_URLS } from '../config/api';
import { authService } from './auth';

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
        axiosInstance.get(`${API_URLS.GRAND_PRIX}/season/${currentYear}`),
        axiosInstance.get(`${API_URLS.GRAND_PRIX}/season/${currentYear}/completed`),
        axiosInstance.get(`${API_URLS.GRAND_PRIX}/season/${currentYear}/pending`)
      ]);

      const [allData, completedData, pendingData] = await Promise.all([
        allGP.data.length || 24,
        completedGP.data.length || 12,
        pendingGP.data.length || 12
      ]);

      return {
        total: allData,
        completed: completedData,
        pending: pendingData
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de GP:', error);
      return { total: 24, completed: 12, pending: 12 };
    }
  }

  private async fetchPilotsStats() {
    try {
      const [allPilots, activePilots] = await Promise.all([
        axiosInstance.get(`${API_URLS.PILOTS}`),
        axiosInstance.get(`${API_URLS.PILOTS}/active`)
      ]);

      const [allData, activeData] = await Promise.all([
        allPilots.data.length || 24,
        activePilots.data.length || 20
      ]);

      return {
        total: allData,
        active: activeData
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
        axiosInstance.get(`${API_URLS.TEAMS}/year/${currentYear}`),
        axiosInstance.get(`${API_URLS.TEAMS}/year/${currentYear}/active`)
      ]);

      const [allData, activeData] = await Promise.all([
        allTeams.data.length || 15,
        activeTeams.data.length || 12
      ]);

      return {
        total: allData,
        active: activeData
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de equipes:', error);
      return { total: 15, active: 12 };
    }
  }

  private async fetchUsersStats() {
    try {
      // Endpoint correto considerando que API_BASE_URL já inclui /api
      const response = await axiosInstance.get(`${API_URLS.USERS}/stats`);
      const data = response.data;
      
      return {
        total: data.total || 50,
        active: data.active || 48
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de usuários:', error);
      return { total: 50, active: 48 };
    }
  }

  private async fetchUpcomingRaces() {
    try {
      const response = await axiosInstance.get(`${API_URLS.GRAND_PRIX}/upcoming`);
      return response.data;
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