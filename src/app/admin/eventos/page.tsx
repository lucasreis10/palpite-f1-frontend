'use client'

import { useState, useEffect } from 'react';
import { Header } from './../../../components/Header';
import { Tab } from '@headlessui/react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  PencilSquareIcon,
  ArrowPathIcon,
  CloudArrowDownIcon,
  PlusIcon,
  CalendarIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { F1Service } from './../../../services/f1';
import { eventsService, EventWithResults, EventResult, GrandPrixEvent } from './../../../services/events';
import { toast } from 'react-hot-toast';
import { DriverAutocomplete } from './../../../components/DriverAutocomplete';
import { CreateEventModal } from './../../../components/CreateEventModal';
import { pilotsService } from './../../../services/pilots';

// Interface para o tipo de resultado
interface Result {
  position: number;
  driver: string;
  team: string;
}

interface ResultFormProps {
  onSubmit: (results: Result[]) => void;
  onImport: () => void;
  isLoading?: boolean;
  selectedTab: number;
  pilots: any[];
}

const ResultForm = ({ onSubmit, onImport, isLoading = false, selectedTab, pilots }: ResultFormProps) => {
  // Qualifying tem 12 posições, Race tem 14 posições
  const numPositions = selectedTab === 0 ? 12 : 14;
  
  const [results, setResults] = useState<Result[]>(
    Array.from({ length: numPositions }, (_, i) => ({
      position: i + 1,
      driver: '',
      team: '',
    }))
  );


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(results);
  };

  const handleDriverSelect = (driver: { name: string; team: string }, position: number) => {
    const newResults = [...results];
    newResults[position - 1] = {
      position,
      driver: driver.name,
      team: driver.team,
    };
    setResults(newResults);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Registrar Resultado</h3>
        <button
          onClick={onImport}
          disabled={isLoading}
          className="flex items-center gap-2 text-f1-red hover:text-f1-red/80 font-medium"
        >
          <CloudArrowDownIcon className="w-5 h-5" />
          {isLoading ? 'Importando...' : 'Importar da F1'}
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {results.map((result, index) => (
          <DriverAutocomplete
            key={index}
            drivers={pilots.filter(d => 
              !results.some(r => r.driver === d.name) || 
              results[index].driver === d.name
            )}
            selectedDriver={
              result.driver ? 
              { id: index, name: result.driver, team: result.team } :
              null
            }
            onSelect={(driver) => handleDriverSelect(driver, index + 1)}
            position={index + 1}
          />
        ))}
        
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-f1-red text-black px-6 py-2 rounded-md font-medium hover:bg-f1-red/90 transition-colors"
          >
            Salvar Resultado
          </button>
        </div>
      </form>
    </div>
  );
};

