import { authService } from './auth';

const API_BASE_URL = 'https://javaspringboot-production-a2d3.up.railway.app/api/';

export interface UserSummary {
  id: number;
  name: string;
  email: string;
}

export interface UserTeam {
  id: number;
  name: string;
  year: number;
  user1: UserSummary;
  user2: UserSummary;
  totalScore: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserTeamRequest {
  name: string;
  year: number;
  user1Id: number;
  user2Id: number;
}

export interface UpdateUserTeamRequest {
  name?: string;
  totalScore?: number;
  active?: boolean;
}

export interface UserTeamStats {
  totalTeams: number;
  activeTeams: number;
  inactiveTeams: number;
  yearsCount: number;
  averageScore: number;
}

class UserTeamsService {
  private readonly baseUrl = API_BASE_URL;

  // ========== BUSCAR EQUIPES ==========

  async getAllTeams(): Promise<UserTeam[]> {
    try {
      const response = await fetch(`${this.baseUrl}/teams`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar equipes');
    } catch (error) {
      console.error('Erro ao buscar todas as equipes:', error);
      throw error;
    }
  }

  async getTeamsByYear(year: number): Promise<UserTeam[]> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/year/${year}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar equipes do ano');
    } catch (error) {
      console.error(`Erro ao buscar equipes do ano ${year}:`, error);
      throw error;
    }
  }

