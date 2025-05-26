import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { CreateUserRequest, UpdateUserRequest, User, usersService } from '@/services/users';
import { toast } from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated?: (user: User) => void;
  onUserUpdated?: (user: User) => void;
  editingUser?: User | null;
}

export function CreateUserModal({ 
  isOpen, 
  onClose, 
  onUserCreated, 
  onUserUpdated, 
  editingUser 
}: CreateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'ADMIN' | 'USER'
  });

  const isEditing = !!editingUser;

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        password: '',
        role: editingUser.role
      });
    } else {
      // Reset form para criação
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'USER'
      });
    }
    setShowPassword(false);
  }, [editingUser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    if (!isEditing && !formData.password) {
      toast.error('Senha é obrigatória para novos usuários');
      return;
    }

    // Validar dados
    const validationErrors = usersService.validateUserData(
      isEditing 
        ? { name: formData.name, email: formData.email, role: formData.role }
        : { name: formData.name, email: formData.email, password: formData.password, role: formData.role }
    );

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && editingUser) {
        // Atualizar usuário existente
        const updateRequest: UpdateUserRequest = {
          name: formData.name,
          email: formData.email,
          role: formData.role
        };

        const updatedUser = await usersService.updateUser(editingUser.id, updateRequest);
        onUserUpdated?.(updatedUser);
        toast.success('Usuário atualizado com sucesso!');
      } else {
        // Criar novo usuário
        const createRequest: CreateUserRequest = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        };

        const newUser = await usersService.createUser(createRequest);
        onUserCreated?.(newUser);
        toast.success('Usuário criado com sucesso!');
      }
      
      onClose();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      const errorMessage = error instanceof Error ? error.message : `Erro ao ${isEditing ? 'atualizar' : 'criar'} usuário. Tente novamente.`;
      toast.error(errorMessage);
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
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? 'Editar Usuário' : 'Novo Usuário'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {isEditing ? 'Editar Informações do Usuário' : 'Informações do Usuário'}
            </h3>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: João Silva"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="joao@email.com"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Usuário *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
            >
              <option value="USER">Usuário</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Administradores têm acesso total ao sistema
            </p>
          </div>

          {!isEditing && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-f1-red focus:border-f1-red"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                A senha deve ter pelo menos 6 caracteres
              </p>
            </div>
          )}

          {isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Alteração de Senha
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Para alterar a senha do usuário, entre em contato com o administrador do sistema.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
            {isLoading ? (isEditing ? 'Atualizando...' : 'Criando...') : (isEditing ? 'Atualizar' : 'Criar Usuário')}
          </button>
        </div>
      </form>
    </Modal>
  );
} 