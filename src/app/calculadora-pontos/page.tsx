'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { DriverAutocomplete } from '../../components/DriverAutocomplete';
import { RaceScoreCalculator, QualifyingScoreCalculator } from '../../utils/scoreCalculators';
import { guessService, Pilot } from '../../services/guesses';

interface Driver {
  id: number;
  name: string;
  team: string;
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
  
  // Ref para a seção de resultados
  const resultSectionRef = useRef<HTMLDivElement>(null);
  
  // Log detalhado do estado atual no render
  console.log('=== RENDER CALCULADORA ===');
  console.log('🎬 pilots.length:', pilots.length);
  console.log('⏳ loading:', loading);
  console.log('🏁 guessType:', guessType);
  console.log('📊 numPositions:', numPositions);
  if (pilots.length > 0) {
    console.log('✅ Primeiro piloto:', pilots[0].givenName, pilots[0].familyName);
    console.log('✅ FullName do primeiro piloto:', pilots[0].fullName);
  }
  console.log('========================');
  
  // Resultado real sempre tem 12 posições
  const NUM_POSITIONS_RESULT = 12;
  
  // Arrays de drivers para drag and drop
  const [userGuessDrivers, setUserGuessDrivers] = useState<(Driver | null)[]>([]);
  const [actualResultDrivers, setActualResultDrivers] = useState<(Driver | null)[]>([]);
  
  // Resultado do cálculo
  const [scoreDetails, setScoreDetails] = useState<ScoreDetail[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  // Converter Pilot para Driver (mesma função do BetForm)
  const convertPilotToDriver = (pilot: Pilot): Driver => ({
    id: pilot.id,
    name: pilot.fullName,
    team: pilot.constructor?.name || 'Sem Equipe'
  });

  useEffect(() => {
    loadPilots();
  }, []);

  useEffect(() => {
    console.log('🔄 useEffect [pilots] - Estado pilots mudou:', pilots.length, 'pilotos');
    if (pilots.length > 0) {
      console.log('✅ Primeiro piloto no estado:', pilots[0]);
      console.log('👥 Todos os pilotos:', pilots.map(p => `${p.givenName} ${p.familyName}`));
    } else {
      console.log('❌ Array pilots ainda vazio');
    }
  }, [pilots]);

  useEffect(() => {
    console.log('🔄 useEffect [numPositions, pilots] - Chamando initializePositions');
    console.log('📊 numPositions:', numPositions, 'pilots.length:', pilots.length);
    initializePositions();
  }, [numPositions, pilots]);

  const loadPilots = async () => {
    try {
      console.log('🔍 Iniciando loadPilots...');
      console.log('🧩 Estado atual pilots antes da chamada:', pilots.length);
      
      // Usar o mesmo método do BetForm
      const pilotsData = await guessService.getAllPilots();
      console.log('📦 Dados recebidos do guessService:', pilotsData);
      console.log('📊 Quantidade de pilotos recebidos:', pilotsData.length);
      
      if (pilotsData.length > 0) {
        console.log('🏎️ Primeiro piloto do guessService:', pilotsData[0]);
        console.log('🔍 Estrutura do primeiro piloto:');
        console.log('🔍 Propriedades:', Object.keys(pilotsData[0]));
        console.log('🔍 Valores:');
        Object.keys(pilotsData[0]).forEach(key => {
          const value = (pilotsData[0] as any)[key];
          console.log(`  ${key}: "${value}" (tipo: ${typeof value})`);
        });
      }
      
      console.log('🔧 Chamando setPilots com', pilotsData.length, 'pilotos...');
      setPilots(pilotsData);
      console.log('✅ setPilots executado');
      
      // Verificar estado imediatamente após setPilots (pode não refletir ainda)
      console.log('🔍 Estado pilots logo após setPilots:', pilots.length);
    } catch (error) {
      console.error('🚨 Erro ao carregar pilotos:', error);
      // Em caso de erro, usar dados mock
      console.log('🔄 Usando pilotos mock por erro');
      setPilots([]);
    } finally {
      console.log('🏁 Finalizando loadPilots, setLoading(false)');
      setLoading(false);
    }
  };

  // Converter pilotos para drivers (formato do DriverAutocomplete)
  const drivers: Driver[] = pilots.map(convertPilotToDriver);

  console.log('🔄 Conversão pilots -> drivers:');
  console.log('📊 pilots.length:', pilots.length);
  console.log('🚗 drivers.length:', drivers.length);
  if (drivers.length > 0) {
    console.log('✅ Primeiro driver convertido:', drivers[0]);
  } else {
    console.log('❌ Nenhum driver convertido - pilots está vazio');
  }

  // Função para obter drivers disponíveis para palpite (excluindo já selecionados)
  const getAvailableDriversForGuess = (currentPosition: number): Driver[] => {
    const selectedDriverIds = userGuessDrivers
      .map((driver, index) => index !== currentPosition - 1 ? driver?.id : null)
      .filter(id => id !== null);
    
    return drivers.filter(driver => !selectedDriverIds.includes(driver.id));
  };

  // Função para obter drivers disponíveis para resultado real (excluindo já selecionados)
  const getAvailableDriversForActual = (currentPosition: number): Driver[] => {
    const selectedDriverIds = actualResultDrivers
      .map((driver, index) => index !== currentPosition - 1 ? driver?.id : null)
      .filter(id => id !== null);
    
    return drivers.filter(driver => !selectedDriverIds.includes(driver.id));
  };

  const initializePositions = () => {
    const emptyArrayGuess = new Array(numPositions).fill(null);
    const emptyArrayResult = new Array(NUM_POSITIONS_RESULT).fill(null);
    setUserGuessDrivers([...emptyArrayGuess]);
    setActualResultDrivers([...emptyArrayResult]);
    setScoreDetails([]);
    setTotalScore(0);
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

  // Handlers para drag and drop - Palpite
  const handleGuessDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    setUserGuessDrivers(prev => {
      const updatedDrivers = Array.from(prev);
      const [movedDriver] = updatedDrivers.splice(sourceIndex, 1);
      updatedDrivers.splice(destinationIndex, 0, movedDriver);
      return updatedDrivers;
    });
  };

  // Handlers para drag and drop - Resultado Real
  const handleActualDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    setActualResultDrivers(prev => {
      const updatedDrivers = Array.from(prev);
      const [movedDriver] = updatedDrivers.splice(sourceIndex, 1);
      updatedDrivers.splice(destinationIndex, 0, movedDriver);
      return updatedDrivers;
    });
  };

