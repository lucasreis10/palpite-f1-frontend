'use client'

import { useState, useEffect } from 'react';
import { DriverAutocomplete } from './DriverAutocomplete';
import { Tab } from '@headlessui/react';
import { guessService, Pilot, NextGrandPrix, GuessResponse } from '@/services/guesses';
import { useAuth } from '@/hooks/useAuth';

interface Driver {
  id: number;
  name: string;
  team: string;
}

export function BetForm() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedQualifyingDrivers, setSelectedQualifyingDrivers] = useState<(Driver | null)[]>(new Array(10).fill(null));
  const [selectedRaceDrivers, setSelectedRaceDrivers] = useState<(Driver | null)[]>(new Array(10).fill(null));
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [nextGrandPrix, setNextGrandPrix] = useState<NextGrandPrix | null>(null);
  const [existingQualifyingGuess, setExistingQualifyingGuess] = useState<GuessResponse | null>(null);
  const [existingRaceGuess, setExistingRaceGuess] = useState<GuessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Converter Pilot para Driver (compatibilidade com componente existente)
  const convertPilotToDriver = (pilot: Pilot): Driver => ({
    id: pilot.id,
    name: pilot.fullName,
    team: pilot.constructor?.name || 'Sem Equipe'
  });

  // Converter Driver para Pilot ID
  const getDriverPilotId = (driver: Driver): number => driver.id;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Carregar pilotos e próximo GP em paralelo
        const [pilotsData, nextGpData] = await Promise.all([
          guessService.getAllPilots(),
          guessService.getNextGrandPrix()
        ]);

        setPilots(pilotsData);
        setNextGrandPrix(nextGpData);

        // Se há um próximo GP e usuário logado, carregar palpites existentes
        if (nextGpData && user && user.id) {
          const [qualifyingGuess, raceGuess] = await Promise.all([
            guessService.getUserGuessForGrandPrix(user.id, nextGpData.id, 'QUALIFYING'),
            guessService.getUserGuessForGrandPrix(user.id, nextGpData.id, 'RACE')
          ]);

          setExistingQualifyingGuess(qualifyingGuess);
          setExistingRaceGuess(raceGuess);

          // Preencher formulário com palpites existentes
          if (qualifyingGuess) {
            const qualifyingDrivers = qualifyingGuess.pilots.map(pilot => convertPilotToDriver(pilot));
            setSelectedQualifyingDrivers([...qualifyingDrivers, ...new Array(Math.max(0, 10 - qualifyingDrivers.length)).fill(null)]);
          }

          if (raceGuess) {
            const raceDrivers = raceGuess.pilots.map(pilot => convertPilotToDriver(pilot));
            setSelectedRaceDrivers([...raceDrivers, ...new Array(Math.max(0, 10 - raceDrivers.length)).fill(null)]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    // Só carregar dados quando a autenticação não estiver carregando
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  const drivers: Driver[] = pilots.map(convertPilotToDriver);

  const handleQualifyingDriverSelect = (driver: Driver, position: number) => {
    setSelectedQualifyingDrivers(prev => {
      const newSelection = [...prev];
      
      // Se o piloto já está selecionado em outra posição, remove ele de lá
      const existingIndex = newSelection.findIndex(d => d && d.id === driver.id);
      if (existingIndex !== -1 && existingIndex !== position - 1) {
        newSelection[existingIndex] = null;
      }
      
      newSelection[position - 1] = driver;
      return newSelection;
    });
  };

  const handleRaceDriverSelect = (driver: Driver, position: number) => {
    setSelectedRaceDrivers(prev => {
      const newSelection = [...prev];
      
      // Se o piloto já está selecionado em outra posição, remove ele de lá
      const existingIndex = newSelection.findIndex(d => d && d.id === driver.id);
      if (existingIndex !== -1 && existingIndex !== position - 1) {
        newSelection[existingIndex] = null;
      }
      
      newSelection[position - 1] = driver;
      return newSelection;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !nextGrandPrix) {
      setError('Usuário não logado ou nenhum GP disponível');
      return;
    }

    if (selectedQualifyingDrivers.some(driver => driver === null)) {
      setError('Por favor, selecione todos os pilotos para a classificação');
      return;
    }
    if (selectedRaceDrivers.some(driver => driver === null)) {
      setError('Por favor, selecione todos os pilotos para a corrida');
      return;
    }

    // Verificar se há pilotos duplicados na classificação
    const qualifyingIds = selectedQualifyingDrivers.filter(d => d !== null).map(d => d!.id);
    const uniqueQualifyingIds = new Set(qualifyingIds);
    if (qualifyingIds.length !== uniqueQualifyingIds.size) {
      setError('Não é possível selecionar o mesmo piloto mais de uma vez na classificação');
      return;
    }

    // Verificar se há pilotos duplicados na corrida
    const raceIds = selectedRaceDrivers.filter(d => d !== null).map(d => d!.id);
    const uniqueRaceIds = new Set(raceIds);
    if (raceIds.length !== uniqueRaceIds.size) {
      setError('Não é possível selecionar o mesmo piloto mais de uma vez na corrida');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const qualifyingPilotIds = selectedQualifyingDrivers
        .filter(driver => driver !== null)
        .map(driver => getDriverPilotId(driver!));

      const racePilotIds = selectedRaceDrivers
        .filter(driver => driver !== null)
        .map(driver => getDriverPilotId(driver!));

      // Salvar ou atualizar palpite de classificação
      if (existingQualifyingGuess) {
        await guessService.updateGuess(user.id, existingQualifyingGuess.id, {
          pilotIds: qualifyingPilotIds
        });
      } else {
        const newQualifyingGuess = await guessService.createGuess(user.id, {
          grandPrixId: nextGrandPrix.id,
          guessType: 'QUALIFYING',
          pilotIds: qualifyingPilotIds
        });
        setExistingQualifyingGuess(newQualifyingGuess);
      }

      // Salvar ou atualizar palpite de corrida
      if (existingRaceGuess) {
        await guessService.updateGuess(user.id, existingRaceGuess.id, {
          pilotIds: racePilotIds
        });
      } else {
        const newRaceGuess = await guessService.createGuess(user.id, {
          grandPrixId: nextGrandPrix.id,
          guessType: 'RACE',
          pilotIds: racePilotIds
        });
        setExistingRaceGuess(newRaceGuess);
      }

      setSuccessMessage('Palpites salvos com sucesso!');
    } catch (error: unknown) {
      console.error('Erro ao salvar palpites:', error);
      setError(error instanceof Error ? error.message : 'Erro ao salvar palpites. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setSelectedQualifyingDrivers(new Array(10).fill(null));
    setSelectedRaceDrivers(new Array(10).fill(null));
    setError(null);
    setSuccessMessage(null);
  };

  const handleRepeatLastBet = () => {
    // Implementar lógica para repetir último palpite de outro GP
    // Por enquanto, apenas limpa mensagens
    setError(null);
    setSuccessMessage(null);
  };

  const handleCopyQualifyingToRace = () => {
    // Copiar palpites da classificação para a corrida
    const qualifyingDrivers = selectedQualifyingDrivers.filter(driver => driver !== null);
    if (qualifyingDrivers.length === 0) {
      setError('Nenhum piloto selecionado na classificação para copiar');
      return;
    }
    
    setSelectedRaceDrivers([...selectedQualifyingDrivers]);
    setError(null);
    setSuccessMessage(`${qualifyingDrivers.length} pilotos copiados da classificação para a corrida!`);
    
    // Limpar mensagem após 3 segundos
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  if (isLoading || authLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full max-w-full">
        <div className="p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!nextGrandPrix) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full max-w-full">
        <div className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Nenhum Grande Prêmio Disponível</h2>
            <p className="text-gray-600">
              Não há nenhum Grande Prêmio futuro disponível para palpites no momento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const qualifyingDeadlineOpen = guessService.isGuessDeadlineOpen(nextGrandPrix, 'QUALIFYING');
  const raceDeadlineOpen = guessService.isGuessDeadlineOpen(nextGrandPrix, 'RACE');

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full max-w-full">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{nextGrandPrix.name}</h2>
            <p className="text-gray-600 text-sm sm:text-base">
              {nextGrandPrix.circuitName} - {nextGrandPrix.city}, {nextGrandPrix.country}
            </p>
            <p className="text-sm text-gray-500">
              Temporada {nextGrandPrix.season} - Rodada {nextGrandPrix.round}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-100"></span>
              <span className="text-sm text-gray-600">Pódio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-100"></span>
              <span className="text-sm text-gray-600">Pontos</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 text-sm">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                  ${selected
                    ? 'bg-white text-f1-red shadow'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                Classificação
                {!qualifyingDeadlineOpen && (
                  <span className="ml-2 text-xs text-red-600">(Prazo encerrado)</span>
                )}
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                  ${selected
                    ? 'bg-white text-f1-red shadow'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                Corrida
                {!raceDeadlineOpen && (
                  <span className="ml-2 text-xs text-red-600">(Prazo encerrado)</span>
                )}
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-6">
              <Tab.Panel>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800 text-sm">
                    <strong>Prazo:</strong> {guessService.getGuessDeadline(nextGrandPrix, 'QUALIFYING')}
                    {existingQualifyingGuess && (
                      <span className="ml-2 text-green-700">(Palpite já enviado - você pode editar)</span>
                    )}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Seleção de Pilotos - Classificação */}
                  <div className="order-2 lg:order-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Selecione os Pilotos - Classificação</h3>
                    <div className="space-y-3">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((position) => (
                        <DriverAutocomplete
                          key={position}
                          drivers={drivers.filter(d => {
                            // Permite o piloto se ele não está selecionado em nenhuma posição
                            // OU se ele está selecionado na posição atual
                            const isSelected = selectedQualifyingDrivers.some(selected => selected && selected.id === d.id);
                            const isCurrentPosition = selectedQualifyingDrivers[position - 1]?.id === d.id;
                            return !isSelected || isCurrentPosition;
                          })}
                          selectedDriver={selectedQualifyingDrivers[position - 1]}
                          onSelect={(driver) => handleQualifyingDriverSelect(driver, position)}
                          position={position}
                          disabled={!qualifyingDeadlineOpen}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview do Palpite - Classificação */}
                  <div className="order-1 lg:order-2 sticky top-0 lg:top-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Seu Palpite - Classificação</h3>
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                      {selectedQualifyingDrivers.map((driver, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0"
                        >
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index < 3 ? 'bg-green-100 text-green-800' : 
                            index < 6 ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {index + 1}
                          </span>
                          {driver ? (
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">{driver.name}</p>
                              <p className="text-sm text-gray-500 truncate">{driver.team}</p>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">Selecione um piloto</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-blue-800 text-sm">
                    <strong>Prazo:</strong> {guessService.getGuessDeadline(nextGrandPrix, 'RACE')}
                    {existingRaceGuess && (
                      <span className="ml-2 text-green-700">(Palpite já enviado - você pode editar)</span>
                    )}
                  </p>
                </div>

                <div className="mb-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleCopyQualifyingToRace}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!raceDeadlineOpen || selectedQualifyingDrivers.every(driver => driver === null)}
                    title={
                      !raceDeadlineOpen 
                        ? "Prazo da corrida encerrado" 
                        : selectedQualifyingDrivers.every(driver => driver === null)
                        ? "Selecione pilotos na classificação primeiro"
                        : "Copiar todos os pilotos da classificação para a corrida"
                    }
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar da Classificação
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Seleção de Pilotos - Corrida */}
                  <div className="order-2 lg:order-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Selecione os Pilotos - Corrida</h3>
                    <div className="space-y-3">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((position) => (
                        <DriverAutocomplete
                          key={position}
                          drivers={drivers.filter(d => {
                            // Permite o piloto se ele não está selecionado em nenhuma posição
                            // OU se ele está selecionado na posição atual
                            const isSelected = selectedRaceDrivers.some(selected => selected && selected.id === d.id);
                            const isCurrentPosition = selectedRaceDrivers[position - 1]?.id === d.id;
                            return !isSelected || isCurrentPosition;
                          })}
                          selectedDriver={selectedRaceDrivers[position - 1]}
                          onSelect={(driver) => handleRaceDriverSelect(driver, position)}
                          position={position}
                          disabled={!raceDeadlineOpen}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview do Palpite - Corrida */}
                  <div className="order-1 lg:order-2 sticky top-0 lg:top-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Seu Palpite - Corrida</h3>
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                      {selectedRaceDrivers.map((driver, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0"
                        >
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index < 3 ? 'bg-green-100 text-green-800' : 
                            index < 6 ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {index + 1}
                          </span>
                          {driver ? (
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">{driver.name}</p>
                              <p className="text-sm text-gray-500 truncate">{driver.team}</p>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">Selecione um piloto</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleRepeatLastBet}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
              disabled={isSaving}
            >
              Repetir Último Palpite
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
              disabled={isSaving}
            >
              Limpar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-f1-red text-black rounded-md hover:bg-f1-red/90 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving || (!qualifyingDeadlineOpen && !raceDeadlineOpen)}
            >
              {isSaving ? 'Salvando...' : 'Salvar Palpites'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 