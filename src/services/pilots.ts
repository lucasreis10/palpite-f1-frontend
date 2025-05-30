import axiosInstance from '../config/axios';
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
      const response = await axiosInstance.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar todos os pilotos:', error);
      throw error;
    }
  }

  async getActivePilots(): Promise<Pilot[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/active`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pilotos ativos:', error);
      throw error;
    }
  }

  async getPilotsByStatus(active: boolean): Promise<Pilot[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/status/${active}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar pilotos por status ${active}:`, error);
      throw error;
    }
  }

  async getPilotById(id: number): Promise<Pilot> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar piloto ${id}:`, error);
      throw error;
    }
  }

  async getPilotByDriverId(driverId: string): Promise<Pilot> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/driver/${driverId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar piloto por driverId ${driverId}:`, error);
      throw error;
    }
  }

  async searchPilotsByName(name: string): Promise<Pilot[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/search?name=${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar pilotos por nome ${name}:`, error);
      throw error;
    }
  }

  async searchActivePilotsByName(name: string): Promise<Pilot[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/active/search?name=${encodeURIComponent(name)}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar pilotos ativos por nome ${name}:`, error);
      throw error;
    }
  }

  async getPilotsByNationality(nationality: string): Promise<Pilot[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/nationality/${nationality}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar pilotos por nacionalidade ${nationality}:`, error);
      throw error;
    }
  }

  async getActivePilotsByNationality(nationality: string): Promise<Pilot[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/active/nationality/${nationality}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar pilotos ativos por nacionalidade ${nationality}:`, error);
      throw error;
    }
  }

  // ========== GERENCIAR PILOTOS (ADMIN) ==========

  async createPilot(request: CreatePilotRequest): Promise<Pilot> {
    try {
      const response = await axiosInstance.post(this.baseUrl, request);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar piloto:', error);
      throw error;
    }
  }

  async updatePilot(id: number, request: UpdatePilotRequest): Promise<Pilot> {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/${id}`, request);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar piloto ${id}:`, error);
      throw error;
    }
  }

  async deletePilot(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao deletar piloto';
      console.error(`Erro ao deletar piloto ${id}:`, error);
      throw new Error(errorMessage);
    }
  }

  async activatePilot(id: number): Promise<Pilot> {
    try {
      const response = await axiosInstance.patch(`${this.baseUrl}/${id}/activate`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao ativar piloto ${id}:`, error);
      throw error;
    }
  }

  async deactivatePilot(id: number): Promise<Pilot> {
    try {
      const response = await axiosInstance.patch(`${this.baseUrl}/${id}/deactivate`);
      return response.data;
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