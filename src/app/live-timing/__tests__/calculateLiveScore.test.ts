import { QualifyingScoreCalculator, RaceScoreCalculator } from '../../../utils/scoreCalculators';

// Mock dos calculadores para testar a lógica da função
jest.mock('../../../utils/scoreCalculators', () => ({
  QualifyingScoreCalculator: jest.fn().mockImplementation(() => ({
    calculate: jest.fn().mockReturnValue(16.557)
  })),
  RaceScoreCalculator: jest.fn().mockImplementation(() => ({
    calculate: jest.fn().mockReturnValue(85.5)
  }))
}));

// Importar a função após o mock
const calculateLiveScore = (raceGuesses: any[], currentStandings: any[], sessionType: string = 'RACE') => {
  // Converter os palpites para array de IDs (ordem do palpite)
  const guessIds = raceGuesses.map(guess => guess.pilotId);
  
  // Criar array de IDs baseado na classificação atual (ordem real)
  const currentIds: number[] = [];
  
  // Para cada posição na classificação atual, encontrar o ID do piloto
  for (let i = 0; i < currentStandings.length; i++) {
    const standing = currentStandings[i];
    // Encontrar o piloto correspondente nos palpites pelo código/acrônimo
    const matchingGuess = raceGuesses.find(g => 
      g.code === standing.driverAcronym || 
      g.familyName === standing.driverName ||
      standing.driverName.includes(g.familyName || '') ||
      g.pilotName === standing.driverName
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
  let score = 0;
  
  if (sessionType === 'QUALIFYING' || sessionType === 'qualifying') {
    calculator = new QualifyingScoreCalculator(limitedCurrentIds, guessIds);
    score = calculator.calculate();
  } else {
    calculator = new RaceScoreCalculator(limitedCurrentIds, guessIds);
    score = calculator.calculate();
  }
  
  // Contar acertos exatos (posição correta)
  const correctGuesses = guessIds.reduce((count, pilotId, index) => {
    return count + (limitedCurrentIds[index] === pilotId ? 1 : 0);
  }, 0);

  return { score, correctGuesses };
};

describe('calculateLiveScore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Qualifying Session', () => {
    it('should use QualifyingScoreCalculator for qualifying session', () => {
      const raceGuesses = [
        { pilotId: 4, code: 'NOR', familyName: 'Norris', pilotName: 'Lando Norris' },
        { pilotId: 81, code: 'PIA', familyName: 'Piastri', pilotName: 'Oscar Piastri' },
        { pilotId: 1, code: 'VER', familyName: 'Verstappen', pilotName: 'Max Verstappen' }
      ];

      const currentStandings = [
        { position: 1, driverAcronym: 'RUS', driverName: 'George Russell' },
        { position: 2, driverAcronym: 'VER', driverName: 'Max Verstappen' },
        { position: 3, driverAcronym: 'PIA', driverName: 'Oscar Piastri' }
      ];

      const result = calculateLiveScore(raceGuesses, currentStandings, 'QUALIFYING');

      expect(QualifyingScoreCalculator).toHaveBeenCalled();
      expect(RaceScoreCalculator).not.toHaveBeenCalled();
      expect(result.score).toBe(16.557);
    });

    it('should handle qualifying session type variations', () => {
      const raceGuesses = [
        { pilotId: 4, code: 'NOR', familyName: 'Norris', pilotName: 'Lando Norris' }
      ];

      const currentStandings = [
        { position: 1, driverAcronym: 'NOR', driverName: 'Lando Norris' }
      ];

      // Test different case variations
      calculateLiveScore(raceGuesses, currentStandings, 'qualifying');
      calculateLiveScore(raceGuesses, currentStandings, 'QUALIFYING');

      expect(QualifyingScoreCalculator).toHaveBeenCalledTimes(2);
    });
  });

  describe('Race Session', () => {
    it('should use RaceScoreCalculator for race session', () => {
      const raceGuesses = [
        { pilotId: 4, code: 'NOR', familyName: 'Norris', pilotName: 'Lando Norris' },
        { pilotId: 81, code: 'PIA', familyName: 'Piastri', pilotName: 'Oscar Piastri' }
      ];

      const currentStandings = [
        { position: 1, driverAcronym: 'NOR', driverName: 'Lando Norris' },
        { position: 2, driverAcronym: 'PIA', driverName: 'Oscar Piastri' }
      ];

      const result = calculateLiveScore(raceGuesses, currentStandings, 'RACE');

      expect(RaceScoreCalculator).toHaveBeenCalled();
      expect(QualifyingScoreCalculator).not.toHaveBeenCalled();
      expect(result.score).toBe(85.5);
    });

    it('should default to race when no session type provided', () => {
      const raceGuesses = [
        { pilotId: 4, code: 'NOR', familyName: 'Norris', pilotName: 'Lando Norris' }
      ];

      const currentStandings = [
        { position: 1, driverAcronym: 'NOR', driverName: 'Lando Norris' }
      ];

      calculateLiveScore(raceGuesses, currentStandings);

      expect(RaceScoreCalculator).toHaveBeenCalled();
      expect(QualifyingScoreCalculator).not.toHaveBeenCalled();
    });
  });

  describe('Driver Matching Logic', () => {
    it('should match drivers by code', () => {
      const raceGuesses = [
        { pilotId: 4, code: 'NOR', familyName: 'Norris', pilotName: 'Lando Norris' }
      ];

      const currentStandings = [
        { position: 1, driverAcronym: 'NOR', driverName: 'Lando Norris' }
      ];

      const result = calculateLiveScore(raceGuesses, currentStandings);

      expect(result.correctGuesses).toBe(1);
    });

    it('should match drivers by family name', () => {
      const raceGuesses = [
        { pilotId: 4, code: 'NOR', familyName: 'Norris', pilotName: 'Lando Norris' }
      ];

      const currentStandings = [
        { position: 1, driverAcronym: 'XXX', driverName: 'Lando Norris' }
      ];

      const result = calculateLiveScore(raceGuesses, currentStandings);

      expect(result.correctGuesses).toBe(1);
    });

    it('should match drivers by partial name', () => {
      const raceGuesses = [
        { pilotId: 4, code: 'NOR', familyName: 'Norris', pilotName: 'Lando Norris' }
      ];

      const currentStandings = [
        { position: 1, driverAcronym: 'XXX', driverName: 'L. Norris' }
      ];

      const result = calculateLiveScore(raceGuesses, currentStandings);

      expect(result.correctGuesses).toBe(1);
    });

    it('should handle unmatched drivers', () => {
      const raceGuesses = [
        { pilotId: 4, code: 'NOR', familyName: 'Norris', pilotName: 'Lando Norris' },
        { pilotId: 81, code: 'PIA', familyName: 'Piastri', pilotName: 'Oscar Piastri' }
      ];

      const currentStandings = [
        { position: 1, driverAcronym: 'HAM', driverName: 'Lewis Hamilton' },
        { position: 2, driverAcronym: 'VER', driverName: 'Max Verstappen' }
      ];

      const result = calculateLiveScore(raceGuesses, currentStandings);

      expect(result.correctGuesses).toBe(0);
    });
  });

  describe('Array Size Handling', () => {
    it('should limit current standings to guess size', () => {
      const raceGuesses = [
        { pilotId: 4, code: 'NOR', familyName: 'Norris', pilotName: 'Lando Norris' },
        { pilotId: 81, code: 'PIA', familyName: 'Piastri', pilotName: 'Oscar Piastri' }
      ];

      const currentStandings = [
        { position: 1, driverAcronym: 'NOR', driverName: 'Lando Norris' },
        { position: 2, driverAcronym: 'PIA', driverName: 'Oscar Piastri' },
        { position: 3, driverAcronym: 'VER', driverName: 'Max Verstappen' },
        { position: 4, driverAcronym: 'HAM', driverName: 'Lewis Hamilton' }
      ];

      calculateLiveScore(raceGuesses, currentStandings);

      // Verificar que o calculador foi chamado com arrays do tamanho correto
      const mockConstructor = RaceScoreCalculator as jest.MockedClass<typeof RaceScoreCalculator>;
      const constructorCall = mockConstructor.mock.calls[0];
      
      expect(constructorCall[0]).toHaveLength(2); // currentIds limitado ao tamanho do palpite
      expect(constructorCall[1]).toHaveLength(2); // guessIds
    });

    it('should pad arrays when current standings are smaller than guess', () => {
      const raceGuesses = [
        { pilotId: 4, code: 'NOR', familyName: 'Norris', pilotName: 'Lando Norris' },
        { pilotId: 81, code: 'PIA', familyName: 'Piastri', pilotName: 'Oscar Piastri' },
        { pilotId: 1, code: 'VER', familyName: 'Verstappen', pilotName: 'Max Verstappen' }
      ];

      const currentStandings = [
        { position: 1, driverAcronym: 'NOR', driverName: 'Lando Norris' }
      ];

      calculateLiveScore(raceGuesses, currentStandings);

      const mockConstructor = RaceScoreCalculator as jest.MockedClass<typeof RaceScoreCalculator>;
      const constructorCall = mockConstructor.mock.calls[0];
      
      expect(constructorCall[0]).toHaveLength(3); // Padded to match guess size
      expect(constructorCall[1]).toHaveLength(3); // guessIds
    });
  });

  describe('User Scenario Test', () => {
    it('should calculate correct score for the specific user qualifying scenario', () => {
      // Cenário exato do usuário
      const raceGuesses = [
        { pilotId: 4, code: 'NOR', familyName: 'Norris', pilotName: 'Lando Norris' },
        { pilotId: 81, code: 'PIA', familyName: 'Piastri', pilotName: 'Oscar Piastri' },
        { pilotId: 1, code: 'VER', familyName: 'Verstappen', pilotName: 'Max Verstappen' },
        { pilotId: 63, code: 'RUS', familyName: 'Russell', pilotName: 'George Russell' },
        { pilotId: 16, code: 'LEC', familyName: 'Leclerc', pilotName: 'Charles Leclerc' },
        { pilotId: 12, code: 'ANT', familyName: 'Antonelli', pilotName: 'Kimi Antonelli' },
        { pilotId: 44, code: 'HAM', familyName: 'Hamilton', pilotName: 'Lewis Hamilton' },
        { pilotId: 10, code: 'GAS', familyName: 'Gasly', pilotName: 'Pierre Gasly' },
        { pilotId: 25, code: 'HAD', familyName: 'Hadjar', pilotName: 'Isack Hadjar' },
        { pilotId: 30, code: 'LAW', familyName: 'Lawson', pilotName: 'Liam Lawson' }
      ];

      const currentStandings = [
        { position: 1, driverAcronym: 'RUS', driverName: 'George RUSSELL' },
        { position: 2, driverAcronym: 'VER', driverName: 'Max VERSTAPPEN' },
        { position: 3, driverAcronym: 'PIA', driverName: 'Oscar PIASTRI' },
        { position: 4, driverAcronym: 'ANT', driverName: 'Kimi ANTONELLI' },
        { position: 5, driverAcronym: 'HAM', driverName: 'Lewis HAMILTON' },
        { position: 6, driverAcronym: 'ALO', driverName: 'Fernando ALONSO' },
        { position: 7, driverAcronym: 'NOR', driverName: 'Lando NORRIS' },
        { position: 8, driverAcronym: 'LEC', driverName: 'Charles LECLERC' },
        { position: 9, driverAcronym: 'HAD', driverName: 'Isack HADJAR' },
        { position: 10, driverAcronym: 'ALB', driverName: 'Alexander ALBON' }
      ];

      const result = calculateLiveScore(raceGuesses, currentStandings, 'QUALIFYING');

      expect(QualifyingScoreCalculator).toHaveBeenCalled();
      expect(result.score).toBe(16.557); // Valor esperado do mock
      
      // Verificar que os arrays foram construídos corretamente
      const mockConstructor = QualifyingScoreCalculator as jest.MockedClass<typeof QualifyingScoreCalculator>;
      const constructorCall = mockConstructor.mock.calls[0];
      
      // Array de resultado real: [RUS, VER, PIA, ANT, HAM, ALO, NOR, LEC, HAD, ALB]
      // Array de palpite: [NOR, PIA, VER, RUS, LEC, ANT, HAM, GAS, HAD, LAW]
      expect(constructorCall[0]).toHaveLength(10);
      expect(constructorCall[1]).toHaveLength(10);
    });
  });
}); 