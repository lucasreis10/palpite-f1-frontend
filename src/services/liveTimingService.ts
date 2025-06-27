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
      
      // Verificar se a resposta contém mensagem de restrição de acesso
      const data = await response.json();
      if (data.detail && data.detail.includes('access is restricted')) {
        console.log('OpenF1 API: Acesso restrito - não há sessão ativa ou necessita autenticação');
        return null;
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('Nenhuma sessão ativa no momento');
          return null;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
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

  // Buscar ranking ao vivo dos palpiteiros
  async getLiveRanking(sessionKey: number): Promise<LiveRanking[]> {
    try {
      // Buscar dados da corrida atual
      const [positions, nextGrandPrix, session] = await Promise.all([
        this.getPositions(sessionKey),
        this.getNextGrandPrix(),
        this.getLatestSession()
      ]);

      // Para teste, usar GP da Espanha (ID 8) se não houver próximo GP
      const testGrandPrix = nextGrandPrix || { id: 8, name: 'Spain Grand Prix' };
      
      if (!testGrandPrix) {
        console.log('Nenhum Grand Prix disponível');
        return [];
      }

      // Verificar se há dados da F1 disponíveis
      if (!positions.length) {
        console.log('❌ Nenhuma posição F1 disponível - não é possível calcular ranking ao vivo');
        return [];
      }

      console.log('✅ Usando posições reais da F1');
      // Mapear posições atuais para um formato mais fácil de trabalhar
      const drivers = this.getCachedData<any[]>('drivers') || [];
      const currentPositions = positions.map(pos => {
        const driver = drivers.find(d => d.driver_number === pos.driver_number);
        
        return {
          position: pos.position,
          driverNumber: pos.driver_number,
          driverAcronym: driver?.name_acronym || '???',
          driverName: driver?.full_name || driver?.broadcast_name || 'Piloto Desconhecido',
          teamName: driver?.team_name || null,
          teamColor: driver?.team_colour || null,
          gapToLeader: null,
          interval: null,
          lastUpdate: new Date().toISOString()
        };
      });
      
      console.log('📊 Dados F1 reais sendo usados:', currentPositions.slice(0, 5).map(p => `${p.position}º ${p.driverAcronym} (${p.driverName})`));

      // Determinar o tipo de sessão
      const sessionType = session?.session_type || 'RACE';
      console.log('Tipo de sessão detectado:', sessionType);

      // 🚀 USAR O NOVO ENDPOINT /live-timing DO BACKEND JAVA
      console.log('🚀 Usando novo endpoint /live-timing do backend Java');
      console.log('🎯 GP ID sendo usado:', testGrandPrix.id);
      console.log('🎯 Tipo de sessão:', sessionType);
      
      try {
        // Usar fetch diretamente para evitar problemas de autenticação
        const liveTimingRequest = {
          grandPrixId: testGrandPrix.id,
          sessionType: sessionType,
          currentPositions: currentPositions.map(pos => ({
            position: pos.position,
            driverNumber: pos.driverNumber || 0,
            driverAcronym: pos.driverAcronym,
            driverName: pos.driverName
          }))
        };
        
        console.log('📤 Enviando dados para backend:', JSON.stringify(liveTimingRequest, null, 2));
        
        // Chamar o novo endpoint usando fetch para evitar interceptors de autenticação
        const response = await fetch('http://localhost:8081/api/guesses/live-timing', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(liveTimingRequest)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Resposta do backend recebida:', data);
        console.log('📊 Live ranking recebido:', data.liveRanking?.length || 0, 'usuários');
        
        // Converter resposta do backend para o formato esperado
        const backendRanking = data.liveRanking || [];
        
        const liveRanking: LiveRanking[] = backendRanking.map((ranking: any) => ({
          userId: ranking.userId,
          userName: ranking.userName,
          userEmail: ranking.userEmail,
          currentScore: Number(ranking.currentScore) || 0,
          totalPossibleScore: Number(ranking.totalPossibleScore) || 234,
          correctGuesses: ranking.correctGuesses || 0,
          raceGuesses: ranking.raceGuesses || [],
          positionDifferences: ranking.positionDifferences || {}
        }));
        
        console.log(`🎯 Ranking calculado pelo backend: ${liveRanking.length} usuários`);
        
        return liveRanking;
        
      } catch (backendError: any) {
        console.error('❌ Erro ao usar endpoint /live-timing do backend:', backendError.message);
        console.log('🔄 Fallback: calculando no frontend...');
        
        // FALLBACK: Se o backend falhar, usar o método antigo (frontend)
        return this.calculateLiveRankingFallback(testGrandPrix.id, currentPositions, sessionType);
      }

    } catch (error) {
      console.error('Erro ao calcular ranking ao vivo:', error);
      return [];
    }
  }

  // Método fallback para calcular no frontend caso o backend falhe
  private async calculateLiveRankingFallback(grandPrixId: number, currentPositions: any[], sessionType: string): Promise<LiveRanking[]> {
    try {
      // Buscar palpites dos usuários usando o backend Java
      const userGuesses = await this.getUserGuessesFromJavaBackend(grandPrixId);
      
      if (!userGuesses.length) {
        console.log('Nenhum palpite encontrado para este Grand Prix');
        return [];
      }

      console.log(`📝 ${userGuesses.length} palpites encontrados (fallback)`);

      // Calcular pontuação para cada usuário usando as classes que já funcionam
      const liveRanking: LiveRanking[] = [];

      for (const userGuess of userGuesses) {
        // Sempre usar raceGuesses independente do tipo de sessão
        const guessesToUse = userGuess.raceGuesses;
        
        if (!guessesToUse || guessesToUse.length === 0) {
          console.log(`⚠️ Usuário ${userGuess.userName} não tem palpites de corrida`);
          continue;
        }

        // Calcular pontuação atual
        const currentScore = this.calculateCurrentScore(guessesToUse, currentPositions, sessionType);
        
        // Calcular diferenças de posição
        const positionDifferences = this.calculatePositionDifferences(guessesToUse, currentPositions);
        
        // Contar acertos exatos
        const correctGuesses = this.countCorrectGuesses(guessesToUse, currentPositions);

        console.log(`🎯 Usuário ${userGuess.userName}: ${currentScore.toFixed(3)} pontos (${sessionType} - fallback)`);

        liveRanking.push({
          userId: userGuess.userId,
          userName: userGuess.userName,
          userEmail: userGuess.userEmail,
          currentScore: currentScore,
          totalPossibleScore: 234, // Pontuação máxima possível
          correctGuesses: correctGuesses,
          raceGuesses: guessesToUse,
          positionDifferences: positionDifferences
        });
      }

      // Ordenar por pontuação decrescente
      return liveRanking.sort((a, b) => b.currentScore - a.currentScore);
      
    } catch (error) {
      console.error('Erro no fallback de ranking ao vivo:', error);
      return [];
    }
  }

  // Buscar palpites dos usuários usando o backend Java
  async getUserGuessesFromJavaBackend(grandPrixId: number): Promise<UserGuess[]> {
    try {
      // Importar dinamicamente para evitar problemas no servidor
      const { default: axiosInstance } = await import('../config/axios');
      
      console.log('🔍 Buscando palpites do backend Java para GP:', grandPrixId);
      
      // Buscar palpites de corrida do Grand Prix
      const response = await axiosInstance.get(`/guesses/grand-prix/${grandPrixId}?guessType=RACE`);
      
      const guessesData = response.data;
      console.log('✅ Palpites encontrados no backend Java:', guessesData.length);
      console.log('📊 Primeiro palpite:', JSON.stringify(guessesData[0], null, 2));
      
      // Converter formato da API Java para o formato esperado
      const userGuesses: UserGuess[] = guessesData.map((guess: any) => {
        console.log(`🔄 Convertendo palpite do usuário: ${guess.user.name}`);
        console.log(`📝 Pilotos no palpite: ${guess.pilots.length}`);
        
        const convertedGuess = {
          id: guess.id,
          userId: guess.user.id,
          userName: guess.user.name,
          userEmail: guess.user.email,
          grandPrixId: guess.grandPrixId,
          qualifyingGuesses: [], // Não usado no live timing
          raceGuesses: guess.pilots.map((pilot: any, index: number) => ({
            position: index + 1,
            pilotId: pilot.id,
            pilotName: pilot.fullName || pilot.name,
            familyName: pilot.familyName,
            code: pilot.code
          }))
        };
        
        console.log(`✅ Palpite convertido: ${convertedGuess.raceGuesses.length} pilotos`);
        return convertedGuess;
      });
      
      console.log(`🎯 Total de palpites convertidos: ${userGuesses.length}`);
      return userGuesses;
      
    } catch (error) {
      console.error('❌ Erro ao buscar palpites do backend Java:', error);
      return [];
    }
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
        position.driverAcronym === g.code ||
        g.pilotName === position.driverName
      );
      
      if (matchingGuess) {
        currentIds.push(matchingGuess.pilotId);
      } else {
        // Se não encontrar correspondência, usar um ID fictício
        currentIds.push(999999 + i);
      }
    }
    
    // Usar o calculador apropriado baseado no tipo de sessão
    if (sessionType === 'QUALIFYING') {
      const calculator = new QualifyingScoreCalculator(currentIds, guessIds);
      return calculator.calculate();
    } else {
      const calculator = new RaceScoreCalculator(currentIds, guessIds);
      return calculator.calculate();
    }
  }

  // Calcular diferenças de posição entre palpite e realidade
  calculatePositionDifferences(raceGuesses: PilotPosition[], currentPositions: any[]): { [position: number]: number } {
    const differences: { [position: number]: number } = {};
    
    for (let i = 0; i < raceGuesses.length; i++) {
      const guess = raceGuesses[i];
      const guessedPosition = i + 1;
      
      // Encontrar a posição real do piloto
      const realPositionIndex = currentPositions.findIndex(pos => 
        pos.driverAcronym === guess.code || 
        pos.driverName?.includes(guess.familyName || '') ||
        guess.pilotName === pos.driverName
      );
      
      if (realPositionIndex !== -1) {
        const realPosition = realPositionIndex + 1;
        differences[guessedPosition] = realPosition - guessedPosition;
      }
    }
    
    return differences;
  }

  // Contar acertos exatos de posição
  countCorrectGuesses(raceGuesses: PilotPosition[], currentPositions: any[]): number {
    let correctCount = 0;
    
    for (let i = 0; i < raceGuesses.length; i++) {
      const guess = raceGuesses[i];
      const guessedPosition = i + 1;
      
      // Verificar se há um piloto na posição correspondente
      if (currentPositions[i]) {
        const currentPilot = currentPositions[i];
        
        // Verificar se é o mesmo piloto
        if (currentPilot.driverAcronym === guess.code || 
            currentPilot.driverName?.includes(guess.familyName || '') ||
            guess.pilotName === currentPilot.driverName) {
          correctCount++;
        }
      }
    }
    
    return correctCount;
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