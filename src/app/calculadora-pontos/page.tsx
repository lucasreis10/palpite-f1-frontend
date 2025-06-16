'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { DriverAutocomplete } from '../../components/DriverAutocomplete';
import { guessService, Pilot } from '../../services/guesses';
import { F1Service } from '../../services/f1';

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
  const [calculating, setCalculating] = useState(false);
  const [importingQualifying, setImportingQualifying] = useState(false); // Loading para import de classificação
  const [importingRace, setImportingRace] = useState(false); // Loading para import de corrida
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

  const calculateScore = async () => {
    // Verificar se todos os campos estão preenchidos
    const allGuessesSet = userGuessDrivers.every(d => d !== null);
    // Verificar apenas as primeiras posições do resultado real baseado no palpite
    const allActualSet = actualResultDrivers.slice(0, numPositions).every(d => d !== null);
    
    if (!allGuessesSet || !allActualSet) {
      toast.error('Por favor, preencha todas as posições antes de calcular.');
      return;
    }

    setCalculating(true); // Iniciar loading

    try {
      // Converter para arrays de IDs dos pilotos
      const userGuess = userGuessDrivers.map(d => d!.id);
      // Usar apenas as primeiras posições do resultado real baseado no número de posições do palpite
      const actualResult = actualResultDrivers.slice(0, numPositions).map(d => d!.id);

      console.log('🧮 Calculadora - Dados recebidos:', {
        guessType,
        userGuessLength: userGuess.length,
        actualResultLength: actualResult.length
      });

      console.log('📤 Enviando para backend Java:', {
        guessType,
        userGuess,
        actualResult
      });

      // Chamar o endpoint da calculadora com timeout otimizado
      const response = await fetch('/api/calculator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guessType,
          userGuess,
          actualResult
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao calcular pontuação');
      }

      const data = await response.json();
      console.log('✅ Resposta do backend Java:', data);

      if (!data.success) {
        throw new Error(data.error || 'Erro no cálculo');
      }

      // Criar detalhes da pontuação para exibição usando os dados do backend
      const details: ScoreDetail[] = data.details.map((detail: any) => ({
        position: detail.position,
        guessPilot: detail.guessPilotName,
        actualPilot: detail.actualPilotName,
        points: Math.round(detail.points * 1000) / 1000
      }));

      setScoreDetails(details);
      setTotalScore(Math.round(data.totalScore * 1000) / 1000);

      toast.success('Pontuação calculada com sucesso!');

      // Fazer scroll automático para a seção de resultados
      if (resultSectionRef.current) {
        resultSectionRef.current.scrollIntoView({ behavior: 'smooth' });
      }

    } catch (error: any) {
      console.error('❌ Erro ao calcular pontuação:', error);
      toast.error(error.message || 'Erro ao calcular pontuação');
    } finally {
      setCalculating(false); // Finalizar loading
    }
  };

  const resetCalculator = () => {
    initializePositions();
  };

  // Função para encontrar piloto correspondente no sistema
  const findMatchingDriver = (ergastDriver: any): Driver | null => {
    const { givenName, familyName, code } = ergastDriver;
    const fullName = `${givenName} ${familyName}`;
    
    // Tentar várias estratégias de correspondência
    let matchedDriver = null;
    
    // 1. Correspondência exata por nome completo
    matchedDriver = drivers.find(driver => 
      driver.name.toLowerCase() === fullName.toLowerCase()
    );
    if (matchedDriver) return matchedDriver;
    
    // 2. Correspondência por sobrenome
    matchedDriver = drivers.find(driver => 
      driver.name.toLowerCase().includes(familyName.toLowerCase())
    );
    if (matchedDriver) return matchedDriver;
    
    // 3. Correspondência por nome
    matchedDriver = drivers.find(driver => 
      driver.name.toLowerCase().includes(givenName.toLowerCase())
    );
    if (matchedDriver) return matchedDriver;
    
    // 4. Correspondência por código (se disponível)
    if (code) {
      matchedDriver = drivers.find(driver => 
        driver.name.toLowerCase().includes(code.toLowerCase())
      );
      if (matchedDriver) return matchedDriver;
    }
    
    // 5. Correspondência parcial (qualquer parte do nome)
    matchedDriver = drivers.find(driver => {
      const driverNameLower = driver.name.toLowerCase();
      const givenNameLower = givenName.toLowerCase();
      const familyNameLower = familyName.toLowerCase();
      
      return driverNameLower.includes(givenNameLower) || 
             driverNameLower.includes(familyNameLower) ||
             givenNameLower.includes(driverNameLower.split(' ')[0]) ||
             familyNameLower.includes(driverNameLower.split(' ').pop() || '');
    }) || null;
    
    return matchedDriver;
  };

  // Função para importar resultado da última classificação
  const importLastQualifying = async () => {
    setImportingQualifying(true);
    try {
      const qualifyingResults = await F1Service.getLatestQualifyingResults();

      if (!qualifyingResults || qualifyingResults.length === 0) {
        throw new Error('Nenhum resultado de classificação encontrado');
      }

      // Mapear os resultados para os pilotos do sistema
      const mappedDrivers: (Driver | null)[] = new Array(NUM_POSITIONS_RESULT).fill(null);
      let matchedCount = 0;
      
      for (let i = 0; i < Math.min(qualifyingResults.length, NUM_POSITIONS_RESULT); i++) {
        const result = qualifyingResults[i];
        // Criar um objeto compatível com findMatchingDriver
        const ergastDriver = {
          givenName: result.driver.split(' ')[0],
          familyName: result.driver.split(' ').slice(1).join(' '),
          code: ''
        };
        const matchedDriver = findMatchingDriver(ergastDriver);

        if (matchedDriver) {
          mappedDrivers[i] = matchedDriver;
          matchedCount++;
        }
      }

      setActualResultDrivers(mappedDrivers);
      
      toast.success(`Classificação importada! ${matchedCount}/${qualifyingResults.length} pilotos encontrados.`);

    } catch (error: any) {
      console.error('❌ Erro ao importar classificação:', error);
      toast.error(error.message || 'Erro ao importar resultado da classificação');
    } finally {
      setImportingQualifying(false);
    }
  };

  // Função para importar resultado da última corrida
  const importLastRace = async () => {
    setImportingRace(true);
    try {
      const raceResults = await F1Service.getLatestRaceResults();

      if (!raceResults || raceResults.length === 0) {
        throw new Error('Nenhum resultado de corrida encontrado');
      }

      // Mapear os resultados para os pilotos do sistema
      const mappedDrivers: (Driver | null)[] = new Array(NUM_POSITIONS_RESULT).fill(null);
      let matchedCount = 0;
      
      for (let i = 0; i < Math.min(raceResults.length, NUM_POSITIONS_RESULT); i++) {
        const result = raceResults[i];
        // Criar um objeto compatível com findMatchingDriver
        const ergastDriver = {
          givenName: result.driver.split(' ')[0],
          familyName: result.driver.split(' ').slice(1).join(' '),
          code: ''
        };
        const matchedDriver = findMatchingDriver(ergastDriver);

        if (matchedDriver) {
          mappedDrivers[i] = matchedDriver;
          matchedCount++;
        }
      }

      setActualResultDrivers(mappedDrivers);
      
      toast.success(`Corrida importada! ${matchedCount}/${raceResults.length} pilotos encontrados.`);

    } catch (error: any) {
      console.error('❌ Erro ao importar corrida:', error);
      toast.error(error.message || 'Erro ao importar resultado da corrida');
    } finally {
      setImportingRace(false);
    }
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
          <div className="space-y-4">
            {/* Primeira linha: Configurações */}
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
            </div>

            {/* Segunda linha: Botões de ação */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={calculateScore}
                disabled={calculating}
                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                  calculating 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {calculating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {calculating ? 'Calculando...' : 'Calcular Pontos'}
              </button>
              <button
                onClick={resetCalculator}
                disabled={calculating}
                className={`px-4 py-2 rounded-md transition-colors ${
                  calculating
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                Limpar
              </button>
            </div>
            
            {/* Terceira linha: Botões de importação */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-black">🌐 Importar Resultados Reais da F1:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={importLastQualifying}
                  disabled={importingQualifying || importingRace || calculating}
                  className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    importingQualifying || importingRace || calculating
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {importingQualifying && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {importingQualifying ? 'Importando...' : '📥 Última Classificação'}
                </button>
                <button
                  onClick={importLastRace}
                  disabled={importingRace || importingQualifying || calculating}
                  className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    importingRace || importingQualifying || calculating
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-orange-600 text-white hover:bg-orange-700'
                  }`}
                >
                  {importingRace && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {importingRace ? 'Importando...' : '🏁 Última Corrida'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Os resultados são importados automaticamente da API oficial da Fórmula 1 (Ergast)
              </p>
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