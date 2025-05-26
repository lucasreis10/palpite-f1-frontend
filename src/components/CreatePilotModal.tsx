import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CreatePilotRequest, UpdatePilotRequest, Pilot, pilotsService } from '@/services/pilots';
import { toast } from 'react-hot-toast';

interface CreatePilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPilotCreated?: (pilot: Pilot) => void;
  onPilotUpdated?: (pilot: Pilot) => void;
  editingPilot?: Pilot | null;
}

export function CreatePilotModal({ 
  isOpen, 
  onClose, 
  onPilotCreated, 
  onPilotUpdated, 
  editingPilot 
}: CreatePilotModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    driverId: '',
    givenName: '',
    familyName: '',
    dateOfBirth: '',
    nationality: '',
    url: '',
    permanentNumber: '',
    code: ''
  });

  const isEditing = !!editingPilot;

  useEffect(() => {
    if (editingPilot) {
      setFormData({
        driverId: editingPilot.driverId,
        givenName: editingPilot.givenName,
        familyName: editingPilot.familyName,
        dateOfBirth: editingPilot.dateOfBirth.split('T')[0], // Converter para formato de input date
        nationality: editingPilot.nationality,
        url: editingPilot.url || '',
        permanentNumber: editingPilot.permanentNumber?.toString() || '',
        code: editingPilot.code || ''
      });
    } else {
      // Reset form para criação
      setFormData({
        driverId: '',
        givenName: '',
        familyName: '',
        dateOfBirth: '',
        nationality: '',
        url: '',
        permanentNumber: '',
        code: ''
      });
    }
  }, [editingPilot, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.givenName || !formData.familyName || !formData.dateOfBirth || !formData.nationality) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && editingPilot) {
        // Atualizar piloto existente
        const updateRequest: UpdatePilotRequest = {
          givenName: formData.givenName,
          familyName: formData.familyName,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          url: formData.url || undefined,
          permanentNumber: formData.permanentNumber ? parseInt(formData.permanentNumber) : undefined,
          code: formData.code || undefined
        };

        const updatedPilot = await pilotsService.updatePilot(editingPilot.id, updateRequest);
        onPilotUpdated?.(updatedPilot);
        toast.success('Piloto atualizado com sucesso!');
      } else {
        // Criar novo piloto
        const createRequest: CreatePilotRequest = {
          driverId: formData.driverId || pilotsService.generateDriverId(formData.givenName, formData.familyName),
          givenName: formData.givenName,
          familyName: formData.familyName,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          url: formData.url || undefined,
          permanentNumber: formData.permanentNumber ? parseInt(formData.permanentNumber) : undefined,
          code: formData.code || pilotsService.generateDriverCode(formData.givenName, formData.familyName)
        };

        const newPilot = await pilotsService.createPilot(createRequest);
        onPilotCreated?.(newPilot);
        toast.success('Piloto criado com sucesso!');
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar piloto:', error);
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} piloto. Tente novamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-gerar driverId e code quando nome/sobrenome mudarem (apenas para criação)
    if (!isEditing && (name === 'givenName' || name === 'familyName')) {
      const givenName = name === 'givenName' ? value : formData.givenName;
      const familyName = name === 'familyName' ? value : formData.familyName;
      
      if (givenName && familyName) {
        setFormData(prev => ({
          ...prev,
          driverId: prev.driverId || pilotsService.generateDriverId(givenName, familyName),
          code: prev.code || pilotsService.generateDriverCode(givenName, familyName)
        }));
      }
    }
  };

  const commonNationalities = [
    'British', 'German', 'Spanish', 'Dutch', 'French', 'Italian', 'Brazilian', 
    'Mexican', 'Australian', 'Canadian', 'Japanese', 'Finnish', 'Austrian',
    'Belgian', 'Danish', 'Swiss', 'American', 'Thai', 'Chinese', 'Russian'
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? 'Editar Piloto' : 'Novo Piloto'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Informações Básicas */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
          </div>
          
          <div>
            <label htmlFor="givenName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome *
            </label>
            <input
              type="text"
              id="givenName"
              name="givenName"
              value={formData.givenName}
              onChange={handleChange}
              placeholder="Ex: Max"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div>
            <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1">
              Sobrenome *
            </label>
            <input
              type="text"
              id="familyName"
              name="familyName"
              value={formData.familyName}
              onChange={handleChange}
              placeholder="Ex: Verstappen"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
              Data de Nascimento *
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
              Nacionalidade *
            </label>
            <select
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            >
              <option value="">Selecione uma nacionalidade</option>
              {commonNationalities.map((nationality) => (
                <option key={nationality} value={nationality}>
                  {nationality}
                </option>
              ))}
            </select>
          </div>

          {/* Informações Técnicas */}
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Informações Técnicas</h3>
          </div>

          <div>
            <label htmlFor="driverId" className="block text-sm font-medium text-gray-700 mb-1">
              Driver ID {!isEditing && '(auto-gerado)'}
            </label>
            <input
              type="text"
              id="driverId"
              name="driverId"
              value={formData.driverId}
              onChange={handleChange}
              placeholder="Ex: max_verstappen"
              disabled={isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red ${
                isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Código (3 letras) {!isEditing && '(auto-gerado)'}
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Ex: VER"
              maxLength={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red uppercase"
            />
          </div>

          <div>
            <label htmlFor="permanentNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Número Permanente
            </label>
            <input
              type="number"
              id="permanentNumber"
              name="permanentNumber"
              value={formData.permanentNumber}
              onChange={handleChange}
              placeholder="Ex: 1"
              min="1"
              max="99"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL (Wikipedia)
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://en.wikipedia.org/wiki/..."
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
            {isLoading ? (isEditing ? 'Atualizando...' : 'Criando...') : (isEditing ? 'Atualizar' : 'Criar Piloto')}
          </button>
        </div>
      </form>
    </Modal>
  );
} 