  // Handlers para seleção de pilotos
  const handleGuessDriverSelect = (driver: Driver | null, position: number) => {
    setUserGuessDrivers(prev => {
      const newSelection = [...prev];
      
      // Se driver é null, apenas limpar a posição
      if (!driver) {
        newSelection[position - 1] = null;
        return newSelection;
      }
      
      // Se o piloto já está selecionado em outra posição, remove ele de lá
      const existingIndex = newSelection.findIndex(d => d && d.id === driver.id);
      if (existingIndex !== -1 && existingIndex !== position - 1) {
        newSelection[existingIndex] = null;
      }
      
      newSelection[position - 1] = driver;
      return newSelection;
    });
  };

  const handleActualDriverSelect = (driver: Driver | null, position: number) => {
    setActualResultDrivers(prev => {
      const newSelection = [...prev];
      
      // Se driver é null, apenas limpar a posição
      if (!driver) {
        newSelection[position - 1] = null;
        return newSelection;
      }
      
      // Se o piloto já está selecionado em outra posição, remove ele de lá
      const existingIndex = newSelection.findIndex(d => d && d.id === driver.id);
      if (existingIndex !== -1 && existingIndex !== position - 1) {
        newSelection[existingIndex] = null;
      }
      
      newSelection[position - 1] = driver;
      return newSelection;
    });
  };

