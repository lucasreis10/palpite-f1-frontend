import { authService } from './auth';
import { API_URLS } from '../config/api';

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

class EventsService {
  private readonly baseUrl = API_URLS.GRAND_PRIX;

  // ========== BUSCAR EVENTOS ==========

  async getAllEvents(): Promise<GrandPrixEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar eventos');
    } catch (error) {
      console.error('Erro ao buscar todos os eventos:', error);
      throw error;
    }
  }

  async getEventsBySeason(season: number): Promise<GrandPrixEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/season/${season}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar eventos da temporada');
    } catch (error) {
      console.error(`Erro ao buscar eventos da temporada ${season}:`, error);
      throw error;
    }
  }

  async getActiveEventsBySeason(season: number): Promise<GrandPrixEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/season/${season}/active`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar eventos ativos');
    } catch (error) {
      console.error(`Erro ao buscar eventos ativos da temporada ${season}:`, error);
      throw error;
    }
  }

  async getCompletedEventsBySeason(season: number): Promise<GrandPrixEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/season/${season}/completed`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar eventos concluídos');
    } catch (error) {
      console.error(`Erro ao buscar eventos concluídos da temporada ${season}:`, error);
      throw error;
    }
  }

  async getPendingEventsBySeason(season: number): Promise<GrandPrixEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/season/${season}/pending`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar eventos pendentes');
    } catch (error) {
      console.error(`Erro ao buscar eventos pendentes da temporada ${season}:`, error);
      throw error;
    }
  }

  async getEventById(id: number): Promise<GrandPrixEvent> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Evento não encontrado');
    } catch (error) {
      console.error(`Erro ao buscar evento ${id}:`, error);
      throw error;
    }
  }

  async getUpcomingEvents(): Promise<GrandPrixEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/upcoming`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar próximos eventos');
    } catch (error) {
      console.error('Erro ao buscar próximos eventos:', error);
      throw error;
    }
  }

  async getNextEvent(): Promise<GrandPrixEvent> {
    try {
      const response = await fetch(`${this.baseUrl}/next`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Nenhum próximo evento encontrado');
    } catch (error) {
      console.error('Erro ao buscar próximo evento:', error);
      throw error;
    }
  }

  async getAvailableSeasons(): Promise<number[]> {
    try {
      const response = await fetch(`${this.baseUrl}/seasons`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar temporadas disponíveis');
    } catch (error) {
      console.error('Erro ao buscar temporadas disponíveis:', error);
      throw error;
    }
  }

  // ========== GERENCIAR EVENTOS (ADMIN) ==========

  async createEvent(request: CreateEventRequest): Promise<GrandPrixEvent> {
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
      throw new Error('Erro ao criar evento');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  async updateEvent(id: number, request: UpdateEventRequest): Promise<GrandPrixEvent> {
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
      throw new Error('Erro ao atualizar evento');
    } catch (error) {
      console.error(`Erro ao atualizar evento ${id}:`, error);
      throw error;
    }
  }

  async deleteEvent(id: number): Promise<void> {
    try {
      const response = await authService.authenticatedFetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar evento');
      }
    } catch (error) {
      console.error(`Erro ao deletar evento ${id}:`, error);
      throw error;
    }
  }

  async markAsCompleted(id: number): Promise<GrandPrixEvent> {
    try {
      const response = await authService.authenticatedFetch(`${this.baseUrl}/${id}/complete`, {
        method: 'PATCH',
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao marcar evento como concluído');
    } catch (error) {
      console.error(`Erro ao marcar evento ${id} como concluído:`, error);
      throw error;
    }
  }

  async markAsCompletedWithScoreCalculation(id: number): Promise<CompleteEventResponse> {
    try {
      const response = await authService.authenticatedFetch(`${this.baseUrl}/${id}/complete-with-scores`, {
        method: 'PATCH',
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao marcar evento como concluído e calcular pontuações');
    } catch (error) {
      console.error(`Erro ao marcar evento ${id} como concluído e calcular pontuações:`, error);
      throw error;
    }
  }

  async markAsPending(id: number): Promise<GrandPrixEvent> {
    try {
      const response = await authService.authenticatedFetch(`${this.baseUrl}/${id}/pending`, {
        method: 'PATCH',
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao marcar evento como pendente');
    } catch (error) {
      console.error(`Erro ao marcar evento ${id} como pendente:`, error);
      throw error;
    }
  }

  // ========== RESULTADOS ==========

  async setRealResultAndCalculateScores(request: SetResultRequest): Promise<CalculateScoresResponse> {
    try {
      const response = await authService.authenticatedFetch(`${this.baseUrl}/guesses/admin/calculate-scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao definir resultado e calcular pontuações');
    } catch (error) {
      console.error('Erro ao definir resultado e calcular pontuações:', error);
      throw error;
    }
  }

  // ========== UTILITÁRIOS ==========

  async getEventsWithResults(season: number): Promise<EventWithResults[]> {
    try {
      const events = await this.getEventsBySeason(season);
      
      // Para cada evento, buscar os resultados (se existirem)
      const eventsWithResults: EventWithResults[] = await Promise.all(
        events.map(async (event) => {
          // TODO: Buscar resultados reais da API
          const qualifying: EventStatus = {
            status: 'pending',
            results: []
          };

          const race: EventStatus = {
            status: 'pending',
            results: []
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