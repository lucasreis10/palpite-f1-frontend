import axiosInstance from '../config/axios';
import { API_URLS } from '../config/api';
import { authService } from './auth';

export interface GrandPrixEvent {
  id: number;
  season: number;
  round: number;
  name: string;
  country: string;
  city: string;
  circuitName: string;
  circuitUrl?: string;
  fullName: string;
  practice1DateTime?: string;
  practice2DateTime?: string;
  practice3DateTime?: string;
  qualifyingDateTime?: string;
  sprintDateTime?: string;
  raceDateTime: string;
  timezone?: string;
  laps?: number;
  circuitLength?: number;
  description?: string;
  active: boolean;
  completed: boolean;
  isSprintWeekend: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventResult {
  position: number;
  driver: string;
  team: string;
  pilotId?: number;
}

export interface EventStatus {
  status: 'pending' | 'consolidated';
  results: EventResult[];
}

export interface EventWithResults extends GrandPrixEvent {
  qualifying: EventStatus;
  race: EventStatus;
}

export interface CreateEventRequest {
  season: number;
  round: number;
  name: string;
  country: string;
  city: string;
  circuitName: string;
  circuitUrl?: string;
  practice1DateTime?: string;
  practice2DateTime?: string;
  practice3DateTime?: string;
  qualifyingDateTime?: string;
  sprintDateTime?: string;
  raceDateTime: string;
  timezone?: string;
  laps?: number;
  circuitLength?: number;
  description?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
  active?: boolean;
  completed?: boolean;
}

export interface SetResultRequest {
  grandPrixId: number;
  guessType: 'QUALIFYING' | 'RACE';
  realResultPilotIds: number[];
}

export interface CalculateScoresResponse {
  grandPrixId: number;
  guessType: string;
  totalGuesses: number;
  calculatedGuesses: number;
  message: string;
}

export interface CompleteEventResponse {
  grandPrix: GrandPrixEvent;
  scoresCalculated: boolean;
  calculationResults: CalculateScoresResponse[];
  message: string;
  warnings: string[];
}

export interface ImportEventsResponse {
  season: number;
  totalFound: number;
  imported: number;
  skipped: number;
  errors: number;
  errorMessages: string[];
  importedEvents: GrandPrixEvent[];
  message?: string;
}

class EventsService {
  private readonly baseUrl = API_URLS.GRAND_PRIX;

  // ========== BUSCAR EVENTOS ==========

  async getAllEvents(): Promise<GrandPrixEvent[]> {
    try {
      const response = await axiosInstance.get(this.baseUrl);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar todos os eventos:', error);
      throw error;
    }
  }

