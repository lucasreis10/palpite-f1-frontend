// Serviço para buscar dados de timing em tempo real da OpenF1 API
const OPENF1_API_BASE = 'https://api.openf1.org/v1';
const CACHE_DURATION = 3000; // 3 segundos de cache

export interface DriverPosition {
  driver_number: number;
  position: number;
  meeting_key: number;
  session_key: number;
  date: string;
}

export interface DriverData {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  session_key: number;
  meeting_key: number;
}

export interface LapData {
  driver_number: number;
  lap_number: number;
  lap_duration: number;
  is_pit_out_lap: boolean;
  duration_sector_1: number;
  duration_sector_2: number;
  duration_sector_3: number;
  i1_speed: number;
  i2_speed: number;
  st_speed: number;
  session_key: number;
  meeting_key: number;
}

export interface Interval {
  driver_number: number;
  gap_to_leader: number | null;
  interval: number | null;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface SessionInfo {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  meeting_key: number;
  location: string;
  country_name: string;
  circuit_short_name: string;
}

export interface RaceControl {
  date: string;
  category: string;
  message: string;
  flag?: string;
  scope?: string;
  driver_number?: number;
  session_key: number;
  meeting_key: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class LiveTimingService {
  private cache: Map<string, CacheEntry<any>> = new Map();

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Buscar sessão atual ou mais recente
  async getLatestSession(): Promise<SessionInfo | null> {
    const cacheKey = 'latest-session';
    const cached = this.getCachedData<SessionInfo>(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${OPENF1_API_BASE}/sessions?session_key=latest`);
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Nenhuma sessão ativa no momento');
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const session = data[0] || null;
      
      if (session) {
        this.setCachedData(cacheKey, session);
      }
      
      return session;
    } catch (error) {
      console.error('Erro ao buscar sessão:', error);
      return null;
    }
  }

  // Buscar dados dos pilotos
  async getDrivers(sessionKey: number): Promise<DriverData[]> {
    try {
      const response = await fetch(`${OPENF1_API_BASE}/drivers?session_key=${sessionKey}`);
      if (!response.ok) throw new Error('Falha ao buscar pilotos');
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar pilotos:', error);
      return [];
    }
  }

  // Buscar posições atuais
  async getPositions(sessionKey: number): Promise<DriverPosition[]> {
    try {
      const response = await fetch(`${OPENF1_API_BASE}/position?session_key=${sessionKey}`);
      if (!response.ok) throw new Error('Falha ao buscar posições');
      
      const data = await response.json();
      // Filtrar apenas as posições mais recentes para cada piloto
      const latestPositions = new Map<number, DriverPosition>();
      
      data.forEach((pos: DriverPosition) => {
        const current = latestPositions.get(pos.driver_number);
        if (!current || new Date(pos.date) > new Date(current.date)) {
          latestPositions.set(pos.driver_number, pos);
        }
      });
      
      return Array.from(latestPositions.values()).sort((a, b) => a.position - b.position);
    } catch (error) {
      console.error('Erro ao buscar posições:', error);
      return [];
    }
  }

  // Buscar intervalos (gaps)
  async getIntervals(sessionKey: number): Promise<Interval[]> {
    try {
      const response = await fetch(`${OPENF1_API_BASE}/intervals?session_key=${sessionKey}`);
      if (!response.ok) throw new Error('Falha ao buscar intervalos');
      
      const data = await response.json();
      // Filtrar apenas os intervalos mais recentes
      const latestIntervals = new Map<number, Interval>();
      
      data.forEach((interval: Interval) => {
        const current = latestIntervals.get(interval.driver_number);
        if (!current || new Date(interval.date) > new Date(current.date)) {
          latestIntervals.set(interval.driver_number, interval);
        }
      });
      
      return Array.from(latestIntervals.values());
    } catch (error) {
      console.error('Erro ao buscar intervalos:', error);
      return [];
    }
  }

  // Buscar mensagens do controle de corrida
  async getRaceControl(sessionKey: number, limit: number = 10): Promise<RaceControl[]> {
    try {
      const response = await fetch(`${OPENF1_API_BASE}/race_control?session_key=${sessionKey}`);
      if (!response.ok) throw new Error('Falha ao buscar controle de corrida');
      
      const data = await response.json();
      // Ordenar por data decrescente e limitar
      return data
        .sort((a: RaceControl, b: RaceControl) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
        .slice(0, limit);
    } catch (error) {
      console.error('Erro ao buscar controle de corrida:', error);
      return [];
    }
  }

  // Buscar dados completos da sessão com cache inteligente
  async getSessionData(sessionKey: number) {
    const cacheKey = `session-data-${sessionKey}`;
    const cached = this.getCachedData<any>(cacheKey);
    if (cached) return cached;

    try {
      const [session, drivers, positions, intervals, raceControl] = await Promise.all([
        this.getLatestSession(),
        this.getDrivers(sessionKey),
        this.getPositions(sessionKey),
        this.getIntervals(sessionKey),
        this.getRaceControl(sessionKey)
      ]);

      // Verificar se temos dados válidos
      if (!positions.length && !drivers.length) {
        throw new Error('Nenhum dado disponível para esta sessão');
      }

      // Combinar dados
      const driversMap = new Map(drivers.map(d => [d.driver_number, d]));
      const intervalsMap = new Map(intervals.map(i => [i.driver_number, i]));

      const combinedData = positions.map(pos => {
        const driver = driversMap.get(pos.driver_number);
        const interval = intervalsMap.get(pos.driver_number);

        return {
          position: pos.position,
          driverNumber: pos.driver_number,
          driverName: driver?.full_name || 'Unknown',
          driverAcronym: driver?.name_acronym || '???',
          teamName: driver?.team_name || 'Unknown',
          teamColor: driver?.team_colour || 'FFFFFF',
          gapToLeader: interval?.gap_to_leader,
          interval: interval?.interval,
          lastUpdate: pos.date
        };
      });

      const result = {
        session,
        standings: combinedData,
        raceControl
      };

      // Cachear apenas se tivermos dados válidos
      if (combinedData.length > 0) {
        this.setCachedData(cacheKey, result);
      }

      return result;
    } catch (error) {
      console.error('Erro ao buscar dados da sessão:', error);
      throw error;
    }
  }

  // Método para limpar cache (útil para forçar atualização)
  clearCache(): void {
    this.cache.clear();
  }
}

export const liveTimingService = new LiveTimingService(); 