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

export interface UserGuess {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  grandPrixId: number;
  qualifyingGuesses: PilotPosition[];
  raceGuesses: PilotPosition[];
  totalScore?: number;
  currentScore?: number;
}

export interface PilotPosition {
  position: number;
  pilotId: number;
  pilotName: string;
  familyName?: string;
  code?: string;
}

export interface LiveRanking {
  userId: number;
  userName: string;
  userEmail: string;
  currentScore: number;
  totalPossibleScore: number;
  correctGuesses: number;
  raceGuesses: PilotPosition[];
  positionDifferences: { [position: number]: number };
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

  // Buscar palpites dos usuários para um Grand Prix via serviço existente
  async getUserGuessesForGrandPrix(grandPrixId: number): Promise<UserGuess[]> {
    try {
      // Importar dinamicamente para evitar problemas no servidor
      const { default: axiosInstance } = await import('../config/axios');
      const { API_URLS } = await import('../config/api');
      
      console.log('Buscando palpites reais para GP:', grandPrixId);
      
      // Buscar palpites de corrida do Grand Prix
      const response = await axiosInstance.get(
        `${API_URLS.GUESSES}/grand-prix/${grandPrixId}?guessType=RACE`
      );
      
      const guessesData = response.data;
      console.log('Palpites encontrados:', guessesData.length);
      
      // Converter formato da API para formato interno
      const userGuesses: UserGuess[] = guessesData.map((guess: any) => {
        // Converter pilotos da API para formato interno
        const raceGuesses: PilotPosition[] = guess.pilots.map((pilot: any, index: number) => ({
          position: index + 1,
          pilotId: pilot.id,
          pilotName: pilot.name,
          familyName: pilot.familyName,
          code: pilot.code
        }));
        
        return {
          id: guess.id,
          userId: guess.user.id,
          userName: guess.user.name,
          userEmail: guess.user.email,
          grandPrixId: guess.grandPrixId,
          qualifyingGuesses: [],
          raceGuesses,
          totalScore: guess.score || 0,
          currentScore: 0 // Será calculado em tempo real
        };
      });
      
      return userGuesses;
    } catch (error) {
      console.error('Erro ao buscar palpites:', error);
      // Se der erro na API, retornar array vazio ao invés de dados mock
      return [];
    }
  }

  // Buscar próximo Grand Prix usando o serviço existente
  async getNextGrandPrix(): Promise<any> {
    try {
      // Importar dinamicamente para evitar dependência circular
      const { guessService } = await import('./guesses');
      return await guessService.getNextGrandPrix();
    } catch (error) {
      console.error('Erro ao buscar próximo Grand Prix:', error);
      return null;
    }
  }

  // Mapear pilot code para driverAcronym da F1
  mapPilotCodeToDriverAcronym(pilotCode: string): string {
    const mapping: { [key: string]: string } = {
      'VER': 'VER', 'HAM': 'HAM', 'RUS': 'RUS', 'LEC': 'LEC', 'SAI': 'SAI',
      'NOR': 'NOR', 'PIA': 'PIA', 'ALO': 'ALO', 'STR': 'STR', 'PER': 'PER',
      'OCO': 'OCO', 'GAS': 'GAS', 'ALB': 'ALB', 'SAR': 'SAR', 'MAG': 'MAG',
      'HUL': 'HUL', 'TSU': 'TSU', 'RIC': 'RIC', 'ZHO': 'ZHO', 'BOT': 'BOT'
    };
    
    return mapping[pilotCode] || pilotCode;
  }

  // Calcular pontuação de um palpite baseado nas posições atuais
  calculateCurrentScore(raceGuesses: PilotPosition[], currentPositions: any[], sessionType: string = 'RACE'): number {
    // Importar os calculadores
    const { RaceScoreCalculator, QualifyingScoreCalculator } = require('../utils/scoreCalculators');
    
    // Converter palpites para array de IDs (ordem do palpite)
    const guessIds = raceGuesses.map(guess => guess.pilotId);
    
    // Criar array de IDs baseado na classificação atual (ordem real)
    const currentIds: number[] = [];
    
    // Para cada posição na classificação atual, encontrar o ID do piloto
    for (let i = 0; i < currentPositions.length; i++) {
      const position = currentPositions[i];
      // Encontrar o piloto correspondente nos palpites
      const matchingGuess = raceGuesses.find(g => 
        g.code === position.driverAcronym || 
        g.familyName === position.driverName ||
        position.driverName?.includes(g.familyName || '') ||
        position.driverAcronym === g.pilotName ||
        g.pilotName === position.driverName
      );
      
      if (matchingGuess) {
        currentIds.push(matchingGuess.pilotId);
      } else {
        // Se não encontrar correspondência, usar um ID único para não afetar o cálculo
        currentIds.push(999999 + i);
      }
    }
    
    // Limitar aos primeiros N pilotos baseado no tamanho do palpite
    const limitedCurrentIds = currentIds.slice(0, guessIds.length);
    
    // Garantir que ambos os arrays tenham o mesmo tamanho
    while (limitedCurrentIds.length < guessIds.length) {
      limitedCurrentIds.push(999999 + limitedCurrentIds.length);
    }

    // Usar o calculador apropriado baseado no tipo de sessão
    let calculator;
    
    if (sessionType === 'QUALIFYING' || sessionType === 'qualifying') {
      calculator = new QualifyingScoreCalculator(limitedCurrentIds, guessIds);
    } else {
      calculator = new RaceScoreCalculator(limitedCurrentIds, guessIds);
    }
    
    return calculator.calculate();
  }

