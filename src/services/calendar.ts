import { API_URLS } from '../config/api';

export interface CalendarEvent {
  id: number;
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
  timezone: string;
  laps?: number;
  circuitLength?: number;
  description?: string;
  active: boolean;
  completed: boolean;
  isSprintWeekend: boolean;
  bettingDeadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventRequest {
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
  bettingDeadline?: string;
}

export interface UpdateCalendarEventRequest extends Partial<CreateCalendarEventRequest> {
  active?: boolean;
  completed?: boolean;
}

export interface CalendarStats {
  totalEvents: number;
  completedEvents: number;
  pendingEvents: number;
  upcomingEvents: number;
  activeEvents: number;
  sprintWeekends: number;
}

export interface F1CalendarRace {
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: {
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    }
  };
  FirstPractice?: {
    date: string;
    time?: string;
  };
  SecondPractice?: {
    date: string;
    time?: string;
  };
  ThirdPractice?: {
    date: string;
    time?: string;
  };
  Qualifying?: {
    date: string;
    time?: string;
  };
  Sprint?: {
    date: string;
    time?: string;
  };
}

export interface F1CalendarResponse {
  MRData: {
    RaceTable: {
      season: string;
      Races: F1CalendarRace[];
    }
  }
}

class CalendarService {
  private readonly baseUrl = API_URLS.GRAND_PRIX;

  // ========== BUSCAR EVENTOS DO CALENDÁRIO ==========

  async getAllEvents(): Promise<CalendarEvent[]> {
    try {
      const response = await fetch(`${this.baseUrl}/grand-prix`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Erro ao buscar eventos do calendário');
    } catch (error) {
      console.error('Erro ao buscar eventos do calendário:', error);
      throw error;
    }
  }

  async getEventsBySeason(season: number): Promise<CalendarEvent[]> {
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

  async getActiveEventsBySeason(season: number): Promise<CalendarEvent[]> {
    try {
      const events = await this.getEventsBySeason(season);
      return events.filter(event => event.active);
    } catch (error) {
      console.error(`Erro ao buscar eventos ativos da temporada ${season}:`, error);
      throw error;
    }
  }

  async getUpcomingEvents(): Promise<CalendarEvent[]> {
    try {
      const allEvents = await this.getAllEvents();
      const now = new Date();
      return allEvents.filter(event => {
        const raceDate = new Date(event.raceDateTime);
        return raceDate > now && event.active;
      }).sort((a, b) => new Date(a.raceDateTime).getTime() - new Date(b.raceDateTime).getTime());
    } catch (error) {
      console.error('Erro ao buscar próximos eventos:', error);
      throw error;
    }
  }

  async getNextEvent(): Promise<CalendarEvent | null> {
    try {
      const upcomingEvents = await this.getUpcomingEvents();
      return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
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
      // Retornar temporadas padrão
      const currentYear = new Date().getFullYear();
      return [currentYear, currentYear - 1, currentYear - 2];
    }
  }

  // ========== OPERAÇÕES ADMINISTRATIVAS ==========

  async createEvent(request: CreateCalendarEventRequest): Promise<CalendarEvent> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
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
      throw new Error(errorData || 'Erro ao criar evento');
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      throw error;
    }
  }