  const calculateScore = () => {
    // Verificar se todos os campos estão preenchidos
    const allGuessesSet = userGuessDrivers.every(d => d !== null);
    // Verificar apenas as primeiras posições do resultado real baseado no palpite
    const allActualSet = actualResultDrivers.slice(0, numPositions).every(d => d !== null);
    
    if (!allGuessesSet || !allActualSet) {
      toast.error('Por favor, preencha todas as posições antes de calcular.');
      return;
    }

    // Converter para arrays de IDs dos pilotos para usar nas calculadoras
    const guessArray = userGuessDrivers.map(d => d!.id);
    // Usar apenas as primeiras posições do resultado real baseado no número de posições do palpite
    const actualArray = actualResultDrivers.slice(0, numPositions).map(d => d!.id);

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
      const guessDriver = userGuessDrivers[i];
      const actualDriver = actualResultDrivers[i];

      if (guessDriver && actualDriver) {
        // Encontrar onde o piloto real terminou no meu palpite
        const guessedPosition = userGuessDrivers.findIndex(d => d && d.id === actualDriver.id);
        
        // Calcular pontos individuais baseado na posição real (i) e posição do palpite (guessedPosition)
        let individualPoints = 0;
        
        if (guessedPosition >= 0) {
          // Calcular pontos usando a mesma lógica do backend
          // A pontuação é baseada na posição real (i) e onde o piloto foi colocado no palpite (guessedPosition)
          
          if (guessType === 'QUALIFYING') {
            // Para qualifying, usar as tabelas de pontuação específicas de cada posição
            const scoreTables = [
              [5.0, 4.25, 3.612], // 1º lugar real
              [4.25, 5.0, 4.25, 2.89], // 2º lugar real
              [3.612, 4.25, 5.0, 3.4, 2.89], // 3º lugar real
              [0, 3.612, 4.25, 4.0, 3.4, 2.89], // 4º lugar real
              [0, 0, 3.612, 3.4, 4.0, 3.4, 2.167], // 5º lugar real
              [0, 0, 0, 2.89, 3.4, 4.0, 2.55, 2.167], // 6º lugar real
              [0, 0, 0, 0, 2.89, 3.4, 3.0, 2.55, 2.167], // 7º lugar real
              [0, 0, 0, 0, 0, 2.89, 2.55, 3.0, 2.55], // 8º lugar real
              [0, 0, 0, 0, 0, 0, 2.167, 2.55, 3.0, 2.55], // 9º lugar real
              [0, 0, 0, 0, 0, 0, 0, 2.167, 2.55, 3.0], // 10º lugar real
              [0, 0, 0, 0, 0, 0, 0, 0, 2.167, 2.55], // 11º lugar real
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 2.167] // 12º lugar real
            ];
            
            if (i < scoreTables.length && guessedPosition < scoreTables[i].length) {
              individualPoints = scoreTables[i][guessedPosition];
            }
          } else {
            // Para corrida, usar as tabelas de pontuação específicas de cada posição
            const scoreTables = [
              [25, 21.25, 18.062, 12.282, 10.44], // 1º lugar real
              [21.25, 25, 21.25, 14.45, 12.282, 10.44], // 2º lugar real
              [18.062, 21.25, 25, 17, 14.45, 12.282, 7.83], // 3º lugar real
              [15.353, 18.062, 21.25, 20, 17, 14.45, 9.212, 7.83], // 4º lugar real
              [13.05, 15.353, 18.062, 17, 20, 17, 10.837, 9.212, 7.83], // 5º lugar real
              [0, 13.05, 15.353, 14.45, 17, 20, 12.75, 10.837, 9.212, 7.83], // 6º lugar real
              [0, 0, 13.05, 12.282, 14.45, 17, 15, 12.75, 10.837, 9.212], // 7º lugar real
              [0, 0, 0, 10.44, 12.282, 14.45, 12.75, 15, 12.75, 10.837], // 8º lugar real
              [0, 0, 0, 0, 10.44, 12.282, 10.837, 12.75, 15, 12.75], // 9º lugar real
              [0, 0, 0, 0, 0, 10.44, 9.212, 10.837, 12.75, 15], // 10º lugar real
              [0, 0, 0, 0, 0, 0, 7.83, 9.212, 10.837, 12.75], // 11º lugar real
              [0, 0, 0, 0, 0, 0, 0, 7.83, 9.212, 10.837], // 12º lugar real
              [0, 0, 0, 0, 0, 0, 0, 0, 7.83, 9.212], // 13º lugar real
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 7.83] // 14º lugar real
            ];
            
            if (i < scoreTables.length && guessedPosition < scoreTables[i].length) {
              individualPoints = scoreTables[i][guessedPosition];
            }
          }
        }