  // Buscar ranking ao vivo dos palpiteiros
  async getLiveRanking(sessionKey: number): Promise<LiveRanking[]> {
    try {
      // Buscar dados da corrida atual
      const [positions, nextGrandPrix, session] = await Promise.all([
        this.getPositions(sessionKey),
        this.getNextGrandPrix(),
        this.getLatestSession()
      ]);

      if (!nextGrandPrix) {
        console.log('Nenhum Grand Prix disponível');
        return [];
      }

      // Buscar palpites reais para o Grand Prix atual
      const userGuesses = await this.getUserGuessesForGrandPrix(nextGrandPrix.id);
      
      if (!userGuesses.length) {
        console.log('Nenhum palpite encontrado para o GP atual:', nextGrandPrix.id);
        return [];
      }

      console.log('Usando palpites reais:', userGuesses.length, 'participantes');

      // Se não há posições da F1, usar dados mock apenas para as posições
      let currentPositions;
      if (!positions.length) {
        console.log('Sem posições F1 disponíveis, usando posições mock para demonstração');
        currentPositions = this.generateMockPositions();
      } else {
        // Mapear posições atuais para um formato mais fácil de trabalhar
        const drivers = this.getCachedData<any[]>('drivers') || [];
        currentPositions = positions.map(pos => {
          const driver = drivers.find(d => d.driver_number === pos.driver_number);
          
          return {
            position: pos.position,
            driverNumber: pos.driver_number,
            driverAcronym: driver?.name_acronym || '???',
            driverName: driver?.full_name || 'Unknown'
          };
        });
      }

      // Determinar o tipo de sessão
      const sessionType = session?.session_type || 'RACE';
      console.log('Tipo de sessão detectado:', sessionType);

      // Calcular pontuação atual para cada usuário baseado em palpites reais
      const liveRanking: LiveRanking[] = userGuesses.map(userGuess => {
        // Usar o tipo de palpite apropriado baseado na sessão
        const guessesToUse = sessionType.includes('QUALIFYING') || sessionType.includes('qualifying') 
          ? userGuess.qualifyingGuesses 
          : userGuess.raceGuesses;
          
        const currentScore = this.calculateCurrentScore(guessesToUse, currentPositions, sessionType);
        
        // Calcular pontuação máxima possível baseada no sistema oficial
        let maxScores: number[];
        if (sessionType.includes('QUALIFYING') || sessionType.includes('qualifying')) {
          // Para qualifying: pontuações máximas diferentes
          maxScores = [5.0, 5.0, 5.0, 4.0, 4.0, 4.0, 3.0, 3.0, 3.0, 3.0, 2.55, 2.167];
        } else {
          // Para corrida: pontuações máximas diferentes
          maxScores = [25, 25, 25, 20, 20, 20, 15, 15, 15, 15, 12.75, 10.837, 9.212, 7.83];
        }
        
        const totalPossibleScore = maxScores.slice(0, guessesToUse.length).reduce((sum, score) => sum + score, 0);
        
        // Calcular quantos palpites estão corretos (posição exata)
        const correctGuesses = guessesToUse.filter(guess => {
          const actualPosition = currentPositions.find(p => 
            p.driverAcronym === guess.code || 
            p.driverName?.includes(guess.familyName || '') ||
            p.driverAcronym === guess.pilotName
          );
          return actualPosition && actualPosition.position === guess.position;
        }).length;

        // Calcular diferenças de posição para cada palpite
        const positionDifferences: { [position: number]: number } = {};
        guessesToUse.forEach(guess => {
          const actualPosition = currentPositions.find(p => 
            p.driverAcronym === guess.code || 
            p.driverName?.includes(guess.familyName || '') ||
            p.driverAcronym === guess.pilotName
          );
          if (actualPosition) {
            positionDifferences[guess.position] = actualPosition.position - guess.position;
          }
        });

        return {
          userId: userGuess.userId,
          userName: userGuess.userName,
          userEmail: userGuess.userEmail,
          currentScore,
          totalPossibleScore,
          correctGuesses,
          raceGuesses: guessesToUse, // Usar os palpites apropriados
          positionDifferences
        };
      });

      // Ordenar por pontuação atual (maior para menor)
      return liveRanking.sort((a, b) => b.currentScore - a.currentScore);

    } catch (error) {
      console.error('Erro ao calcular ranking ao vivo:', error);
      return [];
    }
  }

