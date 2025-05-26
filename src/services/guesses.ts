import { authService } from './auth';

const API_BASE_URL = 'https://javaspringboot-production-a2d3.up.railway.app/api/';

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
  private readonly baseUrl = API_BASE_URL;

  async getAllPilots(): Promise<Pilot[]> {
    try {
      const response = await fetch(`${this.baseUrl}/pilots/active`);
      if (!response.ok) {
        throw new Error('Erro ao buscar pilotos');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar pilotos:', error);
      return [];
    }
  }

  async getNextGrandPrix(): Promise<NextGrandPrix | null> {
    try {
      const response = await fetch(`${this.baseUrl}/grand-prix/next`);
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Nenhum GP futuro encontrado
        }
        throw new Error('Erro ao buscar próximo Grande Prêmio');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar próximo Grande Prêmio:', error);
      return null;
    }
  }

  async getUserGuessForGrandPrix(userId: number, grandPrixId: number, guessType: 'QUALIFYING' | 'RACE'): Promise<GuessResponse | null> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/guesses/user/${userId}/grand-prix/${grandPrixId}?guessType=${guessType}`
      );
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Usuário ainda não fez palpite
        }
        throw new Error('Erro ao buscar palpite do usuário');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar palpite do usuário:', error);
      return null;
    }
  }

  async createGuess(userId: number, request: CreateGuessRequest): Promise<GuessResponse> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/guesses/user/${userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Erro ao criar palpite');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar palpite:', error);
      throw error;
    }
  }

  async updateGuess(userId: number, guessId: number, request: UpdateGuessRequest): Promise<GuessResponse> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/guesses/user/${userId}/${guessId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Erro ao atualizar palpite');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar palpite:', error);
      throw error;
    }
  }

  async getUserGuesses(userId: number): Promise<GuessResponse[]> {
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

  async getUserGuessesBySeason(userId: number, season: number): Promise<GuessResponse[]> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/guesses/user/${userId}/season/${season}`
      );
      if (!response.ok) {
        throw new Error('Erro ao buscar palpites da temporada');
      }
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar palpites da temporada:', error);
      return [];
    }
  }

  async deleteGuess(userId: number, guessId: number): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(
        `${this.baseUrl}/guesses/user/${userId}/${guessId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao deletar palpite');
      }
    } catch (error) {
      console.error('Erro ao deletar palpite:', error);
      throw error;
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