  async updateEvent(id: number, request: UpdateCalendarEventRequest): Promise<CalendarEvent> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
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
      throw new Error(errorData || 'Erro ao atualizar evento');
    } catch (error) {
      console.error(`Erro ao atualizar evento ${id}:`, error);
      throw error;
    }
  }

  async deleteEvent(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Erro ao deletar evento');
      }
    } catch (error) {
      console.error(`Erro ao deletar evento ${id}:`, error);
      throw error;
    }
  }

  async activateEvent(id: number): Promise<CalendarEvent> {
    try {
      return await this.updateEvent(id, { active: true });
    } catch (error) {
      console.error(`Erro ao ativar evento ${id}:`, error);
      throw error;
    }
  }

  async deactivateEvent(id: number): Promise<CalendarEvent> {
    try {
      return await this.updateEvent(id, { active: false });
    } catch (error) {
      console.error(`Erro ao inativar evento ${id}:`, error);
      throw error;
    }
  }

  async markAsCompleted(id: number): Promise<CalendarEvent> {
    try {
      return await this.updateEvent(id, { completed: true });
    } catch (error) {
      console.error(`Erro ao marcar evento ${id} como concluído:`, error);
      throw error;
    }
  }

  async markAsPending(id: number): Promise<CalendarEvent> {
    try {
      return await this.updateEvent(id, { completed: false });
    } catch (error) {
      console.error(`Erro ao marcar evento ${id} como pendente:`, error);
      throw error;
    }
  }

  // ========== IMPORTAR CALENDÁRIO DA F1 ==========

  async importF1Calendar(season: number): Promise<CalendarEvent[]> {
    try {
      const f1Calendar = await this.fetchF1Calendar(season);
      const importedEvents: CalendarEvent[] = [];

      for (const race of f1Calendar.MRData.RaceTable.Races) {
        const eventRequest: CreateCalendarEventRequest = {
          season: parseInt(f1Calendar.MRData.RaceTable.season),
          round: parseInt(race.round),
          name: race.raceName,
          country: race.Circuit.Location.country,
          city: race.Circuit.Location.locality,
          circuitName: race.Circuit.circuitName,
          raceDateTime: `${race.date}T${race.time || '15:00:00'}`,
          practice1DateTime: race.FirstPractice ? `${race.FirstPractice.date}T${race.FirstPractice.time || '12:30:00'}` : undefined,
          practice2DateTime: race.SecondPractice ? `${race.SecondPractice.date}T${race.SecondPractice.time || '16:00:00'}` : undefined,
          practice3DateTime: race.ThirdPractice ? `${race.ThirdPractice.date}T${race.ThirdPractice.time || '13:00:00'}` : undefined,
          qualifyingDateTime: race.Qualifying ? `${race.Qualifying.date}T${race.Qualifying.time || '16:00:00'}` : undefined,
          sprintDateTime: race.Sprint ? `${race.Sprint.date}T${race.Sprint.time || '16:30:00'}` : undefined,
          timezone: 'UTC',
        };

        try {
          const createdEvent = await this.createEvent(eventRequest);
          importedEvents.push(createdEvent);
        } catch (error) {
          console.error(`Erro ao importar evento ${race.raceName}:`, error);
        }
      }

      return importedEvents;
    } catch (error) {
      console.error(`Erro ao importar calendário da F1 para ${season}:`, error);
      throw error;
    }
  }

  private async fetchF1Calendar(season: number): Promise<F1CalendarResponse> {
    try {
      const response = await fetch(`https://ergast.com/api/f1/${season}.json`);
      if (!response.ok) {
        throw new Error('Falha ao buscar calendário da F1');
      }
      return await response.json();
    } catch (error) {
      console.error(`Erro ao buscar calendário da F1 para ${season}:`, error);
      throw error;
    }
  }

  // ========== ESTATÍSTICAS ==========

  async getCalendarStats(): Promise<CalendarStats> {
    try {
      const allEvents = await this.getAllEvents();
      const now = new Date();
      
      const completedEvents = allEvents.filter(event => event.completed);
      const pendingEvents = allEvents.filter(event => !event.completed);
      const upcomingEvents = allEvents.filter(event => {
        const raceDate = new Date(event.raceDateTime);
        return raceDate > now && event.active;
      });
      const activeEvents = allEvents.filter(event => event.active);
      const sprintWeekends = allEvents.filter(event => event.isSprintWeekend);

      return {
        totalEvents: allEvents.length,
        completedEvents: completedEvents.length,
        pendingEvents: pendingEvents.length,
        upcomingEvents: upcomingEvents.length,
        activeEvents: activeEvents.length,
        sprintWeekends: sprintWeekends.length,
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do calendário:', error);
      throw error;
    }
  }

  // ========== UTILITÁRIOS ==========

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

  formatEventTime(dateTime: string): string {
    try {
      const date = new Date(dateTime);
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Hora inválida';
    }
  }

  getEventStatus(event: CalendarEvent): 'upcoming' | 'ongoing' | 'completed' {
    const now = new Date();
    const raceDate = new Date(event.raceDateTime);
    
    if (event.completed) {
      return 'completed';
    }
    
    if (raceDate < now) {
      return 'ongoing';
    }
    
    return 'upcoming';
  }

  getDaysUntilEvent(event: CalendarEvent): number {
    const now = new Date();
    const raceDate = new Date(event.raceDateTime);
    const diffTime = raceDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isEventToday(event: CalendarEvent): boolean {
    const today = new Date();
    const eventDate = new Date(event.raceDateTime);
    
    return today.toDateString() === eventDate.toDateString();
  }

  isEventThisWeekend(event: CalendarEvent): boolean {
    const today = new Date();
    const eventDate = new Date(event.raceDateTime);
    const daysUntil = this.getDaysUntilEvent(event);
    
    return daysUntil >= 0 && daysUntil <= 3;
  }



  // ========== VALIDAÇÕES ==========

  validateEventData(data: CreateCalendarEventRequest | UpdateCalendarEventRequest): string[] {
    const errors: string[] = [];

    if ('name' in data && data.name !== undefined) {
      if (!data.name.trim()) {
        errors.push('Nome do evento é obrigatório');
      } else if (data.name.length < 3) {
        errors.push('Nome do evento deve ter pelo menos 3 caracteres');
      }
    }

    if ('season' in data && data.season !== undefined) {
      const currentYear = new Date().getFullYear();
      if (data.season < 2020 || data.season > currentYear + 2) {
        errors.push(`Temporada deve estar entre 2020 e ${currentYear + 2}`);
      }
    }

    if ('round' in data && data.round !== undefined) {
      if (data.round < 1 || data.round > 25) {
        errors.push('Etapa deve estar entre 1 e 25');
      }
    }

    if ('raceDateTime' in data && data.raceDateTime !== undefined) {
      try {
        const raceDate = new Date(data.raceDateTime);
        if (isNaN(raceDate.getTime())) {
          errors.push('Data e hora da corrida inválida');
        }
      } catch (error) {
        errors.push('Data e hora da corrida inválida');
      }
    }

    return errors;
  }

  isValidEventName(name: string): boolean {
    return name.trim().length >= 3 && name.trim().length <= 100;
  }

  isValidSeason(season: number): boolean {
    const currentYear = new Date().getFullYear();
    return season >= 2020 && season <= currentYear + 2;
  }

  isValidRound(round: number): boolean {
    return round >= 1 && round <= 25;
  }
}

export const calendarService = new CalendarService(); 