  // Gerar posições mock apenas quando não há dados F1 disponíveis
  private generateMockPositions(): any[] {
    return [
      { position: 1, driverAcronym: 'VER', driverName: 'Max Verstappen' },
      { position: 2, driverAcronym: 'HAM', driverName: 'Lewis Hamilton' },
      { position: 3, driverAcronym: 'LEC', driverName: 'Charles Leclerc' },
      { position: 4, driverAcronym: 'RUS', driverName: 'George Russell' },
      { position: 5, driverAcronym: 'SAI', driverName: 'Carlos Sainz' },
      { position: 6, driverAcronym: 'NOR', driverName: 'Lando Norris' },
      { position: 7, driverAcronym: 'PIA', driverName: 'Oscar Piastri' },
      { position: 8, driverAcronym: 'ALO', driverName: 'Fernando Alonso' },
      { position: 9, driverAcronym: 'STR', driverName: 'Lance Stroll' },
      { position: 10, driverAcronym: 'PER', driverName: 'Sergio Perez' },
      { position: 11, driverAcronym: 'OCO', driverName: 'Esteban Ocon' },
      { position: 12, driverAcronym: 'GAS', driverName: 'Pierre Gasly' },
      { position: 13, driverAcronym: 'ALB', driverName: 'Alexander Albon' },
      { position: 14, driverAcronym: 'SAR', driverName: 'Logan Sargeant' },
      { position: 15, driverAcronym: 'MAG', driverName: 'Kevin Magnussen' },
      { position: 16, driverAcronym: 'HUL', driverName: 'Nico Hulkenberg' },
      { position: 17, driverAcronym: 'TSU', driverName: 'Yuki Tsunoda' },
      { position: 18, driverAcronym: 'RIC', driverName: 'Daniel Ricciardo' },
      { position: 19, driverAcronym: 'ZHO', driverName: 'Zhou Guanyu' },
      { position: 20, driverAcronym: 'BOT', driverName: 'Valtteri Bottas' }
    ];
  }

  // Buscar dados completos incluindo ranking ao vivo
  async getSessionData(sessionKey: number) {
    const cacheKey = `session-data-${sessionKey}`;
    const cached = this.getCachedData<any>(cacheKey);
    if (cached) return cached;

    try {
      const [session, drivers, positions, intervals, raceControl, liveRanking] = await Promise.all([
        this.getLatestSession(),
        this.getDrivers(sessionKey),
        this.getPositions(sessionKey),
        this.getIntervals(sessionKey),
        this.getRaceControl(sessionKey),
        this.getLiveRanking(sessionKey)
      ]);

      // Cache drivers para usar no cálculo de ranking
      if (drivers.length > 0) {
        this.setCachedData('drivers', drivers);
      }

      // Verificar se temos dados válidos para F1
      const hasF1Data = positions.length > 0 || drivers.length > 0;

      // Combinar dados da corrida (se disponíveis)
      interface CombinedDriverData {
        position: number;
        driverNumber: number;
        driverName: string;
        driverAcronym: string;
        teamName: string;
        teamColor: string;
        gapToLeader: number | null | undefined;
        interval: number | null | undefined;
        lastUpdate: string;
      }

      let combinedData: CombinedDriverData[] = [];
      if (hasF1Data) {
        const driversMap = new Map(drivers.map(d => [d.driver_number, d]));
        const intervalsMap = new Map(intervals.map(i => [i.driver_number, i]));

        combinedData = positions.map(pos => {
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
      }

      const result = {
        session,
        standings: combinedData,
        raceControl,
        liveRanking,
        hasGuesses: liveRanking.length > 0,
        isMockData: false, // Agora sempre usamos dados reais quando disponíveis
        hasF1Data
      };

      // Cachear apenas se tivermos dados válidos
      if (hasF1Data || liveRanking.length > 0) {
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