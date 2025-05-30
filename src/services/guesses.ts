import axiosInstance from '../config/axios';
import { API_URLS } from '../config/api';

export interface Constructor {
  id: number;
  constructorId: string;
  name: string;
  nationality?: string;
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

export interface GuessResponse {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
  grandPrixId: number;
  grandPrixName: string;
  season: number;
  round: number;
  guessType: 'QUALIFYING' | 'RACE';
  pilots: Pilot[];
  realResultPilots?: Pilot[];
  score?: number;
  calculated: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGuessRequest {
  grandPrixId: number;
  guessType: 'QUALIFYING' | 'RACE';
  pilotIds: number[];
}

export interface UpdateGuessRequest {
  pilotIds: number[];
}

export interface NextGrandPrix {
  id: number;
  name: string;
  country: string;
  city: string;
  circuitName: string;
  raceDateTime: string;
  qualifyingDateTime?: string;
  season: number;
  round: number;
  active: boolean;
  completed: boolean;
}

class GuessService {
  private readonly baseUrl = API_URLS.GUESSES;

  async getAllPilots(): Promise<Pilot[]> {
    try {
      const response = await axiosInstance.get(`${API_URLS.PILOTS}/active`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar pilotos:', error);
      return [];
    }
  }

  async getNextGrandPrix(): Promise<NextGrandPrix | null> {
    try {
      const response = await axiosInstance.get(`${API_URLS.GRAND_PRIX}/next`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Nenhum GP futuro encontrado
      }
      console.error('Erro ao buscar próximo Grande Prêmio:', error);
      return null;
    }
  }

  async getUserGuessForGrandPrix(userId: number, grandPrixId: number, guessType: 'QUALIFYING' | 'RACE'): Promise<GuessResponse | null> {
    try {
      const response = await axiosInstance.get(
        `${this.baseUrl}/user/${userId}/grand-prix/${grandPrixId}?guessType=${guessType}`
      );
      
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // Usuário ainda não fez palpite
      }
      console.error('Erro ao buscar palpite do usuário:', error);
      return null;
    }
  }

  async createGuess(userId: number, request: CreateGuessRequest): Promise<GuessResponse> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/user/${userId}`, request);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao criar palpite';
      console.error('Erro ao criar palpite:', error);
      throw new Error(errorMessage);
    }
  }

  async updateGuess(userId: number, guessId: number, request: UpdateGuessRequest): Promise<GuessResponse> {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/user/${userId}/${guessId}`, request);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao atualizar palpite';
      console.error('Erro ao atualizar palpite:', error);
      throw new Error(errorMessage);
    }
  }

  async getUserGuesses(userId: number): Promise<GuessResponse[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar palpites do usuário:', error);
      return [];
    }
  }

  async getUserGuessesBySeason(userId: number, season: number): Promise<GuessResponse[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/user/${userId}/season/${season}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar palpites da temporada:', error);
      return [];
    }
  }

  async deleteGuess(userId: number, guessId: number): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/user/${userId}/${guessId}`);
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao deletar palpite';
      console.error('Erro ao deletar palpite:', error);
      throw new Error(errorMessage);
    }
  }

  // Método auxiliar para verificar se o prazo de palpites ainda está aberto
  isGuessDeadlineOpen(grandPrix: NextGrandPrix, guessType: 'QUALIFYING' | 'RACE'): boolean {
    const now = new Date();
    
    if (guessType === 'QUALIFYING' && grandPrix.qualifyingDateTime) {
      const qualifyingDate = new Date(grandPrix.qualifyingDateTime);
      return now < qualifyingDate;
    } else if (guessType === 'RACE') {
      const raceDate = new Date(grandPrix.raceDateTime);
      return now < raceDate;
    }
    
    return false;
  }

  // Método auxiliar para formatar data/hora do prazo
  getGuessDeadline(grandPrix: NextGrandPrix, guessType: 'QUALIFYING' | 'RACE'): string {
    if (guessType === 'QUALIFYING' && grandPrix.qualifyingDateTime) {
      return new Date(grandPrix.qualifyingDateTime).toLocaleString('pt-BR');
    } else if (guessType === 'RACE') {
      return new Date(grandPrix.raceDateTime).toLocaleString('pt-BR');
    }
    
    return 'Data não disponível';
  }
}

export const guessService = new GuessService(); 