'use client'

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
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
  Bars3Icon,
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
  initialResults?: Result[];
  isEditing?: boolean;
  onCancel?: () => void;
}

const ResultForm = ({ onSubmit, onImport, isLoading = false, selectedTab, pilots, initialResults, isEditing = false, onCancel }: ResultFormProps) => {
  // Qualifying tem 12 posições, Race tem 14 posições
  const numPositions = selectedTab === 0 ? 12 : 14;
  
  const [results, setResults] = useState<Result[]>(() => {
    // Se há resultados iniciais, usar eles; senão criar array vazio
    if (initialResults && initialResults.length > 0) {
      // Preencher com os resultados existentes e completar com posições vazias se necessário
      const filledResults = Array.from({ length: numPositions }, (_, i) => {
        const existingResult = initialResults.find(r => r.position === i + 1);
        return existingResult || {
          position: i + 1,
          driver: '',
          team: '',
        };
      });
      return filledResults;
    }
    
    // Caso padrão: array vazio
    return Array.from({ length: numPositions }, (_, i) => ({
      position: i + 1,
      driver: '',
      team: '',
    }));
  });

  // Atualizar resultados quando initialResults mudar
  useEffect(() => {
    if (initialResults && initialResults.length > 0) {
      const filledResults = Array.from({ length: numPositions }, (_, i) => {
        const existingResult = initialResults.find(r => r.position === i + 1);
        return existingResult || {
          position: i + 1,
          driver: '',
          team: '',
        };
      });
      setResults(filledResults);
    }
  }, [initialResults, numPositions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(results);
  };

  const handleDriverSelect = (driver: { name: string; team: string; } | null, position: number) => {
    setResults(prev => prev.map(result => 
      result.position === position
        ? { ...result, driver: driver?.name || '', team: driver?.team || '' }
        : result
    ));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    // Criar uma cópia do array de resultados
    const updatedResults = Array.from(results);
    const [movedItem] = updatedResults.splice(sourceIndex, 1);
    updatedResults.splice(destinationIndex, 0, movedItem);

    // Atualizar as posições mantendo os drivers e teams
    const finalResults = updatedResults.map((item, index) => ({
      position: index + 1,
      driver: item.driver,
      team: item.team
    }));

    setResults(finalResults);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {selectedTab === 0 ? 'Resultado da Classificação' : 'Resultado da Corrida'}
        </h3>
        <button
          onClick={onImport}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
        >
          <CloudArrowDownIcon className="w-5 h-5" />
          {isLoading ? 'Importando...' : 'Importar da F1'}
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable 
            droppableId="drivers" 
            isDropDisabled={false}
            isCombineEnabled={false}
            ignoreContainerClipping={false}
          >
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {results.map((result, index) => (
                  <Draggable 
                    key={result.position.toString()}
                    draggableId={result.position.toString()}
                    index={index}
                    isDragDisabled={false}
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
                            drivers={pilots.filter(d => 
                              !results.some(r => r.driver === d.name) || 
                              results[index].driver === d.name
                            )}
                            selectedDriver={
                              result.driver ? 
                              { id: index + 1, name: result.driver, team: result.team } :
                              null
                            }
                            onSelect={(driver) => handleDriverSelect(driver, index + 1)}
                            position={index + 1}
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
        
        <div className="flex justify-end gap-3 pt-4">
          {isEditing && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="bg-f1-red text-black px-6 py-2 rounded-md font-medium hover:bg-f1-red/90 transition-colors border border-gray-300"
          >
            {isEditing ? 'Atualizar Resultado' : 'Salvar Resultado'}
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
  const [isEditingResults, setIsEditingResults] = useState(false);
  const [isImportingEvents, setIsImportingEvents] = useState(false);

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
      
      // Resetar estado de edição
      setIsEditingResults(false);
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

  const handleEditResults = (type: 'qualifying' | 'race') => {
    if (!selectedEvent) return;
    
    setIsEditingResults(true);
    const updatedEvent = { ...selectedEvent };
    if (type === 'qualifying') {
      updatedEvent.qualifying.status = 'pending';
    } else {
      updatedEvent.race.status = 'pending';
    }
    setSelectedEvent(updatedEvent);
  };

  const handleCancelEdit = () => {
    setIsEditingResults(false);
    // Recarregar o evento para restaurar o estado original
    if (selectedEvent) {
      loadEventsBySeason(selectedSeason);
    }
  };

  const handleImportEventsFromJolpica = async () => {
    try {
      setIsImportingEvents(true);
      const response = await eventsService.importEventsFromJolpica(selectedSeason);
      
      toast.success(
        `Importação concluída: ${response.imported} eventos importados, ${response.skipped} ignorados${response.errors > 0 ? `, ${response.errors} erros` : ''}`
      );
      
      if (response.errors > 0 && response.errorMessages.length > 0) {
        console.error('Erros na importação:', response.errorMessages);
        toast.error(`Alguns eventos não puderam ser importados. Verifique o console para detalhes.`);
      }
      
      // Recarregar eventos da temporada
      await loadEventsBySeason(selectedSeason);
    } catch (error) {
      console.error('Erro ao importar eventos:', error);
      toast.error('Erro ao importar eventos da API jolpica-f1');
    } finally {
      setIsImportingEvents(false);
    }
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
            className="block w-48 px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-f1-red"
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
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleImportEventsFromJolpica()}
                      disabled={isImportingEvents}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <CloudArrowDownIcon className="w-4 h-4 inline mr-1" />
                      {isImportingEvents ? 'Importando...' : 'Importar Eventos'}
                    </button>
                    <button 
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-f1-red text-black px-4 py-2 rounded-md text-sm font-medium hover:bg-f1-red/90 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 inline mr-1" />
                      Novo Evento
                    </button>
                  </div>
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
                              initialResults={isEditingResults ? selectedEvent.qualifying.results : undefined}
                              isEditing={isEditingResults}
                              onCancel={handleCancelEdit}
                            />
                          ) : (
                            <>
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">
                                  Resultado da Classificação
                                </h3>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleEditResults('qualifying')}
                                    className="text-gray-600 hover:text-gray-900 font-medium text-sm border border-gray-300 rounded-md px-2 py-1"
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
                              initialResults={isEditingResults ? selectedEvent.race.results : undefined}
                              isEditing={isEditingResults}
                              onCancel={handleCancelEdit}
                            />
                          ) : (
                            <>
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">
                                  Resultado da Corrida
                                </h3>
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleEditResults('race')}
                                    className="text-gray-600 hover:text-gray-900 font-medium text-sm border border-gray-300 rounded-md px-2 py-1"
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