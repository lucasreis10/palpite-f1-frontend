'use client'

import { useState, useEffect } from 'react';
import { Header } from '../../../components/Header';
import { CreateCalendarEventModal } from '../../../components/CreateCalendarEventModal';
import { calendarService, CalendarEvent, CalendarStats } from '../../../services/calendar';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  CloudArrowDownIcon,
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  FlagIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function CalendarioPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [stats, setStats] = useState<CalendarStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [availableSeasons, setAvailableSeasons] = useState<number[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importingSeason, setImportingSeason] = useState(new Date().getFullYear());
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      loadEventsBySeason(selectedSeason);
    }
  }, [selectedSeason]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [seasonsData, statsData] = await Promise.all([
        calendarService.getAvailableSeasons(),
        calendarService.getCalendarStats()
      ]);
      
      setAvailableSeasons(seasonsData);
      setStats(statsData);
      
      // Carregar eventos da temporada atual
      await loadEventsBySeason(selectedSeason);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados do calendário');
    } finally {
      setIsLoading(false);
    }
  };

  const loadEventsBySeason = async (season: number) => {
    try {
      const eventsData = await calendarService.getEventsBySeason(season);
      setEvents(eventsData);
    } catch (error) {
      console.error(`Erro ao carregar eventos da temporada ${season}:`, error);
      toast.error(`Erro ao carregar eventos de ${season}`);
      setEvents([]);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        loadEventsBySeason(selectedSeason),
        loadStats()
      ]);
      toast.success('Dados atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      toast.error('Erro ao atualizar dados');
    } finally {
      setIsRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await calendarService.getCalendarStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleEventCreated = (newEvent: CalendarEvent) => {
    setEvents(prev => [...prev, newEvent]);
    loadStats(); // Atualizar estatísticas
  };

  const handleEventUpdated = (updatedEvent: CalendarEvent) => {
    setEvents(prev => prev.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ));
    loadStats(); // Atualizar estatísticas
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    setEventToDelete(event);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;

    try {
      await calendarService.deleteEvent(eventToDelete.id);
      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      toast.success('Evento excluído com sucesso!');
      setIsDeleteModalOpen(false);
      setEventToDelete(null);
      loadStats(); // Atualizar estatísticas
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir evento. Tente novamente.';
      toast.error(errorMessage);
      console.error('Erro ao excluir evento:', error);
    }
  };

  const handleToggleEventStatus = async (event: CalendarEvent) => {
    try {
      let updatedEvent: CalendarEvent;
      
      if (event.active) {
        updatedEvent = await calendarService.deactivateEvent(event.id);
        toast.success('Evento inativado com sucesso!');
      } else {
        updatedEvent = await calendarService.activateEvent(event.id);
        toast.success('Evento ativado com sucesso!');
      }

      setEvents(prev => prev.map(e => 
        e.id === event.id ? updatedEvent : e
      ));
      loadStats(); // Atualizar estatísticas
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar status do evento. Tente novamente.';
      toast.error(errorMessage);
      console.error('Erro ao alterar status do evento:', error);
    }
  };

  const handleToggleCompleted = async (event: CalendarEvent) => {
    try {
      let updatedEvent: CalendarEvent;
      
      if (event.completed) {
        updatedEvent = await calendarService.markAsPending(event.id);
        toast.success('Evento marcado como pendente!');
      } else {
        updatedEvent = await calendarService.markAsCompleted(event.id);
        toast.success('Evento marcado como concluído!');
      }

      setEvents(prev => prev.map(e => 
        e.id === event.id ? updatedEvent : e
      ));
      loadStats(); // Atualizar estatísticas
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar status de conclusão. Tente novamente.';
      toast.error(errorMessage);
      console.error('Erro ao alterar status de conclusão:', error);
    }
  };

  const handleImportF1Calendar = async () => {
    try {
      setIsImporting(true);
      const importedEvents = await calendarService.importF1Calendar(importingSeason);
      
      if (importedEvents.length > 0) {
        toast.success(`${importedEvents.length} eventos importados com sucesso!`);
        if (importingSeason === selectedSeason) {
          await loadEventsBySeason(selectedSeason);
        }
        loadStats(); // Atualizar estatísticas
      } else {
        toast.error('Nenhum evento foi importado');
      }
      
      setIsImportModalOpen(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao importar calendário da F1. Tente novamente.';
      toast.error(errorMessage);
      console.error('Erro ao importar calendário da F1:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const getEventStatusBadge = (event: CalendarEvent) => {
    const status = calendarService.getEventStatus(event);
    
    if (!event.active) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Inativo
        </span>
      );
    }
    
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Concluído
        </span>
      );
    }
    
    if (status === 'ongoing') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Em andamento
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Próximo
      </span>
    );
  };

  if (isLoading) {
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Calendário</h1>
            <p className="text-gray-600 mt-2">
              Gerencie eventos, datas e horários das corridas da temporada
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
            >
              <CloudArrowDownIcon className="w-5 h-5" />
              Importar F1
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-f1-red text-white px-4 py-2 rounded-md hover:bg-f1-red/90 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Novo Evento
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mb-6 flex items-center gap-4">
          <div>
            <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
              Temporada
            </label>
            <select
              id="season"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            >
              {availableSeasons.map((season) => (
                <option key={season} value={season}>
                  {season}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <CalendarIcon className="w-8 h-8 text-blue-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalEvents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Concluídos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedEvents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <ClockIcon className="w-8 h-8 text-yellow-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingEvents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <FlagIcon className="w-8 h-8 text-purple-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Próximos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingEvents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <ChartBarIcon className="w-8 h-8 text-indigo-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeEvents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center">
                <GlobeAltIcon className="w-8 h-8 text-orange-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Sprints</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.sprintWeekends}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabela de Eventos */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Etapa</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Evento</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Circuito</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Local</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data da Corrida</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sprint</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum evento encontrado para {selectedSeason}</p>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-4 text-f1-red hover:text-f1-red/80 font-medium"
                      >
                        Criar primeiro evento
                      </button>
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr 
                      key={event.id}
                      className={`${!event.active ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4">
                        {getEventStatusBadge(event)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          {event.round}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className={`font-medium ${!event.active && 'text-gray-500'}`}>
                            {event.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {event.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={!event.active ? 'text-gray-500' : ''}>
                          {event.circuitName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4 text-gray-400" />
                          <span className={!event.active ? 'text-gray-500' : ''}>
                            {event.city}, {event.country}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${!event.active ? 'text-gray-500' : ''}`}>
                            {calendarService.formatEventDateTime(event.raceDateTime)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${!event.active ? 'text-gray-500' : ''}`}>
                          {event.isSprintWeekend ? 'Sim' : 'Não'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditEvent(event)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar Evento"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleCompleted(event)}
                            className={`${
                              event.completed 
                                ? 'text-yellow-600 hover:text-yellow-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={event.completed ? 'Marcar como Pendente' : 'Marcar como Concluído'}
                          >
                            {event.completed ? (
                              <ClockIcon className="w-5 h-5" />
                            ) : (
                              <CheckCircleIcon className="w-5 h-5" />
                            )}
                          </button>

                          <button
                            onClick={() => handleToggleEventStatus(event)}
                            className={`${
                              event.active 
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={event.active ? 'Inativar Evento' : 'Ativar Evento'}
                          >
                            {event.active ? (
                              <XCircleIcon className="w-5 h-5" />
                            ) : (
                              <CheckCircleIcon className="w-5 h-5" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteEvent(event)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir Evento"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Criar/Editar Evento */}
      <CreateCalendarEventModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        onEventCreated={handleEventCreated}
        onEventUpdated={handleEventUpdated}
        editingEvent={editingEvent}
        selectedSeason={selectedSeason}
      />

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && eventToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6" />
              <h3 className="text-lg font-medium">Confirmar Exclusão</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir o evento <span className="font-semibold">"{eventToDelete.name}"</span>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    ⚠️ Atenção: Esta ação não pode ser desfeita!
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>O evento será permanentemente removido</li>
                      <li>Todos os palpites associados serão mantidos</li>
                      <li>Esta ação afetará as estatísticas do calendário</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setEventToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteEvent}
                className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Sim, Excluir Evento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Importação F1 */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-blue-600 mb-4">
              <CloudArrowDownIcon className="w-6 h-6" />
              <h3 className="text-lg font-medium">Importar Calendário F1</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Importar eventos oficiais da Fórmula 1 para uma temporada específica.
            </p>
            <div className="mb-6">
              <label htmlFor="importSeason" className="block text-sm font-medium text-gray-700 mb-2">
                Temporada para Importar
              </label>
              <select
                id="importSeason"
                value={importingSeason}
                onChange={(e) => setImportingSeason(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
              >
                {Array.from({ length: 6 }, (_, i) => {
                  const year = new Date().getFullYear() - i + 2;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    ℹ️ Informações sobre a importação:
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Dados serão importados da API oficial da F1</li>
                      <li>Eventos duplicados serão ignorados</li>
                      <li>Horários podem precisar de ajustes manuais</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                disabled={isImporting}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleImportF1Calendar}
                disabled={isImporting}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? 'Importando...' : 'Importar Calendário'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 