'use client'

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { User, initialUsers } from '@/data/users';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    name: '',
    email: '',
    isActive: true,
  });

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setNewUser({ name: '', email: '', isActive: true });
    setIsModalOpen(false);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleUpdateUser = (updatedUser: User) => {
    try {
      if (!updatedUser.name.trim()) {
        toast.error('Por favor, preencha o nome do usuário.');
        return;
      }

      if (!validateEmail(updatedUser.email)) {
        toast.error('Por favor, insira um email válido.');
        return;
      }

      // Verificar se o email já existe (exceto para o usuário atual)
      const emailExists = users.some(u => 
        u.email === updatedUser.email && u.id !== updatedUser.id
      );

      if (emailExists) {
        toast.error('Este email já está em uso.');
        return;
      }

      setUsers(users.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      ));
      setEditingUser(null);
      setIsModalOpen(false);
      toast.success('Usuário atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar usuário. Tente novamente.');
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const handleToggleUserStatus = (user: User) => {
    setUserToToggle(user);
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;

    try {
      const updatedUser = { ...userToToggle, isActive: !userToToggle.isActive };
      setUsers(users.map(u => 
        u.id === userToToggle.id ? updatedUser : u
      ));
      toast.success(`Usuário ${userToToggle.isActive ? 'inativado' : 'ativado'} com sucesso!`);
      setIsConfirmModalOpen(false);
      setUserToToggle(null);
    } catch (error) {
      toast.error('Erro ao atualizar status do usuário. Tente novamente.');
      console.error('Erro ao atualizar status do usuário:', error);
    }
  };

  const handleAddUser = () => {
    try {
      if (!newUser.name.trim()) {
        toast.error('Por favor, preencha o nome do usuário.');
        return;
      }

      if (!validateEmail(newUser.email)) {
        toast.error('Por favor, insira um email válido.');
        return;
      }

      // Verificar se o email já existe
      const emailExists = users.some(u => u.email === newUser.email);
      if (emailExists) {
        toast.error('Este email já está em uso.');
        return;
      }

      const newId = Math.max(...users.map(u => u.id)) + 1;
      const userToAdd = { ...newUser, id: newId };
      
      setUsers([...users, userToAdd as User]);
      setIsModalOpen(false);
      setNewUser({ name: '', email: '', isActive: true });
      toast.success('Usuário adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar usuário. Tente novamente.');
      console.error('Erro ao adicionar usuário:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
            <p className="text-gray-600 mt-2">
              Adicione, edite ou desative usuários do sistema
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-f1-red text-black px-4 py-2 rounded-md hover:bg-f1-red/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Usuário
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-f1-red focus:border-f1-red sm:text-sm"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id}
                    className={`${!user.isActive ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${!user.isActive && 'text-gray-500'}`}>
                        {user.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={!user.isActive ? 'text-gray-500' : ''}>
                        {user.email}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`${
                          user.isActive 
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={user.isActive ? 'Inativar Usuário' : 'Ativar Usuário'}
                      >
                        {user.isActive ? (
                          <TrashIcon className="w-5 h-5" />
                        ) : (
                          <CheckIcon className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar/Editar Usuário */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelEdit}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome
            </label>
            <input
              type="text"
              id="name"
              value={editingUser?.name || newUser.name}
              onChange={(e) => {
                if (editingUser) {
                  setEditingUser({ ...editingUser, name: e.target.value });
                } else {
                  setNewUser({ ...newUser, name: e.target.value });
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-f1-red focus:ring-f1-red sm:text-sm"
              placeholder="Ex: João Silva"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={editingUser?.email || newUser.email}
              onChange={(e) => {
                if (editingUser) {
                  setEditingUser({ ...editingUser, email: e.target.value });
                } else {
                  setNewUser({ ...newUser, email: e.target.value });
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-f1-red focus:ring-f1-red sm:text-sm"
              placeholder="Ex: joao@email.com"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-f1-red"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => editingUser ? handleUpdateUser(editingUser) : handleAddUser()}
              className="px-4 py-2 text-sm font-medium text-white bg-f1-red border border-transparent rounded-md hover:bg-f1-red/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-f1-red"
            >
              {editingUser ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setUserToToggle(null);
        }}
        title="Confirmar Ação"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-yellow-600">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <p className="font-medium">
              {userToToggle?.isActive 
                ? 'Tem certeza que deseja inativar este usuário?' 
                : 'Tem certeza que deseja ativar este usuário?'}
            </p>
          </div>
          <p className="text-gray-600">
            {userToToggle?.isActive 
              ? 'O usuário não poderá acessar o sistema enquanto estiver inativo.' 
              : 'O usuário poderá acessar o sistema após ser ativado.'}
          </p>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsConfirmModalOpen(false);
                setUserToToggle(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-f1-red"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmToggleStatus}
              className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                userToToggle?.isActive
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              {userToToggle?.isActive ? 'Inativar' : 'Ativar'}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
} 