  async getEventsBySeason(season: number): Promise<GrandPrixEvent[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/season/${season}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar eventos da temporada ${season}:`, error);
      throw error;
    }
  }

  async getActiveEventsBySeason(season: number): Promise<GrandPrixEvent[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/season/${season}/active`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar eventos ativos da temporada ${season}:`, error);
      throw error;
    }
  }

  async getCompletedEventsBySeason(season: number): Promise<GrandPrixEvent[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/season/${season}/completed`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar eventos concluídos da temporada ${season}:`, error);
      throw error;
    }
  }

  async getPendingEventsBySeason(season: number): Promise<GrandPrixEvent[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/season/${season}/pending`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar eventos pendentes da temporada ${season}:`, error);
      throw error;
    }
  }

  async getEventById(id: number): Promise<GrandPrixEvent> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar evento ${id}:`, error);
      throw error;
    }
  }

  async getUpcomingEvents(): Promise<GrandPrixEvent[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/upcoming`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar próximos eventos:', error);
      throw error;
    }
  }

  async getNextEvent(): Promise<GrandPrixEvent> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/next`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar próximo evento:', error);
      throw error;
    }
  }

  async getAvailableSeasons(): Promise<number[]> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/seasons`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar temporadas disponíveis:', error);
      throw error;
    }
  }

  // ========== GERENCIAR EVENTOS (ADMIN) ==========

  async createEvent(request: CreateEventRequest): Promise<GrandPrixEvent> {
    try {
      const response = await axiosInstance.post(this.baseUrl, request);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao criar evento';
      console.error('Erro ao criar evento:', error);
      throw new Error(errorMessage);
    }
  }

  async updateEvent(id: number, request: UpdateEventRequest): Promise<GrandPrixEvent> {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/${id}`, request);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao atualizar evento';
      console.error(`Erro ao atualizar evento ${id}:`, error);
      throw new Error(errorMessage);
    }
  }

  async deleteEvent(id: number): Promise<void> {
    try {
      await axiosInstance.delete(`${this.baseUrl}/${id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao deletar evento';
      console.error(`Erro ao deletar evento ${id}:`, error);
      throw new Error(errorMessage);
    }
  }

  async markAsCompleted(id: number): Promise<GrandPrixEvent> {
    try {
      const response = await axiosInstance.patch(`${this.baseUrl}/${id}/complete`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao marcar evento como concluído';
      console.error(`Erro ao marcar evento ${id} como concluído:`, error);
      throw new Error(errorMessage);
    }
  }

  async markAsCompletedWithScoreCalculation(id: number): Promise<CompleteEventResponse> {
    try {
      const response = await axiosInstance.patch(`${this.baseUrl}/${id}/complete-with-scores`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao marcar evento como concluído e calcular pontuações';
      console.error(`Erro ao marcar evento ${id} como concluído e calcular pontuações:`, error);
      throw new Error(errorMessage);
    }
  }

  async markAsPending(id: number): Promise<GrandPrixEvent> {
    try {
      const response = await axiosInstance.patch(`${this.baseUrl}/${id}/pending`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao marcar evento como pendente';
      console.error(`Erro ao marcar evento ${id} como pendente:`, error);
      throw new Error(errorMessage);
    }
  }

  async importEventsFromJolpica(season: number): Promise<ImportEventsResponse> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/import/${season}`);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao importar eventos da API jolpica-f1';
      console.error(`Erro ao importar eventos da temporada ${season}:`, error);
      throw new Error(errorMessage);
    }
  }

  // ========== RESULTADOS ==========

  async setRealResultAndCalculateScores(request: SetResultRequest): Promise<CalculateScoresResponse> {
    try {
      const response = await axiosInstance.post('/guesses/admin/calculate-scores', request);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data || error.message || 'Erro ao definir resultado e calcular pontuações';
      console.error('Erro ao definir resultado e calcular pontuações:', error);
      throw new Error(errorMessage);
    }
  }

  // ========== UTILITÁRIOS ==========

  async getEventResults(grandPrixId: number, guessType: 'QUALIFYING' | 'RACE'): Promise<EventResult[]> {
    try {
      const response = await axiosInstance.get(`/guesses/grand-prix/${grandPrixId}?guessType=${guessType}`);
      const guesses = response.data;
      
      // Procurar por um palpite que tenha resultado real definido
      const guessWithRealResult = guesses.find((guess: any) => 
        guess.realResultPilots && guess.realResultPilots.length > 0
      );

      if (guessWithRealResult) {
        // Converter resultado real para formato EventResult
        return guessWithRealResult.realResultPilots.map((pilot: any, index: number) => ({
          position: index + 1,
          driver: `${pilot.givenName} ${pilot.familyName}`,
          team: typeof pilot.constructor === 'string' ? pilot.constructor : 
                (pilot.constructor?.name || 'F1 Team'), // Garantir que seja string
          pilotId: pilot.id
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Erro ao buscar resultados do evento ${grandPrixId} tipo ${guessType}:`, error);
      return [];
    }
  }

  async getEventsWithResults(season: number): Promise<EventWithResults[]> {
    try {
      const events = await this.getEventsBySeason(season);
      
      // Para cada evento, buscar os resultados (se existirem)
      const eventsWithResults: EventWithResults[] = await Promise.all(
        events.map(async (event) => {
          // Buscar resultados reais da API
          const qualifyingResults = await this.getEventResults(event.id, 'QUALIFYING');
          const raceResults = await this.getEventResults(event.id, 'RACE');

          const qualifying: EventStatus = {
            status: qualifyingResults.length > 0 ? 'consolidated' : 'pending',
            results: qualifyingResults
          };

          const race: EventStatus = {
            status: raceResults.length > 0 ? 'consolidated' : 'pending',
            results: raceResults
          };

          return {
            ...event,
            qualifying,
            race
          };
        })
      );

      return eventsWithResults;
    } catch (error) {
      console.error(`Erro ao buscar eventos com resultados da temporada ${season}:`, error);
      throw error;
    }
  }

  formatEventDate(dateTime: string): string {
    try {
      const date = new Date(dateTime);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  }

  formatEventDateTime(dateTime: string): string {
    try {
      const date = new Date(dateTime);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  }
}

export const eventsService = new EventsService(); 