export default function EventsAdminPage() {
  const [events, setEvents] = useState<EventWithResults[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventWithResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [availableSeasons, setAvailableSeasons] = useState<number[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pilots, setPilots] = useState<any[]>([]);

  useEffect(() => {
    loadInitialData();
    loadPilots();
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      loadEventsBySeason(selectedSeason);
    }
  }, [selectedSeason]);

  const loadPilots = async () => {
    try {
      const pilotsData = await pilotsService.getAllPilots();
      setPilots(pilotsData.map(pilot => ({
        id: pilot.id,
        name: `${pilot.givenName} ${pilot.familyName}`,
        team: 'F1 Team' // Temporário até ter a relação com construtor
      })));
    } catch (error) {
      console.error('Erro ao carregar pilotos:', error);
    }
  };

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const seasons = await eventsService.getAvailableSeasons();
      setAvailableSeasons(seasons);
      
      const currentSeason = seasons.length > 0 ? seasons[0] : new Date().getFullYear();
      setSelectedSeason(currentSeason);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados iniciais');
      // Fallback para temporada atual
      setSelectedSeason(new Date().getFullYear());
      setAvailableSeasons([new Date().getFullYear()]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventsBySeason = async (season: number) => {
    try {
      setIsLoading(true);
      const eventsData = await eventsService.getEventsWithResults(season);
      setEvents(eventsData);
      
      if (eventsData.length > 0 && !selectedEvent) {
        setSelectedEvent(eventsData[0]);
      }
    } catch (error) {
      console.error(`Erro ao carregar eventos da temporada ${season}:`, error);
      toast.error(`Erro ao carregar eventos da temporada ${season}`);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'consolidated':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'consolidated':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'pending':
        return <ArrowPathIcon className="w-5 h-5" />;
      default:
        return <XCircleIcon className="w-5 h-5" />;
    }
  };

  const handleImportResults = async () => {
    if (!selectedEvent) return;
    
    setIsImporting(true);
    try {
      const results = selectedTab === 0 
        ? await F1Service.getLatestQualifyingResults()
        : await F1Service.getLatestRaceResults();
      
      // Atualizar o estado do evento com os resultados importados
      const updatedEvent = { ...selectedEvent };
      if (selectedTab === 0) {
        updatedEvent.qualifying = {
          status: 'consolidated',
          results: results
        };
      } else {
        updatedEvent.race = {
          status: 'consolidated',
          results: results
        };
      }
      
      setSelectedEvent(updatedEvent);
      
      // Atualizar a lista de eventos
      const updatedEvents = events.map(event => 
        event.id === selectedEvent.id ? updatedEvent : event
      );
      setEvents(updatedEvents);
      
      toast.success('Resultados importados com sucesso!');
    } catch (error) {
      toast.error('Erro ao importar resultados. Tente novamente.');
      console.error('Erro ao importar resultados:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmitResults = async (results: Result[]) => {
    if (!selectedEvent) return;
    
    try {
      // Filtrar apenas resultados preenchidos
      const filledResults = results.filter(r => r.driver && r.driver.trim() !== '');
      
      if (filledResults.length === 0) {
        toast.error('Preencha pelo menos um resultado antes de salvar.');
        return;
      }

      // Converter nomes dos pilotos para IDs
      const pilotIds: number[] = [];
      const missingPilots: string[] = [];

      for (const result of filledResults) {
        const pilot = pilots.find((p: any) => p.name === result.driver);
        if (pilot) {
          pilotIds.push(pilot.id);
        } else {
          missingPilots.push(result.driver);
        }
      }

      if (missingPilots.length > 0) {
        toast.error(`Pilotos não encontrados: ${missingPilots.join(', ')}`);
        return;
      }

      // Preparar request para a API
      const guessType = selectedTab === 0 ? 'QUALIFYING' : 'RACE' as 'QUALIFYING' | 'RACE';
      const setResultRequest = {
        grandPrixId: selectedEvent.id,
        guessType: guessType,
        realResultPilotIds: pilotIds
      };

      // Salvar resultado real e calcular pontuações
      const response = await eventsService.setRealResultAndCalculateScores(setResultRequest);
      
      toast.success(`Resultado salvo com sucesso! ${response.calculatedGuesses} palpites tiveram pontuações calculadas. 🏁`);
      
      // Atualizar o estado local
      const updatedEvent = { ...selectedEvent };
      if (selectedTab === 0) {
        updatedEvent.qualifying = {
          status: 'consolidated',
          results: filledResults.map(r => ({
            position: r.position,
            driver: r.driver,
            team: r.team
          }))
        };
      } else {
        updatedEvent.race = {
          status: 'consolidated',
          results: filledResults.map(r => ({
            position: r.position,
            driver: r.driver,
            team: r.team
          }))
        };
      }
      
      setSelectedEvent(updatedEvent);
      
      // Atualizar a lista de eventos
      const updatedEvents = events.map(event => 
        event.id === selectedEvent.id ? updatedEvent : event
      );
      setEvents(updatedEvents);
    } catch (error) {
      toast.error('Erro ao salvar resultados. Tente novamente.');
      console.error('Erro ao salvar resultados:', error);
    }
  };

  const handleMarkAsCompleted = async (event: EventWithResults) => {
    try {
      const response = await eventsService.markAsCompletedWithScoreCalculation(event.id);
      
      // Mostrar mensagem baseada no resultado
      if (response.scoresCalculated) {
        const totalCalculated = response.calculationResults.reduce((sum, result) => sum + result.calculatedGuesses, 0);
        toast.success(`Evento marcado como concluído! ${totalCalculated} palpites tiveram pontuações calculadas. 🏁`);
      } else {
        toast.success('Evento marcado como concluído!');
        if (response.warnings.length > 0) {
          console.warn('Avisos:', response.warnings);
          toast.success('⚠️ Pontuações não foram calculadas automaticamente. Verifique se os resultados foram definidos.');
        }
      }
      
      // Recarregar eventos
      await loadEventsBySeason(selectedSeason);
    } catch (error) {
      toast.error('Erro ao marcar evento como concluído');
      console.error('Erro ao marcar evento como concluído:', error);
    }
  };

  const handleMarkAsPending = async (event: EventWithResults) => {
    try {
      await eventsService.markAsPending(event.id);
      toast.success('Evento marcado como pendente!');
      
      // Recarregar eventos
      await loadEventsBySeason(selectedSeason);
    } catch (error) {
      toast.error('Erro ao marcar evento como pendente');
      console.error('Erro ao marcar evento como pendente:', error);
    }
  };

  const handleEventCreated = (newEvent: any) => {
    // Adicionar o novo evento à lista
    const eventWithResults: EventWithResults = {
      ...newEvent,
      qualifying: { status: 'pending', results: [] },
      race: { status: 'pending', results: [] }
    };
    
    setEvents(prev => [...prev, eventWithResults]);
    
    // Selecionar o novo evento
    setSelectedEvent(eventWithResults);
  };

  if (isLoading && events.length === 0) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-f1-red"></div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Eventos</h1>
          <p className="text-gray-600 mt-2">
            Cadastre novos eventos, registre resultados e consolide pontuações
          </p>
        </div>

        {/* Seletor de Temporada */}
        <div className="mb-6">
          <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-2">
            Temporada
          </label>
          <select
            id="season"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="block w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-f1-red focus:border-f1-red"
          >
            {availableSeasons.map((season) => (
              <option key={season} value={season}>
                {season}
              </option>
            ))}
          </select>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Lista de Eventos */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">
                    Eventos {selectedSeason}
                  </h2>
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-f1-red text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-f1-red/90 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 inline mr-1" />
                    Novo Evento
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum evento encontrado para {selectedSeason}</p>
                  </div>
                ) : (
                  events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                        selectedEvent?.id === event.id ? 'bg-gray-50 border-r-2 border-f1-red' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900">{event.name}</h3>
                        <span className="text-sm text-gray-500">
                          {eventsService.formatEventDate(event.raceDateTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{event.city}, {event.country}</span>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            getStatusColor(event.qualifying.status)
                          }`}>
                            {getStatusIcon(event.qualifying.status)}
                            <span className="ml-1">Quali</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            getStatusColor(event.race.status)
                          }`}>
                            {getStatusIcon(event.race.status)}
                            <span className="ml-1">Corrida</span>
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Detalhes do Evento */}
          <div className="lg:col-span-8">
            {selectedEvent ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.name}</h2>
                      <p className="text-gray-600">{selectedEvent.city}, {selectedEvent.country}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {eventsService.formatEventDateTime(selectedEvent.raceDateTime)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => selectedEvent.completed ? handleMarkAsPending(selectedEvent) : handleMarkAsCompleted(selectedEvent)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          selectedEvent.completed 
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {selectedEvent.completed ? 'Marcar como Pendente' : 'Marcar como Concluído'}
                      </button>
                      <button className="text-gray-500 hover:text-gray-700">
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <Tab.Group onChange={setSelectedTab}>
                    <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
                      <Tab className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                        ${selected
                          ? 'bg-white text-f1-red shadow'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }>
                        Classificação
                      </Tab>
                      <Tab className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                        ${selected
                          ? 'bg-white text-f1-red shadow'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }>
                        Corrida
                      </Tab>
                    </Tab.List>
                    <Tab.Panels>
                      <Tab.Panel>
                        <div className="space-y-6">
                          {selectedEvent.qualifying.status === 'pending' ? (
                            <ResultForm
                              onSubmit={handleSubmitResults}
                              onImport={handleImportResults}
                              isLoading={isImporting}
                              selectedTab={selectedTab}
                              pilots={pilots}
                            />
                          ) : (
                            <>
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">
                                  Resultado da Classificação
                                </h3>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      const updatedEvent = { ...selectedEvent };
                                      updatedEvent.qualifying.status = 'pending';
                                      setSelectedEvent(updatedEvent);
                                    }}
                                    className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                                  >
                                    Editar Resultado
                                  </button>
                                  <button className="text-f1-red hover:text-f1-red/80 font-medium text-sm">
                                    Reconsolidar Pontos
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {selectedEvent.qualifying.results.map((result) => (
                                  <div 
                                    key={result.position}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                                  >
                                    <div className="flex items-center gap-4">
                                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                        result.position <= 3 ? 'bg-green-100 text-green-800' : 
                                        result.position <= 6 ? 'bg-blue-100 text-blue-800' : 
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {result.position}
                                      </span>
                                      <div>
                                        <p className="font-medium text-gray-900">{result.driver}</p>
                                        <p className="text-sm text-gray-500">{result.team}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </Tab.Panel>
                      <Tab.Panel>
                        <div className="space-y-6">
                          {selectedEvent.race.status === 'pending' ? (
                            <ResultForm
                              onSubmit={handleSubmitResults}
                              onImport={handleImportResults}
                              isLoading={isImporting}
                              selectedTab={selectedTab}
                              pilots={pilots}
                            />
                          ) : (
                            <>
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">
                                  Resultado da Corrida
                                </h3>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => {
                                      const updatedEvent = { ...selectedEvent };
                                      updatedEvent.race.status = 'pending';
                                      setSelectedEvent(updatedEvent);
                                    }}
                                    className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                                  >
                                    Editar Resultado
                                  </button>
                                  <button className="text-f1-red hover:text-f1-red/80 font-medium text-sm">
                                    Reconsolidar Pontos
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {selectedEvent.race.results.map((result) => (
                                  <div 
                                    key={result.position}
                                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                                  >
                                    <div className="flex items-center gap-4">
                                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                        result.position <= 3 ? 'bg-green-100 text-green-800' : 
                                        result.position <= 6 ? 'bg-blue-100 text-blue-800' : 
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {result.position}
                                      </span>
                                      <div>
                                        <p className="font-medium text-gray-900">{result.driver}</p>
                                        <p className="text-sm text-gray-500">{result.team}</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
                <div className="text-center text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Selecione um evento para ver os detalhes</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Criação de Evento */}
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onEventCreated={handleEventCreated}
          selectedSeason={selectedSeason}
        />
      </div>
    </main>
  );
} 