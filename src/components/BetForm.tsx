'use client'

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { DriverAutocomplete } from './DriverAutocomplete';
import { Toast } from './Toast';
import { Tab } from '@headlessui/react';
import { guessService, Pilot, NextGrandPrix, GuessResponse } from './../services/guesses';
import { useAuth } from './../hooks/useAuth';
import { useCopyToClipboard } from './../hooks/useCopyToClipboard';
import './../utils/auth-debug'; // Importar utilitário de debug
import { Bars3Icon } from '@heroicons/react/24/outline';

interface Driver {
  id: number;
  name: string;
  team: string;
}

export function BetForm() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { copyToClipboard, isCopying, copySuccess, formatGuessToText } = useCopyToClipboard();
  const [selectedQualifyingDrivers, setSelectedQualifyingDrivers] = useState<(Driver | null)[]>(new Array(10).fill(null));
  const [selectedRaceDrivers, setSelectedRaceDrivers] = useState<(Driver | null)[]>(new Array(10).fill(null));
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [nextGrandPrix, setNextGrandPrix] = useState<NextGrandPrix | null>(null);
  const [existingQualifyingGuess, setExistingQualifyingGuess] = useState<GuessResponse | null>(null);
  const [existingRaceGuess, setExistingRaceGuess] = useState<GuessResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRepeatingLastBet, setIsRepeatingLastBet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });
  const [showPreview, setShowPreview] = useState(false);
  const [showTextPreview, setShowTextPreview] = useState(false);

  // Debug mais detalhado
  useEffect(() => {
    console.log('🔍 BetForm - Estado de autenticação atualizado:', {
      user: user ? { id: user.id, name: user.name, email: user.email } : null,
      authLoading,
      isAuthenticated,
      isLoading,
      nextGrandPrix: nextGrandPrix ? { id: nextGrandPrix.id, name: nextGrandPrix.name } : null,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [user, authLoading, isAuthenticated, isLoading, nextGrandPrix]);

  // Listener para mudanças de autenticação
  useEffect(() => {
    const handleAuthChange = (event: CustomEvent) => {
      console.log('🔔 BetForm - Evento de mudança de autenticação recebido:', event.detail);
      
      // Se o usuário acabou de fazer login, recarregar os dados
      if (event.detail.type === 'login' && event.detail.user) {
        console.log('👤 BetForm - Usuário logou, recarregando dados...');
        // Forçar re-render do componente para atualizar o estado do botão
        setTimeout(() => {
          console.log('🔄 BetForm - Estado atualizado após login');
          // Opcional: você pode forçar um reload dos dados aqui se necessário
          // loadData();
        }, 100);
      }
    };

    window.addEventListener('authStateChanged', handleAuthChange as EventListener);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange as EventListener);
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 BetForm - Iniciando carregamento de dados...');
      try {
        setIsLoading(true);
        setError(null);

        // Carregar pilotos e próximo GP em paralelo
        const [pilotsData, nextGpData] = await Promise.all([
          guessService.getAllPilots(),
          guessService.getNextGrandPrix()
        ]);

        console.log('📊 BetForm - Dados carregados:', {
          pilotos: pilotsData.length,
          nextGP: nextGpData ? nextGpData.name : 'Nenhum'
        });

        setPilots(pilotsData);
        setNextGrandPrix(nextGpData);

        // Se há um próximo GP e usuário logado, carregar palpites existentes
        if (nextGpData && user?.id) {
          console.log('🎯 BetForm - Carregando palpites existentes para usuário:', user.id);
          try {
            const [qualifyingGuess, raceGuess] = await Promise.all([
              guessService.getUserGuessForGrandPrix(user.id, nextGpData.id, 'QUALIFYING'),
              guessService.getUserGuessForGrandPrix(user.id, nextGpData.id, 'RACE')
            ]);

            console.log('📝 BetForm - Palpites encontrados:', {
              qualifying: !!qualifyingGuess,
              race: !!raceGuess
            });

            setExistingQualifyingGuess(qualifyingGuess);
            setExistingRaceGuess(raceGuess);

            // Preencher formulário com palpites existentes
            if (qualifyingGuess?.pilots) {
              const qualifyingDrivers = qualifyingGuess.pilots.map(pilot => convertPilotToDriver(pilot));
              setSelectedQualifyingDrivers([...qualifyingDrivers, ...new Array(Math.max(0, 10 - qualifyingDrivers.length)).fill(null)]);
            }

            if (raceGuess?.pilots) {
              const raceDrivers = raceGuess.pilots.map(pilot => convertPilotToDriver(pilot));
              setSelectedRaceDrivers([...raceDrivers, ...new Array(Math.max(0, 10 - raceDrivers.length)).fill(null)]);
            }
          } catch (guessError) {
            console.error('❌ BetForm - Erro ao carregar palpites existentes:', guessError);
          }
        } else {
          console.log('⚠️ BetForm - Não carregando palpites:', {
            temGP: !!nextGpData,
            temUsuario: !!user?.id,
            userId: user?.id
          });
        }
      } catch (error) {
        console.error('❌ BetForm - Erro ao carregar dados:', error);
        setError('Erro ao carregar dados. Tente novamente.');
      } finally {
        setIsLoading(false);
        console.log('✅ BetForm - Carregamento finalizado');
      }
    };

    // Carregar dados quando o usuário estiver disponível e não estiver carregando
    if (!authLoading) {
      console.log('🔄 BetForm - Condições para carregar dados:', {
        authLoading,
        userId: user?.id,
        shouldLoad: true
      });
      loadData();
    } else {
      console.log('⏳ BetForm - Aguardando autenticação...', { authLoading });
    }
  }, [user?.id, authLoading, isAuthenticated]); // Adicionar isAuthenticated como dependência

  // Converter Pilot para Driver (compatibilidade com componente existente)
  const convertPilotToDriver = (pilot: Pilot): Driver => ({
    id: pilot.id,
    name: pilot.fullName,
    team: pilot.constructor?.name || 'Sem Equipe'
  });

  // Converter Driver para Pilot ID
  const getDriverPilotId = (driver: Driver): number => driver.id;

  // Função para mostrar toast
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    });
  };

  // Função para fechar toast
  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const drivers: Driver[] = pilots.map(convertPilotToDriver);

  const handleQualifyingDriverSelect = (driver: Driver | null, position: number) => {
    setSelectedQualifyingDrivers(prev => {
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

  const handleRaceDriverSelect = (driver: Driver | null, position: number) => {
    setSelectedRaceDrivers(prev => {
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

  const handleQualifyingDragEnd = (result: DropResult) => {
    if (!result.destination || !qualifyingDeadlineOpen) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    setSelectedQualifyingDrivers(prev => {
      const updatedDrivers = Array.from(prev);
      const [movedDriver] = updatedDrivers.splice(sourceIndex, 1);
      updatedDrivers.splice(destinationIndex, 0, movedDriver);
      return updatedDrivers;
    });
  };

  const handleRaceDragEnd = (result: DropResult) => {
    if (!result.destination || !raceDeadlineOpen) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    setSelectedRaceDrivers(prev => {
      const updatedDrivers = Array.from(prev);
      const [movedDriver] = updatedDrivers.splice(sourceIndex, 1);
      updatedDrivers.splice(destinationIndex, 0, movedDriver);
      return updatedDrivers;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Logs de diagnóstico
    console.log('Estado atual:', {
      user,
      nextGrandPrix,
      authLoading,
      isLoading,
      existingQualifyingGuess,
      existingRaceGuess
    });
    
    if (authLoading || isLoading) {
      showToast('Aguarde o carregamento dos dados...', 'info');
      return;
    }

    if (!user) {
      showToast('Usuário não está logado. Por favor, faça login novamente.', 'error');
      return;
    }

    if (!nextGrandPrix) {
      showToast('Nenhum Grande Prêmio disponível no momento.', 'error');
      return;
    }

    if (selectedQualifyingDrivers.some(driver => driver === null)) {
      showToast('Por favor, selecione todos os pilotos para a classificação', 'error');
      return;
    }
    if (selectedRaceDrivers.some(driver => driver === null)) {
      showToast('Por favor, selecione todos os pilotos para a corrida', 'error');
      return;
    }

    // Verificar se há pilotos duplicados na classificação
    const qualifyingIds = selectedQualifyingDrivers.filter(d => d !== null).map(d => d!.id);
    const uniqueQualifyingIds = new Set(qualifyingIds);
    if (qualifyingIds.length !== uniqueQualifyingIds.size) {
      showToast('Não é possível selecionar o mesmo piloto mais de uma vez na classificação', 'error');
      return;
    }

    // Verificar se há pilotos duplicados na corrida
    const raceIds = selectedRaceDrivers.filter(d => d !== null).map(d => d!.id);
    const uniqueRaceIds = new Set(raceIds);
    if (raceIds.length !== uniqueRaceIds.size) {
      showToast('Não é possível selecionar o mesmo piloto mais de uma vez na corrida', 'error');
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

      showToast('Palpites salvos com sucesso! 🏁', 'success');
    } catch (error: unknown) {
      console.error('Erro ao salvar palpites:', error);
      showToast(error instanceof Error ? error.message : 'Erro ao salvar palpites. Tente novamente.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    // Limpar classificação
    setExistingQualifyingGuess(null);
    setSelectedQualifyingDrivers(new Array(10).fill(null));
    
    // Limpar corrida
    setExistingRaceGuess(null);
    setSelectedRaceDrivers(new Array(10).fill(null));
    
    // Limpar mensagens
    setError(null);
    setSuccessMessage(null);
    
    showToast('Palpites da classificação e corrida foram limpos!', 'success');
  };

  const handleRepeatLastBet = async () => {
    if (!user?.id) {
      showToast('Faça login para usar esta funcionalidade', 'error');
      return;
    }

    if (!nextGrandPrix) {
      showToast('Nenhum Grande Prêmio disponível', 'error');
      return;
    }

    try {
      setIsRepeatingLastBet(true);
      showToast('Buscando último palpite...', 'info');

      // Buscar histórico de palpites do usuário
      const userGuesses = await guessService.getUserGuesses(user.id);
      
      if (userGuesses.length === 0) {
        showToast('Nenhum palpite anterior encontrado', 'error');
        return;
      }

      // Filtrar apenas palpites de GPs diferentes do atual
      const otherGpGuesses = userGuesses.filter(guess => 
        guess.grandPrixId !== nextGrandPrix.id && guess.pilots && guess.pilots.length > 0
      );

      if (otherGpGuesses.length === 0) {
        showToast('Nenhum palpite anterior de outro GP encontrado', 'error');
        return;
      }

      // Buscar o mais recente palpite de qualifying e race
      const lastQualifyingGuess = otherGpGuesses
        .filter(guess => guess.guessType === 'QUALIFYING')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      const lastRaceGuess = otherGpGuesses
        .filter(guess => guess.guessType === 'RACE')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      let hasRepeated = false;

      // Repetir palpite de qualifying se existir
      if (lastQualifyingGuess && qualifyingDeadlineOpen) {
        const qualifyingDrivers = lastQualifyingGuess.pilots.map(pilot => convertPilotToDriver(pilot));
        
        // Verificar se todos os pilotos ainda estão ativos
        const availableDrivers = qualifyingDrivers.filter(driver => 
          drivers.some(d => d.id === driver.id)
        );

        if (availableDrivers.length > 0) {
          setSelectedQualifyingDrivers([
            ...availableDrivers, 
            ...new Array(Math.max(0, 10 - availableDrivers.length)).fill(null)
          ]);
          hasRepeated = true;
        }
      }

      // Repetir palpite de race se existir
      if (lastRaceGuess && raceDeadlineOpen) {
        const raceDrivers = lastRaceGuess.pilots.map(pilot => convertPilotToDriver(pilot));
        
        // Verificar se todos os pilotos ainda estão ativos
        const availableDrivers = raceDrivers.filter(driver => 
          drivers.some(d => d.id === driver.id)
        );

        if (availableDrivers.length > 0) {
          setSelectedRaceDrivers([
            ...availableDrivers, 
            ...new Array(Math.max(0, 10 - availableDrivers.length)).fill(null)
          ]);
          hasRepeated = true;
        }
      }

      if (hasRepeated) {
        const lastGpName = lastQualifyingGuess?.grandPrixName || lastRaceGuess?.grandPrixName || 'último GP';
        showToast(`Palpites do ${lastGpName} copiados com sucesso! 🔄`, 'success');
      } else {
        showToast('Não foi possível repetir: prazos encerrados ou pilotos indisponíveis', 'error');
      }

      // Limpar mensagens de erro/sucesso anteriores
      setError(null);
      setSuccessMessage(null);
    } catch (error) {
      console.error('Erro ao buscar último palpite:', error);
      showToast('Erro ao buscar último palpite. Tente novamente.', 'error');
    } finally {
      setIsRepeatingLastBet(false);
    }
  };

  const handleCopyQualifyingToRace = () => {
    // Copiar palpites da classificação para a corrida
    const qualifyingDrivers = selectedQualifyingDrivers.filter(driver => driver !== null);
    if (qualifyingDrivers.length === 0) {
      showToast('Nenhum piloto selecionado na classificação para copiar', 'error');
      return;
    }
    
    setSelectedRaceDrivers([...selectedQualifyingDrivers]);
    setError(null);
    setSuccessMessage(null);
    showToast(`${qualifyingDrivers.length} pilotos copiados da classificação para a corrida! 📋`, 'success');
  };

  const handleCopyPalpitesToClipboard = async () => {
    const hasAnyGuess = selectedQualifyingDrivers.some(d => d !== null) || selectedRaceDrivers.some(d => d !== null);
    
    if (!hasAnyGuess) {
      showToast('Nenhum palpite selecionado para copiar', 'error');
      return;
    }

    const success = await copyToClipboard(selectedQualifyingDrivers, selectedRaceDrivers, nextGrandPrix);
    
    if (success) {
      showToast('Palpites copiados para a área de transferência! 📋', 'success');
    } else {
      showToast('Erro ao copiar palpites. Tente novamente.', 'error');
    }
  };

  const handleShowTextPreview = () => {
    const hasAnyGuess = selectedQualifyingDrivers.some(d => d !== null) || selectedRaceDrivers.some(d => d !== null);
    
    if (!hasAnyGuess) {
      showToast('Nenhum palpite selecionado para visualizar', 'error');
      return;
    }

    setShowTextPreview(true);
  };

  if (isLoading || authLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-f1-red"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!nextGrandPrix) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">❌ Nenhum Grande Prêmio Disponível</h2>
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

  const PreviewComponent = ({ drivers, title, type }: { drivers: (Driver | null)[], title: string, type: 'qualifying' | 'race' }) => (
    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span>{type === 'qualifying' ? '🏎️' : '🏁'}</span>
        {title}
      </h4>
      <div className="space-y-2">
        {drivers.slice(0, 3).map((driver, index) => (
          <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-400 text-yellow-900 font-bold text-xs">
              {index + 1}
            </span>
            {driver ? (
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm truncate">{driver.name.split(' ').slice(-1)[0]}</p>
                <p className="text-xs text-gray-500 truncate">{driver.team.substring(0, 12)}...</p>
              </div>
            ) : (
              <p className="text-gray-400 italic text-sm">Selecione um piloto</p>
            )}
          </div>
        ))}
        {drivers.filter(d => d !== null).length > 3 && (
          <p className="text-xs text-gray-500 text-center">
            +{drivers.filter(d => d !== null).length - 3} pilotos selecionados
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header do GP - compacto para mobile */}
        <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-gray-900">
              <h2 className="text-lg sm:text-xl font-bold truncate">{nextGrandPrix.name}</h2>
              <p className="text-gray-600 text-sm truncate">
                {nextGrandPrix.circuitName} - {nextGrandPrix.city}
              </p>
              <p className="text-gray-500 text-xs">
                Temporada {nextGrandPrix.season} • Rodada {nextGrandPrix.round}
              </p>
            </div>
            {/* Preview rápido apenas em mobile */}
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="sm:hidden bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-gray-700 text-sm font-medium transition-colors"
            >
              {showPreview ? '🔼 Ocultar' : '🔽 Preview'}
            </button>
          </div>
        </div>

        {/* Preview móvel expandível */}
        {showPreview && (
          <div className="sm:hidden border-b border-gray-200 p-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-3">
              <PreviewComponent 
                drivers={selectedQualifyingDrivers} 
                title="Classificação" 
                type="qualifying"
              />
              <PreviewComponent 
                drivers={selectedRaceDrivers} 
                title="Corrida" 
                type="race"
              />
            </div>
          </div>
        )}

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <Tab.Group>
              <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
                <Tab
                  className={({ selected }) =>
                    `w-full rounded-lg py-3 px-3 text-sm font-medium leading-5 transition-all
                    ${selected
                      ? 'bg-white text-f1-red shadow-sm ring-1 ring-f1-red/20'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="flex items-center justify-center gap-2">
                    🏎️ <span className="hidden sm:inline">Classificação</span>
                    <span className="sm:hidden">Quali</span>
                  </span>
                  {!qualifyingDeadlineOpen && (
                    <span className="block text-xs text-red-600 mt-1">Prazo encerrado</span>
                  )}
                </Tab>
                <Tab
                  className={({ selected }) =>
                    `w-full rounded-lg py-3 px-3 text-sm font-medium leading-5 transition-all
                    ${selected
                      ? 'bg-white text-f1-red shadow-sm ring-1 ring-f1-red/20'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="flex items-center justify-center gap-2">
                    🏁 <span className="hidden sm:inline">Corrida</span>
                    <span className="sm:hidden">Race</span>
                  </span>
                  {!raceDeadlineOpen && (
                    <span className="block text-xs text-red-600 mt-1">Prazo encerrado</span>
                  )}
                </Tab>
              </Tab.List>
              <Tab.Panels className="mt-4 sm:mt-6">
                <Tab.Panel>
                  {/* Info do prazo */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <strong>⏰ Prazo:</strong> {guessService.getGuessDeadline(nextGrandPrix, 'QUALIFYING')}
                      {existingQualifyingGuess && (
                        <span className="block sm:inline sm:ml-2 text-green-700 font-medium">
                          ✓ Palpite enviado - você pode editar
                        </span>
                      )}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6">
                    {/* Seleção de Pilotos - Classificação */}
                    <div className="xl:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        🏎️ Selecione os Pilotos - Classificação
                      </h3>
                      <DragDropContext onDragEnd={handleQualifyingDragEnd}>
                        <Droppable droppableId="qualifying-drivers" isDropDisabled={!qualifyingDeadlineOpen} isCombineEnabled={false} ignoreContainerClipping={false}>
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                              {Array.from({ length: 10 }, (_, i) => i + 1).map((position, index) => (
                                <Draggable 
                                  key={position.toString()}
                                  draggableId={position.toString()}
                                  index={index}
                                  isDragDisabled={!qualifyingDeadlineOpen}
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
                                          drivers={drivers.filter(d => {
                                            const isSelected = selectedQualifyingDrivers.some(selected => selected && selected.id === d.id);
                                            const isCurrentPosition = selectedQualifyingDrivers[position - 1]?.id === d.id;
                                            return !isSelected || isCurrentPosition;
                                          })}
                                          selectedDriver={selectedQualifyingDrivers[position - 1]}
                                          onSelect={(driver) => handleQualifyingDriverSelect(driver, position)}
                                          position={position}
                                          disabled={!qualifyingDeadlineOpen}
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

                    {/* Preview do Palpite - Classificação - apenas desktop */}
                    <div className="hidden xl:block">
                      <div className="sticky top-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">🏎️ Seu Palpite - Classificação</h3>
                        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                          {selectedQualifyingDrivers.map((driver, index) => (
                            <div 
                              key={index}
                              className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0"
                            >
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                index < 3 ? 'bg-yellow-400 text-yellow-900' : 
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
                  </div>
                </Tab.Panel>
                <Tab.Panel>
                  {/* Info do prazo */}
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <strong>⏰ Prazo:</strong> {guessService.getGuessDeadline(nextGrandPrix, 'RACE')}
                      {existingRaceGuess && (
                        <span className="block sm:inline sm:ml-2 text-green-700 font-medium">
                          ✓ Palpite enviado - você pode editar
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Botão copiar */}
                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={handleCopyQualifyingToRace}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!raceDeadlineOpen || selectedQualifyingDrivers.every(driver => driver === null)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="hidden sm:inline">Copiar da Classificação</span>
                      <span className="sm:hidden">Copiar</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6">
                    {/* Seleção de Pilotos - Corrida */}
                    <div className="xl:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        🏁 Selecione os Pilotos - Corrida
                      </h3>
                      <DragDropContext onDragEnd={handleRaceDragEnd}>
                        <Droppable droppableId="race-drivers" isDropDisabled={!raceDeadlineOpen} isCombineEnabled={false} ignoreContainerClipping={false}>
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                              {Array.from({ length: 10 }, (_, i) => i + 1).map((position, index) => (
                                <Draggable 
                                  key={position.toString()}
                                  draggableId={position.toString()}
                                  index={index}
                                  isDragDisabled={!raceDeadlineOpen}
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
                                          drivers={drivers.filter(d => {
                                            const isSelected = selectedRaceDrivers.some(selected => selected && selected.id === d.id);
                                            const isCurrentPosition = selectedRaceDrivers[position - 1]?.id === d.id;
                                            return !isSelected || isCurrentPosition;
                                          })}
                                          selectedDriver={selectedRaceDrivers[position - 1]}
                                          onSelect={(driver) => handleRaceDriverSelect(driver, position)}
                                          position={position}
                                          disabled={!raceDeadlineOpen}
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

                    {/* Preview do Palpite - Corrida - apenas desktop */}
                    <div className="hidden xl:block">
                      <div className="sticky top-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">🏁 Seu Palpite - Corrida</h3>
                        <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                          {selectedRaceDrivers.map((driver, index) => (
                            <div 
                              key={index}
                              className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0"
                            >
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                index < 3 ? 'bg-yellow-400 text-yellow-900' : 
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
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>

            {/* Botões de ação - mobile-friendly */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleShowTextPreview}
                className="w-full sm:w-auto px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={!selectedQualifyingDrivers.some(d => d !== null) && !selectedRaceDrivers.some(d => d !== null)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="hidden sm:inline">Preview Texto</span>
                <span className="sm:hidden">👁️ Preview</span>
              </button>
              <button
                type="button"
                onClick={handleCopyPalpitesToClipboard}
                className="w-full sm:w-auto px-4 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={isCopying || (!selectedQualifyingDrivers.some(d => d !== null) && !selectedRaceDrivers.some(d => d !== null))}
              >
                {isCopying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                    <span>Copiando...</span>
                  </>
                ) : copySuccess ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">Copiar Palpites</span>
                    <span className="sm:hidden">Copiar</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleRepeatLastBet}
                className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={isSaving || isRepeatingLastBet}
              >
                {isRepeatingLastBet ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                    <span>Buscando...</span>
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Repetir Último Palpite</span>
                    <span className="sm:hidden">Repetir Último</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="w-full sm:w-auto px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
                disabled={isSaving}
              >
                <span className="hidden sm:inline">Limpar</span>
                <span className="sm:hidden"> Limpar</span>
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={
                  isSaving || 
                  (!qualifyingDeadlineOpen && !raceDeadlineOpen) || 
                  authLoading || 
                  isLoading || 
                  !user?.id
                }
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </>
                ) : authLoading || isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Carregando...</span>
                  </>
                ) : !user?.id ? (
                  <span>Faça login para salvar</span>
                ) : (
                  <span>Salvar Palpites</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de Preview do Texto */}
      {showTextPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">📋 Preview do Texto</h3>
              <button
                onClick={() => setShowTextPreview(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Este é o texto que será copiado:</p>
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                  {formatGuessToText(selectedQualifyingDrivers, selectedRaceDrivers, nextGrandPrix)}
                </pre>
              </div>
            </div>
            
            <div className="flex gap-3 p-4 border-t border-gray-200">
              <button
                onClick={() => setShowTextPreview(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
              <button
                onClick={async () => {
                  await handleCopyPalpitesToClipboard();
                  setShowTextPreview(false);
                }}
                className="flex-1 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                disabled={isCopying}
              >
                {isCopying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                    Copiando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 