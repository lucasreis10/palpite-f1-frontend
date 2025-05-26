import { authService } from './auth';
import { API_URLS } from '../config/api';

export interface Constructor {
  id: number;
  constructorId: string;
  name: string;
  nationality: string;
  url?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pilot {
  id: number;
  driverId: string;
  givenName: string;
  familyName: string;
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  url?: string;
  permanentNumber?: number;
  code?: string;
  constructor?: Constructor;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePilotRequest {
  driverId: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  url?: string;
  permanentNumber?: number;
  code?: string;
}

export interface UpdatePilotRequest {
  givenName?: string;
  familyName?: string;
  dateOfBirth?: string;
  nationality?: string;
  url?: string;
  permanentNumber?: number;
  code?: string;
  active?: boolean;
}

export interface PilotStats {
  totalPilots: number;
  activePilots: number;
  inactivePilots: number;
  nationalitiesCount: number;
}

class PilotsService {
  private readonly baseUrl = API_URLS.PILOTS;

  // ========== BUSCAR PILOTOS ==========

  async getAllPilots(): Promise<Pilot[]> {
    try {
      const response = await fetch(`${this.baseUrl}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar pilotos');
    } catch (error) {
      console.error('Erro ao buscar todos os pilotos:', error);
      throw error;
    }
  }

  async getActivePilots(): Promise<Pilot[]> {
    try {
      const response = await fetch(`${this.baseUrl}/active`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar pilotos ativos');
    } catch (error) {
      console.error('Erro ao buscar pilotos ativos:', error);
      throw error;
    }
  }

  async getPilotsByStatus(active: boolean): Promise<Pilot[]> {
    try {
      const response = await fetch(`${this.baseUrl}/status/${active}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar pilotos por status');
    } catch (error) {
      console.error(`Erro ao buscar pilotos por status ${active}:`, error);
      throw error;
    }
  }

  async getPilotById(id: number): Promise<Pilot> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Piloto não encontrado');
    } catch (error) {
      console.error(`Erro ao buscar piloto ${id}:`, error);
      throw error;
    }
  }

  async getPilotByDriverId(driverId: string): Promise<Pilot> {
    try {
      const response = await fetch(`${this.baseUrl}/driver/${driverId}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Piloto não encontrado');
    } catch (error) {
      console.error(`Erro ao buscar piloto por driverId ${driverId}:`, error);
      throw error;
    }
  }

  async searchPilotsByName(name: string): Promise<Pilot[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?name=${encodeURIComponent(name)}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar pilotos por nome');
    } catch (error) {
      console.error(`Erro ao buscar pilotos por nome ${name}:`, error);
      throw error;
    }
  }

  async searchActivePilotsByName(name: string): Promise<Pilot[]> {
    try {
      const response = await fetch(`${this.baseUrl}/active/search?name=${encodeURIComponent(name)}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar pilotos ativos por nome');
    } catch (error) {
      console.error(`Erro ao buscar pilotos ativos por nome ${name}:`, error);
      throw error;
    }
  }

  async getPilotsByNationality(nationality: string): Promise<Pilot[]> {
    try {
      const response = await fetch(`${this.baseUrl}/nationality/${nationality}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar pilotos por nacionalidade');
    } catch (error) {
      console.error(`Erro ao buscar pilotos por nacionalidade ${nationality}:`, error);
      throw error;
    }
  }

  async getActivePilotsByNationality(nationality: string): Promise<Pilot[]> {
    try {
      const response = await fetch(`${this.baseUrl}/active/nationality/${nationality}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar pilotos ativos por nacionalidade');
    } catch (error) {
      console.error(`Erro ao buscar pilotos ativos por nacionalidade ${nationality}:`, error);
      throw error;
    }
  }

  // ========== GERENCIAR PILOTOS (ADMIN) ==========

  async createPilot(request: CreatePilotRequest): Promise<Pilot> {
    try {
      const response = await authService.authenticatedFetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao criar piloto');
    } catch (error) {
      console.error('Erro ao criar piloto:', error);
      throw error;
    }
  }

  async updatePilot(id: number, request: UpdatePilotRequest): Promise<Pilot> {
    try {
      const response = await authService.authenticatedFetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao atualizar piloto');
    } catch (error) {
      console.error(`Erro ao atualizar piloto ${id}:`, error);
      throw error;
    }
  }

  async deletePilot(id: number): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar piloto');
      }
    } catch (error) {
      console.error(`Erro ao deletar piloto ${id}:`, error);
      throw error;
    }
  }

  async activatePilot(id: number): Promise<Pilot> {
    try {
      const response = await authService.authenticatedFetch(`${this.baseUrl}/${id}/activate`, {
        method: 'PATCH',
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao ativar piloto');
    } catch (error) {
      console.error(`Erro ao ativar piloto ${id}:`, error);
      throw error;
    }
  }

  async deactivatePilot(id: number): Promise<Pilot> {
    try {
      const response = await authService.authenticatedFetch(`${this.baseUrl}/${id}/deactivate`, {
        method: 'PATCH',
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao inativar piloto');
    } catch (error) {
      console.error(`Erro ao inativar piloto ${id}:`, error);
      throw error;
    }
  }

  // ========== ESTATÍSTICAS ==========

  async getPilotStats(): Promise<PilotStats> {
    try {
      const allPilots = await this.getAllPilots();
      const activePilots = allPilots.filter(pilot => pilot.active);
      const inactivePilots = allPilots.filter(pilot => !pilot.active);
      const nationalities = new Set(allPilots.map(pilot => pilot.nationality));

      return {
        totalPilots: allPilots.length,
        activePilots: activePilots.length,
        inactivePilots: inactivePilots.length,
        nationalitiesCount: nationalities.size,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de pilotos:', error);
      throw error;
    }
  }

  // ========== UTILITÁRIOS ==========

  formatPilotName(pilot: Pilot): string {
    return pilot.fullName || `${pilot.givenName} ${pilot.familyName}`;
  }

  formatDateOfBirth(dateOfBirth: string): string {
    try {
      const date = new Date(dateOfBirth);
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  }

  calculateAge(dateOfBirth: string): number {
    try {
      const birth = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      
      return age;
    } catch (error) {
      return 0;
    }
  }

  getTeamName(pilot: Pilot): string {
    return pilot.constructor?.name || 'Sem equipe';
  }

  generateDriverId(givenName: string, familyName: string): string {
    // Gera um driverId baseado no nome (ex: "max_verstappen")
    const firstName = givenName.toLowerCase().replace(/[^a-z]/g, '');
    const lastName = familyName.toLowerCase().replace(/[^a-z]/g, '');
    return `${firstName}_${lastName}`;
  }

  generateDriverCode(givenName: string, familyName: string): string {
    // Gera um código de 3 letras (ex: "VER" para Verstappen)
    const firstInitial = givenName.charAt(0).toUpperCase();
    const lastNamePart = familyName.substring(0, 2).toUpperCase();
    return `${firstInitial}${lastNamePart}`;
  }
}

export const pilotsService = new PilotsService(); 