import { useState } from 'react';
import { Modal } from './Modal';
import { CreateEventRequest } from './../services/events';
import { toast } from 'react-hot-toast';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: any) => void;
  selectedSeason: number;
}

export function CreateEventModal({ isOpen, onClose, onEventCreated, selectedSeason }: CreateEventModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEventRequest>({
    season: selectedSeason,
    round: 1,
    name: '',
    country: '',
    city: '',
    circuitName: '',
    circuitUrl: '',
    raceDateTime: '',
    qualifyingDateTime: '',
    practice1DateTime: '',
    practice2DateTime: '',
    practice3DateTime: '',
    sprintDateTime: '',
    timezone: 'UTC',
    laps: 50,
    circuitLength: 5.0,
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.country || !formData.city || !formData.circuitName || !formData.raceDateTime) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implementar criação de evento via API
      // const newEvent = await eventsService.createEvent(formData);
      
      // Por enquanto, simular criação
      const newEvent = {
        id: Date.now(),
        ...formData,
        fullName: `${formData.name} ${formData.season}`,
        active: true,
        completed: false,
        isSprintWeekend: !!formData.sprintDateTime,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      onEventCreated(newEvent);
      toast.success('Evento criado com sucesso!');
      onClose();
      
      // Reset form
      setFormData({
        season: selectedSeason,
        round: 1,
        name: '',
        country: '',
        city: '',
        circuitName: '',
        circuitUrl: '',
        raceDateTime: '',
        qualifyingDateTime: '',
        practice1DateTime: '',
        practice2DateTime: '',
        practice3DateTime: '',
        sprintDateTime: '',
        timezone: 'UTC',
        laps: 50,
        circuitLength: 5.0,
        description: ''
      });
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast.error('Erro ao criar evento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'round' || name === 'laps' ? parseInt(value) || 0 : 
              name === 'circuitLength' ? parseFloat(value) || 0 : 
              value
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Criar Novo Evento">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Informações Básicas */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
          </div>
          
          <div>
            <label htmlFor="season" className="block text-sm font-medium text-gray-700 mb-1">
              Temporada *
            </label>
            <input
              type="number"
              id="season"
              name="season"
              value={formData.season}
              onChange={handleChange}
              min="2020"
              max="2030"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div>
            <label htmlFor="round" className="block text-sm font-medium text-gray-700 mb-1">
              Rodada *
            </label>
            <input
              type="number"
              id="round"
              name="round"
              value={formData.round}
              onChange={handleChange}
              min="1"
              max="30"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do GP *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Monaco Grand Prix"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

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
              placeholder="Ex: Monaco"
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
              placeholder="Ex: Monte Carlo"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="circuitName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Circuito *
            </label>
            <input
              type="text"
              id="circuitName"
              name="circuitName"
              value={formData.circuitName}
              onChange={handleChange}
              placeholder="Ex: Circuit de Monaco"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          {/* Horários */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Horários dos Eventos</h3>
          </div>

          <div className="md:col-span-2">
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

          <div>
            <label htmlFor="qualifyingDateTime" className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora da Classificação
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

          <div>
            <label htmlFor="sprintDateTime" className="block text-sm font-medium text-gray-700 mb-1">
              Data e Hora do Sprint (opcional)
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

          {/* Informações Técnicas */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Informações Técnicas</h3>
          </div>

          <div>
            <label htmlFor="laps" className="block text-sm font-medium text-gray-700 mb-1">
              Número de Voltas
            </label>
            <input
              type="number"
              id="laps"
              name="laps"
              value={formData.laps}
              onChange={handleChange}
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div>
            <label htmlFor="circuitLength" className="block text-sm font-medium text-gray-700 mb-1">
              Comprimento do Circuito (km)
            </label>
            <input
              type="number"
              id="circuitLength"
              name="circuitLength"
              value={formData.circuitLength}
              onChange={handleChange}
              min="0.1"
              max="10"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
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
              <option value="UTC">UTC</option>
              <option value="GMT">GMT</option>
              <option value="CET">CET</option>
              <option value="EST">EST</option>
              <option value="PST">PST</option>
              <option value="JST">JST</option>
              <option value="AEST">AEST</option>
            </select>
          </div>

          <div>
            <label htmlFor="circuitUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL do Circuito (Wikipedia)
            </label>
            <input
              type="url"
              id="circuitUrl"
              name="circuitUrl"
              value={formData.circuitUrl}
              onChange={handleChange}
              placeholder="https://en.wikipedia.org/wiki/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Descrição adicional sobre o evento..."
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
            className="px-6 py-2 bg-f1-red text-white rounded-md hover:bg-f1-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Criando...' : 'Criar Evento'}
          </button>
        </div>
      </form>
    </Modal>
  );
} 