        const detail: ScoreDetail = {
          position: i + 1,
          guessPilot: guessDriver.name,
          actualPilot: actualDriver.name,
          points: Math.round(individualPoints * 1000) / 1000
        };

        details.push(detail);
      }
    }

    setScoreDetails(details);
    setTotalScore(Math.round(totalScore * 1000) / 1000);

    // Fazer scroll automático para a seção de resultados
    if (resultSectionRef.current) {
      resultSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
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

        {/* Seção Explicativa do Sistema de Pontuação */}
        <div className="bg-gradient-to-r from-blue-100 to-blue-100 rounded-lg p-6 mb-6 border border-blue-200">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
            📊 Como Funciona a Pontuação
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-black mb-3">🏎️ Sistema de Corrida</h3>
              <div className="bg-white rounded-lg p-4 space-y-2">
                <p className="text-sm text-black">
                  <strong>Máximo por posição:</strong> 25 pontos (1º lugar)
                </p>
                <p className="text-sm text-black">
                  • Pontuação varia conforme a precisão do palpite
                </p>
                <p className="text-sm text-black">
                  • Cada posição tem uma tabela própria de pontos
                </p>
                <p className="text-sm text-black">
                  • Quanto mais próximo da realidade, mais pontos
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-black mb-3">🏁 Sistema de Qualifying</h3>
              <div className="bg-white rounded-lg p-4 space-y-2">
                <p className="text-sm text-black">
                  <strong>Máximo por posição:</strong> 5 pontos (1º lugar)
                </p>
                <p className="text-sm text-black">
                  • Sistema mais simples que a corrida
                </p>
                <p className="text-sm text-black">
                  • Foco nas primeiras 12 posições
                </p>
                <p className="text-sm text-black">
                  • Menor variação de pontos entre posições
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-black">
              <strong>💡 Dica:</strong> O sistema premia não apenas acertos exatos, mas também proximidade. 
              Mesmo errando por algumas posições, você ainda ganha pontos!
            </p>
          </div>
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
          {/* Palpite do Usuário com Drag and Drop */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
              🎯 Seu Palpite
            </h2>
            <DragDropContext onDragEnd={handleGuessDragEnd}>
              <Droppable droppableId="guess-drivers">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {Array.from({ length: numPositions }, (_, i) => i + 1).map((position, index) => (
                      <Draggable 
                        key={position.toString()}
                        draggableId={`guess-${position.toString()}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-2 bg-white rounded-lg border ${
                              snapshot.isDragging 
                                ? 'border-f1-red shadow-lg' 
                                : 'border-gray-200'
                            } p-2 transition-all duration-200`}
                          >
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab hover:bg-gray-100 p-2 rounded transition-colors active:cursor-grabbing"
                            >
                              <Bars3Icon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <DriverAutocomplete
                                drivers={getAvailableDriversForGuess(position)}
                                selectedDriver={userGuessDrivers[position - 1]}
                                onSelect={(driver) => handleGuessDriverSelect(driver, position)}
                                position={position}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>

          {/* Resultado Real com Drag and Drop */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
              🏆 Resultado Real
            </h2>
            <DragDropContext onDragEnd={handleActualDragEnd}>
              <Droppable droppableId="actual-drivers">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {Array.from({ length: NUM_POSITIONS_RESULT }, (_, i) => i + 1).map((position, index) => (
                      <Draggable 
                        key={position.toString()}
                        draggableId={`actual-${position.toString()}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-2 bg-white rounded-lg border ${
                              snapshot.isDragging 
                                ? 'border-f1-red shadow-lg' 
                                : 'border-gray-200'
                            } p-2 transition-all duration-200`}
                          >
                            <div 
                              {...provided.dragHandleProps}
                              className="cursor-grab hover:bg-gray-100 p-2 rounded transition-colors active:cursor-grabbing"
                            >
                              <Bars3Icon className="w-5 h-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <DriverAutocomplete
                                drivers={getAvailableDriversForActual(position)}
                                selectedDriver={actualResultDrivers[position - 1]}
                                onSelect={(driver) => handleActualDriverSelect(driver, position)}
                                position={position}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>

        {/* Resultado do Cálculo */}
        {scoreDetails.length > 0 && (
          <div ref={resultSectionRef} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
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