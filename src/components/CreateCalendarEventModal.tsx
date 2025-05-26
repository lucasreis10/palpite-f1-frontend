import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CreateCalendarEventRequest, UpdateCalendarEventRequest, CalendarEvent, calendarService } from './../services/calendar';
import { toast } from 'react-hot-toast';

interface CreateCalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated?: (event: CalendarEvent) => void;
  onEventUpdated?: (event: CalendarEvent) => void;
  editingEvent?: CalendarEvent | null;
  selectedSeason?: number;
}

export function CreateCalendarEventModal({ 
  isOpen, 
  onClose, 
  onEventCreated, 
  onEventUpdated, 
  editingEvent,
  selectedSeason 
}: CreateCalendarEventModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    season: selectedSeason || new Date().getFullYear(),
    round: 1,
    name: '',
    country: '',
    city: '',
    circuitName: '',
    circuitUrl: '',
    raceDateTime: '',
    practice1DateTime: '',
    practice2DateTime: '',
    practice3DateTime: '',
    qualifyingDateTime: '',
    sprintDateTime: '',
    timezone: 'UTC',
    laps: 0,
    circuitLength: 0,
    description: '',
    bettingDeadline: ''
  });

  const isEditing = !!editingEvent;

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        season: editingEvent.season,
        round: editingEvent.round,
        name: editingEvent.name,
        country: editingEvent.country,
        city: editingEvent.city,
        circuitName: editingEvent.circuitName,
        circuitUrl: editingEvent.circuitUrl || '',
        raceDateTime: editingEvent.raceDateTime.slice(0, 16), // Para datetime-local
        practice1DateTime: editingEvent.practice1DateTime?.slice(0, 16) || '',
        practice2DateTime: editingEvent.practice2DateTime?.slice(0, 16) || '',
        practice3DateTime: editingEvent.practice3DateTime?.slice(0, 16) || '',
        qualifyingDateTime: editingEvent.qualifyingDateTime?.slice(0, 16) || '',
        sprintDateTime: editingEvent.sprintDateTime?.slice(0, 16) || '',
        timezone: editingEvent.timezone,
        laps: editingEvent.laps || 0,
        circuitLength: editingEvent.circuitLength || 0,
        description: editingEvent.description || '',
        bettingDeadline: editingEvent.bettingDeadline?.slice(0, 16) || ''
      });
    } else {
      // Reset form para criação
      setFormData({
        season: selectedSeason || new Date().getFullYear(),
        round: 1,
        name: '',
        country: '',
        city: '',
        circuitName: '',
        circuitUrl: '',
        raceDateTime: '',
        practice1DateTime: '',
        practice2DateTime: '',
        practice3DateTime: '',
        qualifyingDateTime: '',
        sprintDateTime: '',
        timezone: 'UTC',
        laps: 0,
        circuitLength: 0,
        description: '',
        bettingDeadline: ''
      });
    }
  }, [editingEvent, isOpen, selectedSeason]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.country || !formData.city || !formData.circuitName || !formData.raceDateTime) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validar dados
    const validationErrors = calendarService.validateEventData(
      isEditing 
        ? { 
            name: formData.name, 
            country: formData.country, 
            city: formData.city, 
            circuitName: formData.circuitName,
            raceDateTime: formData.raceDateTime + ':00Z'
          }
        : { 
            season: formData.season,
            round: formData.round,
            name: formData.name, 
            country: formData.country, 
            city: formData.city, 
            circuitName: formData.circuitName,
            raceDateTime: formData.raceDateTime + ':00Z'
          }
    );

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && editingEvent) {
        // Atualizar evento existente
        const updateRequest: UpdateCalendarEventRequest = {
          name: formData.name,
          country: formData.country,
          city: formData.city,
          circuitName: formData.circuitName,
          circuitUrl: formData.circuitUrl || undefined,
          raceDateTime: formData.raceDateTime + ':00Z',
          practice1DateTime: formData.practice1DateTime ? formData.practice1DateTime + ':00Z' : undefined,
          practice2DateTime: formData.practice2DateTime ? formData.practice2DateTime + ':00Z' : undefined,
          practice3DateTime: formData.practice3DateTime ? formData.practice3DateTime + ':00Z' : undefined,
          qualifyingDateTime: formData.qualifyingDateTime ? formData.qualifyingDateTime + ':00Z' : undefined,
          sprintDateTime: formData.sprintDateTime ? formData.sprintDateTime + ':00Z' : undefined,
          timezone: formData.timezone,
          laps: formData.laps || undefined,
          circuitLength: formData.circuitLength || undefined,
          description: formData.description || undefined,
          bettingDeadline: formData.bettingDeadline ? formData.bettingDeadline + ':00Z' : undefined
        };

        const updatedEvent = await calendarService.updateEvent(editingEvent.id, updateRequest);
        onEventUpdated?.(updatedEvent);
        toast.success('Evento atualizado com sucesso!');
      } else {
        // Criar novo evento
        const createRequest: CreateCalendarEventRequest = {
          season: formData.season,
          round: formData.round,
          name: formData.name,
          country: formData.country,
          city: formData.city,
          circuitName: formData.circuitName,
          circuitUrl: formData.circuitUrl || undefined,
          raceDateTime: formData.raceDateTime + ':00Z',
          practice1DateTime: formData.practice1DateTime ? formData.practice1DateTime + ':00Z' : undefined,
          practice2DateTime: formData.practice2DateTime ? formData.practice2DateTime + ':00Z' : undefined,
          practice3DateTime: formData.practice3DateTime ? formData.practice3DateTime + ':00Z' : undefined,
          qualifyingDateTime: formData.qualifyingDateTime ? formData.qualifyingDateTime + ':00Z' : undefined,
          sprintDateTime: formData.sprintDateTime ? formData.sprintDateTime + ':00Z' : undefined,
          timezone: formData.timezone,
          laps: formData.laps || undefined,
          circuitLength: formData.circuitLength || undefined,
          description: formData.description || undefined,
          bettingDeadline: formData.bettingDeadline ? formData.bettingDeadline + ':00Z' : undefined
        };

        const newEvent = await calendarService.createEvent(createRequest);
        onEventCreated?.(newEvent);
        toast.success('Evento criado com sucesso!');
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      const errorMessage = error instanceof Error ? error.message : `Erro ao ${isEditing ? 'atualizar' : 'criar'} evento. Tente novamente.`;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'season' || name === 'round' || name === 'laps' 
        ? parseInt(value) || 0 
        : name === 'circuitLength'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i + 2);

  const timezones = [
    'UTC',
    'Europe/London',
    'Europe/Monaco',
    'Europe/Rome',
    'America/Sao_Paulo',
    'America/Mexico_City',
    'America/New_York',
    'Asia/Bahrain',
    'Asia/Dubai',
    'Asia/Singapore',
    'Asia/Tokyo',
    'Australia/Melbourne'
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? 'Editar Evento' : 'Novo Evento do Calendário'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? 'Editar Informações do Evento' : 'Informações Básicas'}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
                Temporada *
              </label>
              <select
                id="season"
                name="season"
                value={formData.season}
                onChange={handleChange}
                required
                disabled={isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red disabled:bg-gray-100"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="round" className="block text-sm font-medium text-gray-700 mb-1">
                Etapa *
              </label>
              <input
                type="number"
                id="round"
                name="round"
                value={formData.round}
                onChange={handleChange}
                min="1"
                max="25"
                required
                disabled={isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red disabled:bg-gray-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Evento *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Grande Prêmio do Brasil"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                País *
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Ex: Brasil"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ex: São Paulo"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
              />
            </div>
          </div>

          <div>
            <label htmlFor="circuitName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Circuito *
            </label>
            <input
              type="text"
              id="circuitName"
              name="circuitName"
              value={formData.circuitName}
              onChange={handleChange}
              placeholder="Ex: Autódromo José Carlos Pace"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div>
            <label htmlFor="circuitUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL do Circuito
            </label>
            <input
              type="url"
              id="circuitUrl"
              name="circuitUrl"
              value={formData.circuitUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          {/* Horários dos Eventos */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Horários dos Eventos
            </h3>
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
              Fuso Horário
            </label>
            <select
              id="timezone"
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="raceDateTime" className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora da Corrida *
            </label>
            <input
              type="datetime-local"
              id="raceDateTime"
              name="raceDateTime"
              value={formData.raceDateTime}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="practice1DateTime" className="block text-sm font-medium text-gray-700 mb-1">
                Treino Livre 1
              </label>
              <input
                type="datetime-local"
                id="practice1DateTime"
                name="practice1DateTime"
                value={formData.practice1DateTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
              />
            </div>

            <div>
              <label htmlFor="practice2DateTime" className="block text-sm font-medium text-gray-700 mb-1">
                Treino Livre 2
              </label>
              <input
                type="datetime-local"
                id="practice2DateTime"
                name="practice2DateTime"
                value={formData.practice2DateTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="practice3DateTime" className="block text-sm font-medium text-gray-700 mb-1">
                Treino Livre 3
              </label>
              <input
                type="datetime-local"
                id="practice3DateTime"
                name="practice3DateTime"
                value={formData.practice3DateTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
              />
            </div>

            <div>
              <label htmlFor="qualifyingDateTime" className="block text-sm font-medium text-gray-700 mb-1">
                Classificação
              </label>
              <input
                type="datetime-local"
                id="qualifyingDateTime"
                name="qualifyingDateTime"
                value={formData.qualifyingDateTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sprintDateTime" className="block text-sm font-medium text-gray-700 mb-1">
                Corrida Sprint
              </label>
              <input
                type="datetime-local"
                id="sprintDateTime"
                name="sprintDateTime"
                value={formData.sprintDateTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
              />
            </div>

            <div>
              <label htmlFor="bettingDeadline" className="block text-sm font-medium text-gray-700 mb-1">
                Prazo para Palpites
              </label>
              <input
                type="datetime-local"
                id="bettingDeadline"
                name="bettingDeadline"
                value={formData.bettingDeadline}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
              />
            </div>
          </div>

          {/* Informações Técnicas */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Informações Técnicas
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="laps" className="block text-sm font-medium text-gray-700 mb-1">
                Número de Voltas
              </label>
              <input
                type="number"
                id="laps"
                name="laps"
                value={formData.laps || ''}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
              />
            </div>

            <div>
              <label htmlFor="circuitLength" className="block text-sm font-medium text-gray-700 mb-1">
                Extensão do Circuito (km)
              </label>
              <input
                type="number"
                id="circuitLength"
                name="circuitLength"
                value={formData.circuitLength || ''}
                onChange={handleChange}
                min="0"
                max="10"
                step="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Informações adicionais sobre o evento..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-f1-red text-black rounded-md hover:bg-f1-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (isEditing ? 'Atualizando...' : 'Criando...') : (isEditing ? 'Atualizar' : 'Criar Evento')}
          </button>
        </div>
      </form>
    </Modal>
  );
} 