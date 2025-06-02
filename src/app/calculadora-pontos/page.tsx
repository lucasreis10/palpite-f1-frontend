'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RaceScoreCalculator, QualifyingScoreCalculator } from '../../utils/scoreCalculators';

interface Pilot {
  id: number;
  name: string;
  familyName: string;
  code: string;
  teamName: string;
  teamColor: string;
}

interface PilotPosition {
  position: number;
  pilotId: number;
  pilotName: string;
  code: string;
}

interface ScoreDetail {
  position: number;
  guessPilot: string;
  actualPilot: string;
  points: number;
}

export default function CalculadoraPontosPage() {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [guessType, setGuessType] = useState<'QUALIFYING' | 'RACE'>('RACE');
  const [numPositions, setNumPositions] = useState(10);
  
  // Palpites do usuário
  const [userGuess, setUserGuess] = useState<PilotPosition[]>([]);
  
  // Resultado real
  const [actualResult, setActualResult] = useState<PilotPosition[]>([]);
  
  // Resultado do cálculo
  const [scoreDetails, setScoreDetails] = useState<ScoreDetail[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    loadPilots();
  }, []);

  useEffect(() => {
    // Inicializar arrays quando número de posições muda
    initializePositions();
  }, [numPositions, pilots]);

  const loadPilots = async () => {
    try {
      const response = await fetch('/api/pilots');
      if (response.ok) {
        const data = await response.json();
        setPilots(data);
      }
    } catch (error) {
      console.error('Erro ao carregar pilotos:', error);
      // Usar pilotos mock se API falhar
      setPilots(getMockPilots());
    } finally {
      setLoading(false);
    }
  };

  const getMockPilots = (): Pilot[] => [
    { id: 1, name: 'Max', familyName: 'Verstappen', code: 'VER', teamName: 'Red Bull Racing', teamColor: '4781D7' },
    { id: 2, name: 'Lewis', familyName: 'Hamilton', code: 'HAM', teamName: 'Mercedes', teamColor: '00D7B6' },
    { id: 3, name: 'Charles', familyName: 'Leclerc', code: 'LEC', teamName: 'Ferrari', teamColor: 'ED1131' },
    { id: 4, name: 'Lando', familyName: 'Norris', code: 'NOR', teamName: 'McLaren', teamColor: 'F47600' },
    { id: 5, name: 'George', familyName: 'Russell', code: 'RUS', teamName: 'Mercedes', teamColor: '00D7B6' },
    { id: 6, name: 'Carlos', familyName: 'Sainz Jr.', code: 'SAI', teamName: 'Ferrari', teamColor: 'ED1131' },
    { id: 7, name: 'Sergio', familyName: 'Pérez', code: 'PER', teamName: 'Red Bull Racing', teamColor: '4781D7' },
    { id: 8, name: 'Oscar', familyName: 'Piastri', code: 'PIA', teamName: 'McLaren', teamColor: 'F47600' },
    { id: 9, name: 'Fernando', familyName: 'Alonso', code: 'ALO', teamName: 'Aston Martin', teamColor: '229971' },
    { id: 10, name: 'Lance', familyName: 'Stroll', code: 'STR', teamName: 'Aston Martin', teamColor: '229971' },
    { id: 11, name: 'Pierre', familyName: 'Gasly', code: 'GAS', teamName: 'Alpine', teamColor: '00A1E8' },
    { id: 12, name: 'Esteban', familyName: 'Ocon', code: 'OCO', teamName: 'Alpine', teamColor: '00A1E8' },
    { id: 13, name: 'Alexander', familyName: 'Albon', code: 'ALB', teamName: 'Williams', teamColor: '1868DB' },
    { id: 14, name: 'Logan', familyName: 'Sargeant', code: 'SAR', teamName: 'Williams', teamColor: '1868DB' },
    { id: 15, name: 'Kevin', familyName: 'Magnussen', code: 'MAG', teamName: 'Haas F1 Team', teamColor: '9C9FA2' },
    { id: 16, name: 'Nico', familyName: 'Hülkenberg', code: 'HUL', teamName: 'Haas F1 Team', teamColor: '9C9FA2' },
    { id: 17, name: 'Yuki', familyName: 'Tsunoda', code: 'TSU', teamName: 'AlphaTauri', teamColor: '6C98FF' },
    { id: 18, name: 'Daniel', familyName: 'Ricciardo', code: 'RIC', teamName: 'AlphaTauri', teamColor: '6C98FF' },
    { id: 19, name: 'Zhou', familyName: 'Guanyu', code: 'ZHO', teamName: 'Alfa Romeo', teamColor: '9B0B2C' },
    { id: 20, name: 'Valtteri', familyName: 'Bottas', code: 'BOT', teamName: 'Alfa Romeo', teamColor: '9B0B2C' }
  ];

  const initializePositions = () => {
    const newUserGuess: PilotPosition[] = [];
    const newActualResult: PilotPosition[] = [];

    for (let i = 1; i <= numPositions; i++) {
      newUserGuess.push({
        position: i,
        pilotId: 0,
        pilotName: '',
        code: ''
      });
      
      newActualResult.push({
        position: i,
        pilotId: 0,
        pilotName: '',
        code: ''
      });
    }

    setUserGuess(newUserGuess);
    setActualResult(newActualResult);
    setScoreDetails([]);
    setTotalScore(0);
  };

  const updateGuess = (position: number, pilotId: number) => {
    const pilot = pilots.find(p => p.id === pilotId);
    if (!pilot) return;

    const newGuess = [...userGuess];
    newGuess[position - 1] = {
      position,
      pilotId,
      pilotName: pilot.familyName,
      code: pilot.code
    };
    setUserGuess(newGuess);
  };

  const updateActual = (position: number, pilotId: number) => {
    const pilot = pilots.find(p => p.id === pilotId);
    if (!pilot) return;

    const newActual = [...actualResult];
    newActual[position - 1] = {
      position,
      pilotId,
      pilotName: pilot.familyName,
      code: pilot.code
    };
    setActualResult(newActual);
  };

  const handleGuessTypeChange = (newType: 'QUALIFYING' | 'RACE') => {
    setGuessType(newType);
    
    // Ajustar número de posições se exceder o limite
    if (newType === 'QUALIFYING' && numPositions > 12) {
      setNumPositions(12);
    } else if (newType === 'RACE' && numPositions > 14) {
      setNumPositions(14);
    }
  };

  const calculateScore = () => {
    // Verificar se todos os campos estão preenchidos
    const allGuessesSet = userGuess.every(g => g.pilotId !== 0);
    const allActualSet = actualResult.every(a => a.pilotId !== 0);
    
    if (!allGuessesSet || !allActualSet) {
      alert('Por favor, preencha todas as posições antes de calcular.');
      return;
    }

    // Converter para arrays de IDs dos pilotos para usar nas calculadoras
    const guessArray = userGuess.map(g => g.pilotId);
    const actualArray = actualResult.map(a => a.pilotId);

    // Usar a calculadora apropriada baseada no tipo
    let calculator;
    let totalScore = 0;

    if (guessType === 'QUALIFYING') {
      calculator = new QualifyingScoreCalculator(actualArray, guessArray);
      totalScore = calculator.calculate();
    } else {
      calculator = new RaceScoreCalculator(actualArray, guessArray);
      totalScore = calculator.calculate();
    }

    // Criar detalhes da pontuação para exibição
    const details: ScoreDetail[] = [];
    
    for (let i = 0; i < numPositions; i++) {
      const guessPos = userGuess[i];
      const actualPos = actualResult[i];

      if (guessPos.pilotId && actualPos.pilotId) {
        // Calcular pontos individuais usando mini-calculadora
        const singleGuess = [guessPos.pilotId];
        const singleActual = [actualPos.pilotId];
        
        let individualPoints = 0;
        if (guessType === 'QUALIFYING') {
          const singleCalc = new QualifyingScoreCalculator(singleActual, singleGuess);
          individualPoints = singleCalc.calculate();
        } else {
          const singleCalc = new RaceScoreCalculator(singleActual, singleGuess);
          individualPoints = singleCalc.calculate();
        }

        const detail: ScoreDetail = {
          position: guessPos.position,
          guessPilot: guessPos.pilotName,
          actualPilot: actualPos.pilotName,
          points: Math.round(individualPoints * 1000) / 1000
        };

        details.push(detail);
      }
    }

    setScoreDetails(details);
    setTotalScore(Math.round(totalScore * 1000) / 1000);
  };

  const resetCalculator = () => {
    initializePositions();
  };

  const getPointsColor = (points: number) => {
    if (points >= 20) return 'text-green-500';
    if (points >= 15) return 'text-blue-500';
    if (points >= 10) return 'text-yellow-500';
    if (points >= 5) return 'text-orange-500';
    if (points >= 2) return 'text-red-400';
    return 'text-gray-400';
  };

  // Calcular pontuação máxima possível baseada no tipo
  const getMaxPossibleScore = () => {
    if (guessType === 'QUALIFYING') {
      // Para qualifying: posições 1-12 têm pontuações máximas diferentes
      const maxScores = [5.0, 5.0, 5.0, 4.0, 4.0, 4.0, 3.0, 3.0, 3.0, 3.0, 2.55, 2.167];
      return maxScores.slice(0, numPositions).reduce((sum, score) => sum + score, 0);
    } else {
      // Para corrida: 25 pontos é o máximo para 1º lugar, depois vai decrescendo
      const maxScores = [25, 25, 25, 20, 20, 20, 15, 15, 15, 15, 12.75, 10.837, 9.212, 7.83];
      return maxScores.slice(0, numPositions).reduce((sum, score) => sum + score, 0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Voltar ao início
          </Link>
          
          <h1 className="text-3xl font-bold text-black mb-2">Calculadora de Pontos</h1>
          <p className="text-black">
            Simule palpites e veja como seriam pontuados. Perfeito para treinar suas estratégias!
          </p>
        </div>

        {/* Controles */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm border border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Tipo de Palpite
              </label>
              <select
                value={guessType}
                onChange={(e) => handleGuessTypeChange(e.target.value as 'QUALIFYING' | 'RACE')}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-black"
              >
                <option value="QUALIFYING">Qualifying</option>
                <option value="RACE">Corrida</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Número de Posições
              </label>
              <select
                value={numPositions}
                onChange={(e) => setNumPositions(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white text-black"
              >
                {guessType === 'QUALIFYING' ? (
                  <>
                    <option value={10}>Top 10</option>
                    <option value={12}>Top 12 (Completo)</option>
                  </>
                ) : (
                  <>
                    <option value={10}>Top 10</option>
                    <option value={14}>Top 14 (Completo)</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={calculateScore}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Calcular Pontos
              </button>
              <button
                onClick={resetCalculator}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Palpite do Usuário */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-black mb-4">Seu Palpite</h2>
            <div className="space-y-3">
              {userGuess.map((guess, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold text-sm">
                    {guess.position}
                  </div>
                  <select
                    value={guess.pilotId}
                    onChange={(e) => updateGuess(guess.position, Number(e.target.value))}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-white text-black"
                  >
                    <option value={0}>Selecione um piloto...</option>
                    {pilots.map(pilot => (
                      <option key={pilot.id} value={pilot.id}>
                        {pilot.code} - {pilot.familyName}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Resultado Real */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-black mb-4">Resultado Real</h2>
            <div className="space-y-3">
              {actualResult.map((result, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center font-bold text-sm">
                    {result.position}
                  </div>
                  <select
                    value={result.pilotId}
                    onChange={(e) => updateActual(result.position, Number(e.target.value))}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-white text-black"
                  >
                    <option value={0}>Selecione um piloto...</option>
                    {pilots.map(pilot => (
                      <option key={pilot.id} value={pilot.id}>
                        {pilot.code} - {pilot.familyName}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resultado do Cálculo */}
        {scoreDetails.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">Resultado da Pontuação</h2>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{totalScore}</div>
                <div className="text-sm text-black">de {getMaxPossibleScore()} pontos possíveis</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-black">Pos</th>
                    <th className="text-left py-2 text-black">Seu Palpite</th>
                    <th className="text-left py-2 text-black">Resultado Real</th>
                    <th className="text-center py-2 text-black">Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {scoreDetails.map((detail, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 font-medium text-black">{detail.position}º</td>
                      <td className="py-2 text-black">{detail.guessPilot}</td>
                      <td className="py-2 text-black">{detail.actualPilot}</td>
                      <td className={`py-2 text-center font-bold ${getPointsColor(detail.points)}`}>
                        {detail.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Estatísticas */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-black">Pontos Máximos</div>
                <div className="text-xl font-bold text-green-600">
                  {scoreDetails.filter(d => d.points > 0).reduce((max, d) => Math.max(max, d.points), 0)}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-black">Eficiência</div>
                <div className="text-xl font-bold text-purple-600">
                  {Math.round((totalScore / getMaxPossibleScore()) * 100)}%
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-black">Pontos/Posição</div>
                <div className="text-xl font-bold text-orange-600">
                  {(totalScore / numPositions).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 