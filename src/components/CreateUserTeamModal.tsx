import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CreateUserTeamRequest, UpdateUserTeamRequest, UserTeam, userTeamsService, UserSummary } from './../services/userTeams';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated?: (team: UserTeam) => void;
  onTeamUpdated?: (team: UserTeam) => void;
  editingTeam?: UserTeam | null;
  availableUsers?: User[];
}

export function CreateUserTeamModal({ 
  isOpen, 
  onClose, 
  onTeamCreated, 
  onTeamUpdated, 
  editingTeam,
  availableUsers = []
}: CreateUserTeamModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    year: new Date().getFullYear(),
    user1Id: 0,
    user2Id: 0,
    totalScore: 0
  });

  const isEditing = !!editingTeam;

  useEffect(() => {
    if (editingTeam) {
      setFormData({
        name: editingTeam.name,
        year: editingTeam.year,
        user1Id: editingTeam.user1.id,
        user2Id: editingTeam.user2.id,
        totalScore: editingTeam.totalScore
      });
    } else {
      // Reset form para criação
      setFormData({
        name: '',
        year: new Date().getFullYear(),
        user1Id: 0,
        user2Id: 0,
        totalScore: 0
      });
    }
  }, [editingTeam, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.year || formData.user1Id === 0 || formData.user2Id === 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    // Validar dados
    const validationErrors = userTeamsService.validateTeamData(
      isEditing 
        ? { name: formData.name, totalScore: formData.totalScore }
        : { name: formData.name, year: formData.year, user1Id: formData.user1Id, user2Id: formData.user2Id }
    );

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && editingTeam) {
        // Atualizar equipe existente
        const updateRequest: UpdateUserTeamRequest = {
          name: formData.name,
          totalScore: formData.totalScore
        };

        const updatedTeam = await userTeamsService.updateTeam(editingTeam.id, updateRequest);
        onTeamUpdated?.(updatedTeam);
        toast.success('Equipe atualizada com sucesso!');
      } else {
        // Criar nova equipe
        const createRequest: CreateUserTeamRequest = {
          name: formData.name,
          year: formData.year,
          user1Id: formData.user1Id,
          user2Id: formData.user2Id
        };

        const newTeam = await userTeamsService.createTeam(createRequest);
        onTeamCreated?.(newTeam);
        toast.success('Equipe criada com sucesso!');
      }
      
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar equipe:', error);
      toast.error(error.message || `Erro ao ${isEditing ? 'atualizar' : 'criar'} equipe. Tente novamente.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'user1Id' || name === 'user2Id' || name === 'totalScore' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const getAvailableUsers = (excludeUserId?: number) => {
    return availableUsers.filter(user => user.id !== excludeUserId);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i + 1);

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
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? 'Editar Informações da Equipe' : 'Informações da Equipe'}
            </h3>
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

          {!isEditing && (
            <>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Ano *
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="user1Id" className="block text-sm font-medium text-gray-700 mb-1">
                  Primeiro Membro *
                </label>
                <select
                  id="user1Id"
                  name="user1Id"
                  value={formData.user1Id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
                >
                  <option value={0}>Selecione um usuário</option>
                  {getAvailableUsers(formData.user2Id).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="user2Id" className="block text-sm font-medium text-gray-700 mb-1">
                  Segundo Membro *
                </label>
                <select
                  id="user2Id"
                  name="user2Id"
                  value={formData.user2Id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
                >
                  <option value={0}>Selecione um usuário</option>
                  {getAvailableUsers(formData.user1Id).map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {isEditing && (
            <>
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Ano
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O ano não pode ser alterado após a criação
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Membros da Equipe
                </label>
                <div className="space-y-2">
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                    {editingTeam?.user1.name} ({editingTeam?.user1.email})
                  </div>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100">
                    {editingTeam?.user2.name} ({editingTeam?.user2.email})
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Os membros não podem ser alterados após a criação
                </p>
              </div>

              <div>
                <label htmlFor="totalScore" className="block text-sm font-medium text-gray-700 mb-1">
                  Pontuação Total
                </label>
                <input
                  type="number"
                  id="totalScore"
                  name="totalScore"
                  value={formData.totalScore}
                  onChange={handleChange}
                  min="0"
                  max="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pontuação entre 0 e 10.000 pontos
                </p>
              </div>
            </>
          )}
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