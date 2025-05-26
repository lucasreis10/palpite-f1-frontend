'use client'

import { useState, useEffect } from 'react';
import { Header } from './../../../components/Header';
import { CreateUserModal } from './../../../components/CreateUserModal';
import { usersService, User } from './../../../services/users';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  UsersIcon,
  ShieldCheckIcon,
  UserIcon,
  CalendarIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'ADMIN' | 'USER'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await usersService.getAllUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleUserCreated = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers(prev => prev.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ));
  };

  const handleToggleUserStatus = (user: User) => {
    setUserToToggle(user);
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!userToToggle) return;

    try {
      let updatedUser: User;
      
      if (userToToggle.active) {
        updatedUser = await usersService.deactivateUser(userToToggle.id);
        toast.success('Usuário inativado com sucesso!');
      } else {
        updatedUser = await usersService.activateUser(userToToggle.id);
        toast.success('Usuário ativado com sucesso!');
      }

      setUsers(prev => prev.map(user => 
        user.id === userToToggle.id ? updatedUser : user
      ));
      
      setIsConfirmModalOpen(false);
      setUserToToggle(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar status do usuário. Tente novamente.';
      toast.error(errorMessage);
      console.error('Erro ao atualizar status do usuário:', error);
    }
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await usersService.deleteUser(userToDelete.id);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      toast.success('Usuário excluído com sucesso!');
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir usuário. Tente novamente.';
      toast.error(errorMessage);
      console.error('Erro ao excluir usuário:', error);
    }
  };

  const handleChangeRole = async (user: User, newRole: 'ADMIN' | 'USER') => {
    if (!confirm(`Tem certeza que deseja alterar o tipo de usuário de "${user.name}" para ${usersService.formatUserRole(newRole)}?`)) {
      return;
    }

    try {
      const updatedUser = await usersService.changeUserRole(user.id, newRole);
      setUsers(prev => prev.map(u => 
        u.id === user.id ? updatedUser : u
      ));
      toast.success(`Tipo de usuário alterado para ${usersService.formatUserRole(newRole)} com sucesso!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar tipo de usuário. Tente novamente.';
      toast.error(errorMessage);
      console.error('Erro ao alterar tipo de usuário:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = usersService.searchUsers([user], searchTerm).length > 0;
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && user.active) ||
      (statusFilter === 'inactive' && !user.active);

    const matchesRole = 
      roleFilter === 'all' || 
      user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

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
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
            <p className="text-gray-600 mt-2">
              Adicione, edite ou gerencie o status dos usuários do sistema
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-f1-red text-white px-4 py-2 rounded-md hover:bg-f1-red/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Usuário
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Barra de Busca */}
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

          {/* Filtro de Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-f1-red focus:border-f1-red sm:text-sm"
            >
              <option value="all">Todos os usuários</option>
              <option value="active">Apenas ativos</option>
              <option value="inactive">Apenas inativos</option>
            </select>
          </div>

          {/* Filtro de Tipo */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | 'ADMIN' | 'USER')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-f1-red focus:border-f1-red sm:text-sm"
            >
              <option value="all">Todos os tipos</option>
              <option value="ADMIN">Administradores</option>
              <option value="USER">Usuários</option>
            </select>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <UsersIcon className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <CheckIcon className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <XMarkIcon className="w-8 h-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Inativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => !u.active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <ShieldCheckIcon className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'ADMIN').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Usuário</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tipo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Criado em</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <UsersIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>
                        {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                          ? 'Nenhum usuário encontrado com os filtros aplicados' 
                          : 'Nenhum usuário cadastrado'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr 
                      key={user.id}
                      className={`${!user.active ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className={`font-medium ${!user.active && 'text-gray-500'}`}>
                              {usersService.formatUserName(user)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                          <span className={!user.active ? 'text-gray-500' : ''}>
                            {user.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.role === 'ADMIN' ? (
                            <ShieldCheckIcon className="w-4 h-4 text-purple-500" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={`text-sm ${!user.active ? 'text-gray-500' : ''}`}>
                            {usersService.formatUserRole(user.role)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${!user.active ? 'text-gray-500' : ''}`}>
                            {usersService.formatDate(user.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar Usuário"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          
                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user, e.target.value as 'ADMIN' | 'USER')}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-f1-red focus:border-f1-red"
                            title="Alterar Tipo"
                          >
                            <option value="USER">Usuário</option>
                            <option value="ADMIN">Admin</option>
                          </select>

                          <button
                            onClick={() => handleToggleUserStatus(user)}
                            className={`${
                              user.active 
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={user.active ? 'Inativar Usuário' : 'Ativar Usuário'}
                          >
                            {user.active ? (
                              <XMarkIcon className="w-5 h-5" />
                            ) : (
                              <CheckIcon className="w-5 h-5" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir Usuário"
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

      {/* Modal de Criar/Editar Usuário */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUserCreated={handleUserCreated}
        onUserUpdated={handleUserUpdated}
        editingUser={editingUser}
      />

      {/* Modal de Confirmação de Status */}
      {isConfirmModalOpen && userToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-yellow-600 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6" />
              <h3 className="text-lg font-medium">Confirmar Ação</h3>
            </div>
            <p className="text-gray-600 mb-4">
              {userToToggle.active 
                ? `Tem certeza que deseja inativar o usuário "${usersService.formatUserName(userToToggle)}"?` 
                : `Tem certeza que deseja ativar o usuário "${usersService.formatUserName(userToToggle)}"?`}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {userToToggle.active 
                ? 'O usuário não poderá acessar o sistema enquanto estiver inativo.' 
                : 'O usuário poderá acessar o sistema após ser ativado.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setUserToToggle(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-f1-red"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmToggleStatus}
                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  userToToggle.active
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                {userToToggle.active ? 'Inativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6" />
              <h3 className="text-lg font-medium">Confirmar Exclusão</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Tem certeza que deseja excluir o usuário <span className="font-semibold">"{usersService.formatUserName(userToDelete)}"</span>?
            </p>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    ⚠️ Atenção: Esta ação não pode ser desfeita!
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>O usuário será permanentemente removido do sistema</li>
                      <li>Todos os palpites e dados associados serão mantidos</li>
                      <li>O usuário não poderá mais acessar sua conta</li>
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
                  setUserToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Sim, Excluir Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 