  async getActiveTeamsByYear(year: number): Promise<UserTeam[]> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/year/${year}/active`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar equipes ativas');
    } catch (error) {
      console.error(`Erro ao buscar equipes ativas do ano ${year}:`, error);
      throw error;
    }
  }

  async getRankingByYear(year: number): Promise<UserTeam[]> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/year/${year}/ranking`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar ranking de equipes');
    } catch (error) {
      console.error(`Erro ao buscar ranking do ano ${year}:`, error);
      throw error;
    }
  }

  async getTeamById(id: number): Promise<UserTeam> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/${id}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Equipe não encontrada');
    } catch (error) {
      console.error(`Erro ao buscar equipe ${id}:`, error);
      throw error;
    }
  }

  async getTeamByNameAndYear(name: string, year: number): Promise<UserTeam> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/name/${encodeURIComponent(name)}/year/${year}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Equipe não encontrada');
    } catch (error) {
      console.error(`Erro ao buscar equipe ${name} do ano ${year}:`, error);
      throw error;
    }
  }

  async getUserTeams(userId: number): Promise<UserTeam[]> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/user/${userId}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar equipes do usuário');
    } catch (error) {
      console.error(`Erro ao buscar equipes do usuário ${userId}:`, error);
      throw error;
    }
  }

  async getUserTeamByYear(userId: number, year: number): Promise<UserTeam> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/user/${userId}/year/${year}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Usuário não possui equipe no ano');
    } catch (error) {
      console.error(`Erro ao buscar equipe do usuário ${userId} no ano ${year}:`, error);
      throw error;
    }
  }

  async searchTeamsByName(name: string): Promise<UserTeam[]> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/search?name=${encodeURIComponent(name)}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar equipes por nome');
    } catch (error) {
      console.error(`Erro ao buscar equipes por nome ${name}:`, error);
      throw error;
    }
  }

  // ========== OPERAÇÕES ADMINISTRATIVAS ==========

  async createTeam(request: CreateUserTeamRequest): Promise<UserTeam> {
    try {
      const response = await fetch(`${this.baseUrl}/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return await response.json();
      }
      
      const errorData = await response.text();
      throw new Error(errorData || 'Erro ao criar equipe');
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      throw error;
    }
  }

  async updateTeam(id: number, request: UpdateUserTeamRequest): Promise<UserTeam> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return await response.json();
      }
      
      const errorData = await response.text();
      throw new Error(errorData || 'Erro ao atualizar equipe');
    } catch (error) {
      console.error(`Erro ao atualizar equipe ${id}:`, error);
      throw error;
    }
  }

  async deleteTeam(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/teams/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Erro ao deletar equipe');
      }
    } catch (error) {
      console.error(`Erro ao deletar equipe ${id}:`, error);
      throw error;
    }
  }

  async activateTeam(id: number): Promise<UserTeam> {
    try {
      return await this.updateTeam(id, { active: true });
    } catch (error) {
      console.error(`Erro ao ativar equipe ${id}:`, error);
      throw error;
    }
  }

  async deactivateTeam(id: number): Promise<UserTeam> {
    try {
      return await this.updateTeam(id, { active: false });
    } catch (error) {
      console.error(`Erro ao inativar equipe ${id}:`, error);
      throw error;
    }
  }

  // ========== ESTATÍSTICAS ==========

  async getTeamStats(): Promise<UserTeamStats> {
    try {
      const allTeams = await this.getAllTeams();
      const activeTeams = allTeams.filter(team => team.active);
      const inactiveTeams = allTeams.filter(team => !team.active);
      const years = new Set(allTeams.map(team => team.year));
      const totalScore = allTeams.reduce((sum, team) => sum + team.totalScore, 0);
      const averageScore = allTeams.length > 0 ? Math.round(totalScore / allTeams.length) : 0;

      return {
        totalTeams: allTeams.length,
        activeTeams: activeTeams.length,
        inactiveTeams: inactiveTeams.length,
        yearsCount: years.size,
        averageScore,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de equipes:', error);
      throw error;
    }
  }

  // ========== UTILITÁRIOS ==========

  formatTeamName(team: UserTeam): string {
    return team.name;
  }

  formatTeamMembers(team: UserTeam): string {
    return `${team.user1.name} & ${team.user2.name}`;
  }

  getTeamsByStatus(teams: UserTeam[], active: boolean): UserTeam[] {
    return teams.filter(team => team.active === active);
  }

  filterTeamsByYear(teams: UserTeam[], year: number): UserTeam[] {
    return teams.filter(team => team.year === year);
  }

  searchTeams(teams: UserTeam[], searchTerm: string): UserTeam[] {
    const term = searchTerm.toLowerCase();
    return teams.filter(team =>
      team.name.toLowerCase().includes(term) ||
      team.user1.name.toLowerCase().includes(term) ||
      team.user2.name.toLowerCase().includes(term) ||
      team.user1.email.toLowerCase().includes(term) ||
      team.user2.email.toLowerCase().includes(term)
    );
  }

  sortTeamsByName(teams: UserTeam[]): UserTeam[] {
    return [...teams].sort((a, b) => a.name.localeCompare(b.name));
  }

  sortTeamsByScore(teams: UserTeam[]): UserTeam[] {
    return [...teams].sort((a, b) => b.totalScore - a.totalScore);
  }

  sortTeamsByYear(teams: UserTeam[]): UserTeam[] {
    return [...teams].sort((a, b) => b.year - a.year);
  }

  getUniqueYears(teams: UserTeam[]): number[] {
    const years = new Set(teams.map(team => team.year));
    return Array.from(years).sort((a, b) => b - a);
  }

  // ========== VALIDAÇÕES ==========

  validateTeamData(data: CreateUserTeamRequest | UpdateUserTeamRequest): string[] {
    const errors: string[] = [];

    if ('name' in data && data.name !== undefined) {
      if (!data.name.trim()) {
        errors.push('Nome da equipe é obrigatório');
      } else if (data.name.length < 3) {
        errors.push('Nome da equipe deve ter pelo menos 3 caracteres');
      } else if (data.name.length > 100) {
        errors.push('Nome da equipe deve ter no máximo 100 caracteres');
      }
    }

    if ('year' in data && data.year !== undefined) {
      const currentYear = new Date().getFullYear();
      if (data.year < 2020 || data.year > currentYear + 1) {
        errors.push(`Ano deve estar entre 2020 e ${currentYear + 1}`);
      }
    }

    if ('user1Id' in data && 'user2Id' in data && data.user1Id !== undefined && data.user2Id !== undefined) {
      if (data.user1Id === data.user2Id) {
        errors.push('Uma equipe deve ter dois usuários diferentes');
      }
    }

    if ('totalScore' in data && data.totalScore !== undefined) {
      if (data.totalScore < 0) {
        errors.push('Pontuação total deve ser maior ou igual a 0');
      } else if (data.totalScore > 10000) {
        errors.push('Pontuação total deve ser menor ou igual a 10000');
      }
    }

    return errors;
  }

  isValidTeamName(name: string): boolean {
    return name.trim().length >= 3 && name.trim().length <= 100;
  }

  isValidYear(year: number): boolean {
    const currentYear = new Date().getFullYear();
    return year >= 2020 && year <= currentYear + 1;
  }
}

export const userTeamsService = new UserTeamsService(); 