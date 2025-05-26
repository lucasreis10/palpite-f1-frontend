'use client'

import { useState, useEffect } from 'react';
import { Header } from './../../../components/Header';
import { CreateUserTeamModal } from './../../../components/CreateUserTeamModal';
import { userTeamsService, UserTeam } from './../../../services/userTeams';
import { usersService, User } from './../../../services/users';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  TrophyIcon,
  CalendarIcon,
  StarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function UserTeamsAdminPage() {
  const [teams, setTeams] = useState<UserTeam[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [teamToToggle, setTeamToToggle] = useState<UserTeam | null>(null);
  const [editingTeam, setEditingTeam] = useState<UserTeam | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [teamsData, usersData] = await Promise.all([
        userTeamsService.getAllTeams(),
        usersService.getActiveUsers()
      ]);
      setTeams(teamsData);
      setAvailableUsers(usersData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
      setTeams([]);
      setAvailableUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTeam = (team: UserTeam) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
  };

  const handleTeamCreated = (newTeam: UserTeam) => {
    setTeams(prev => [...prev, newTeam]);
  };

  const handleTeamUpdated = (updatedTeam: UserTeam) => {
    setTeams(prev => prev.map(team => 
      team.id === updatedTeam.id ? updatedTeam : team
    ));
  };

  const handleToggleTeamStatus = (team: UserTeam) => {
    setTeamToToggle(team);
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!teamToToggle) return;

    try {
      let updatedTeam: UserTeam;
      
      if (teamToToggle.active) {
        updatedTeam = await userTeamsService.deactivateTeam(teamToToggle.id);
        toast.success('Equipe inativada com sucesso!');
      } else {
        updatedTeam = await userTeamsService.activateTeam(teamToToggle.id);
        toast.success('Equipe ativada com sucesso!');
      }

      setTeams(prev => prev.map(team => 
        team.id === teamToToggle.id ? updatedTeam : team
      ));
      
      setIsConfirmModalOpen(false);
      setTeamToToggle(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar status da equipe. Tente novamente.');
      console.error('Erro ao atualizar status da equipe:', error);
    }
  };

  const handleDeleteTeam = async (team: UserTeam) => {
    if (!confirm(`Tem certeza que deseja excluir a equipe "${team.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await userTeamsService.deleteTeam(team.id);
      setTeams(prev => prev.filter(t => t.id !== team.id));
      toast.success('Equipe excluída com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir equipe. Tente novamente.');
      console.error('Erro ao excluir equipe:', error);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = userTeamsService.searchTeams([team], searchTerm).length > 0;
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && team.active) ||
      (statusFilter === 'inactive' && !team.active);

    const matchesYear = 
      yearFilter === 'all' || 
      team.year.toString() === yearFilter;

    return matchesSearch && matchesStatus && matchesYear;
  });

  const uniqueYears = userTeamsService.getUniqueYears(teams);

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
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Equipes</h1>
            <p className="text-gray-600 mt-2">
              Gerencie as equipes de palpiteiros do campeonato
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-f1-red text-white px-4 py-2 rounded-md hover:bg-f1-red/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nova Equipe
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
              placeholder="Buscar por nome da equipe ou membros..."
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
              <option value="all">Todas as equipes</option>
              <option value="active">Apenas ativas</option>
              <option value="inactive">Apenas inativas</option>
            </select>
          </div>

          {/* Filtro de Ano */}
          <div>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-f1-red focus:border-f1-red sm:text-sm"
            >
              <option value="all">Todos os anos</option>
              {uniqueYears.map((year) => (
                <option key={year} value={year.toString()}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <UserGroupIcon className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <CheckIcon className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Ativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teams.filter(t => t.active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <XMarkIcon className="w-8 h-8 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Inativas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {teams.filter(t => !t.active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <CalendarIcon className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Anos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {uniqueYears.length}
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Equipe</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Membros</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ano</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pontuação</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <UserGroupIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>
                        {searchTerm || statusFilter !== 'all' || yearFilter !== 'all'
                          ? 'Nenhuma equipe encontrada com os filtros aplicados' 
                          : 'Nenhuma equipe cadastrada'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team) => (
                    <tr 
                      key={team.id}
                      className={`${!team.active ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          team.active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {team.active ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className={`font-medium ${!team.active && 'text-gray-500'}`}>
                              {userTeamsService.formatTeamName(team)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {team.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <UsersIcon className="w-4 h-4 text-gray-400" />
                            <span className={`text-sm ${!team.active ? 'text-gray-500' : ''}`}>
                              {team.user1.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <UsersIcon className="w-4 h-4 text-gray-400" />
                            <span className={`text-sm ${!team.active ? 'text-gray-500' : ''}`}>
                              {team.user2.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className={!team.active ? 'text-gray-500' : ''}>
                            {team.year}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <TrophyIcon className="w-4 h-4 text-gray-400" />
                          <span className={`font-semibold ${!team.active ? 'text-gray-500' : 'text-yellow-600'}`}>
                            {team.totalScore.toLocaleString()} pts
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => handleEditTeam(team)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar Equipe"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleTeamStatus(team)}
                          className={`${
                            team.active 
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={team.active ? 'Inativar Equipe' : 'Ativar Equipe'}
                        >
                          {team.active ? (
                            <XMarkIcon className="w-5 h-5" />
                          ) : (
                            <CheckIcon className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir Equipe"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Criar/Editar Equipe */}
      <CreateUserTeamModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onTeamCreated={handleTeamCreated}
        onTeamUpdated={handleTeamUpdated}
        editingTeam={editingTeam}
        availableUsers={availableUsers}
      />

      {/* Modal de Confirmação */}
      {isConfirmModalOpen && teamToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-yellow-600 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6" />
              <h3 className="text-lg font-medium">Confirmar Ação</h3>
            </div>
            <p className="text-gray-600 mb-4">
              {teamToToggle.active 
                ? `Tem certeza que deseja inativar a equipe "${userTeamsService.formatTeamName(teamToToggle)}"?` 
                : `Tem certeza que deseja ativar a equipe "${userTeamsService.formatTeamName(teamToToggle)}"?`}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {teamToToggle.active 
                ? 'A equipe não poderá participar do campeonato enquanto estiver inativa.' 
                : 'A equipe poderá participar do campeonato após ser ativada.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setTeamToToggle(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-f1-red"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmToggleStatus}
                className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  teamToToggle.active
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                {teamToToggle.active ? 'Inativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 