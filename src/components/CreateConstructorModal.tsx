import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CreateConstructorRequest, UpdateConstructorRequest, Constructor, constructorsService } from './../services/constructors';
import { toast } from 'react-hot-toast';

interface CreateConstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConstructorCreated?: (constructor: Constructor) => void;
  onConstructorUpdated?: (constructor: Constructor) => void;
  editingConstructor?: Constructor | null;
}

export function CreateConstructorModal({ 
  isOpen, 
  onClose, 
  onConstructorCreated, 
  onConstructorUpdated, 
  editingConstructor 
}: CreateConstructorModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    constructorId: '',
    name: '',
    nationality: '',
    url: ''
  });

  const isEditing = !!editingConstructor;

  useEffect(() => {
    if (editingConstructor) {
      setFormData({
        constructorId: editingConstructor.constructorId,
        name: editingConstructor.name,
        nationality: editingConstructor.nationality,
        url: editingConstructor.url || ''
      });
    } else {
      // Reset form para criação
      setFormData({
        constructorId: '',
        name: '',
        nationality: '',
        url: ''
      });
    }
  }, [editingConstructor, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.nationality) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validar dados
    const validationErrors = constructorsService.validateConstructorData(
      isEditing 
        ? { name: formData.name, nationality: formData.nationality, url: formData.url }
        : { constructorId: formData.constructorId, name: formData.name, nationality: formData.nationality, url: formData.url }
    );

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && editingConstructor) {
        // Atualizar construtor existente
        const updateRequest: UpdateConstructorRequest = {
          name: formData.name,
          nationality: formData.nationality,
          url: formData.url || undefined
        };

        const updatedConstructor = await constructorsService.updateConstructor(editingConstructor.id, updateRequest);
        onConstructorUpdated?.(updatedConstructor);
        toast.success('Equipe atualizada com sucesso!');
      } else {
        // Criar novo construtor
        const createRequest: CreateConstructorRequest = {
          constructorId: formData.constructorId || constructorsService.generateConstructorId(formData.name),
          name: formData.name,
          nationality: formData.nationality,
          url: formData.url || undefined
        };

        const newConstructor = await constructorsService.createConstructor(createRequest);
        onConstructorCreated?.(newConstructor);
        toast.success('Equipe criada com sucesso!');
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      toast.error(`Erro ao ${isEditing ? 'atualizar' : 'criar'} equipe. Tente novamente.`);
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

    // Auto-gerar constructorId quando nome mudar (apenas para criação)
    if (!isEditing && name === 'name' && value) {
      setFormData(prev => ({
        ...prev,
        constructorId: prev.constructorId || constructorsService.generateConstructorId(value)
      }));
    }
  };

  const commonNationalities = [
    'Austrian', 'British', 'French', 'German', 'Italian', 'Swiss', 'American', 
    'Japanese', 'Spanish', 'Dutch', 'Belgian', 'Canadian', 'Australian',
    'Brazilian', 'Mexican', 'Indian', 'Chinese', 'Russian', 'Swedish'
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? 'Editar Equipe' : 'Nova Equipe'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Equipe</h3>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Equipe *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Red Bull Racing"
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

          <div>
            <label htmlFor="constructorId" className="block text-sm font-medium text-gray-700 mb-1">
              Constructor ID {!isEditing && '(auto-gerado)'}
            </label>
            <input
              type="text"
              id="constructorId"
              name="constructorId"
              value={formData.constructorId}
              onChange={handleChange}
              placeholder="Ex: red_bull"
              disabled={isEditing}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red ${
                isEditing ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            {!isEditing && (
              <p className="text-xs text-gray-500 mt-1">
                Será gerado automaticamente baseado no nome da equipe
              </p>
            )}
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
            {isLoading ? (isEditing ? 'Atualizando...' : 'Criando...') : (isEditing ? 'Atualizar' : 'Criar Equipe')}
          </button>
        </div>
      </form>
    </Modal>
  );
} 