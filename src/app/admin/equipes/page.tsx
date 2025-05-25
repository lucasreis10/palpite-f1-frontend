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
import { Team, User, mockUsers, initialTeams } from '@/data/teams';

export default function TeamsAdminPage() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [teamToToggle, setTeamToToggle] = useState<Team | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTeam, setNewTeam] = useState<Omit<Team, 'id'>>({
    name: '',
    members: [],
    isActive: true,
  });

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setNewTeam({ name: '', members: [], isActive: true });
    setIsModalOpen(false);
  };

  const handleUpdateTeam = (updatedTeam: Team) => {
    try {
      if (updatedTeam.members.length !== 2) {
        toast.error('Uma equipe deve ter exatamente 2 membros.');
        return;
      }

      setTeams(teams.map(t => 
        t.id === updatedTeam.id ? updatedTeam : t
      ));
      setEditingTeam(null);
      setIsModalOpen(false);
      toast.success('Equipe atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar equipe. Tente novamente.');
      console.error('Erro ao atualizar equipe:', error);
    }
  };

  const handleToggleTeamStatus = (team: Team) => {
    setTeamToToggle(team);
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!teamToToggle) return;

    try {
      const updatedTeam = { ...teamToToggle, isActive: !teamToToggle.isActive };
      setTeams(teams.map(t => 
        t.id === teamToToggle.id ? updatedTeam : t
      ));
      toast.success(`Equipe ${teamToToggle.isActive ? 'inativada' : 'ativada'} com sucesso!`);
      setIsConfirmModalOpen(false);
      setTeamToToggle(null);
    } catch (error) {
      toast.error('Erro ao atualizar status da equipe. Tente novamente.');
      console.error('Erro ao atualizar status da equipe:', error);
    }
  };

  const handleAddTeam = () => {
    try {
      if (!newTeam.name) {
        toast.error('Por favor, preencha o nome da equipe.');
        return;
      }

      if (newTeam.members.length !== 2) {
        toast.error('Uma equipe deve ter exatamente 2 membros.');
        return;
      }

      const newId = Math.max(...teams.map(t => t.id)) + 1;
      const teamToAdd = { ...newTeam, id: newId };
      
      setTeams([...teams, teamToAdd as Team]);
      setIsModalOpen(false);
      setNewTeam({ name: '', members: [], isActive: true });
      toast.success('Equipe adicionada com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar equipe. Tente novamente.');
      console.error('Erro ao adicionar equipe:', error);
    }
  };

  const handleSelectMember = (user: User) => {
    const currentTeam = editingTeam || newTeam;
    const updatedMembers = [...currentTeam.members];

    const memberIndex = updatedMembers.findIndex(m => m.id === user.id);
    if (memberIndex >= 0) {
      updatedMembers.splice(memberIndex, 1);
    } else if (updatedMembers.length < 2) {
      updatedMembers.push(user);
    } else {
      toast.error('Uma equipe pode ter no máximo 2 membros.');
      return;
    }

    if (editingTeam) {
      setEditingTeam({ ...editingTeam, members: updatedMembers });
    } else {
      setNewTeam({ ...newTeam, members: updatedMembers });
    }
  };

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.members.some(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Equipes</h1>
            <p className="text-gray-600 mt-2">
              Adicione, edite ou desative equipes do campeonato
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-f1-red text-black px-4 py-2 rounded-md hover:bg-f1-red/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Nova Equipe
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
              placeholder="Buscar por nome da equipe ou membro..."
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Equipe</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Membros</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTeams.map((team) => (
                  <tr 
                    key={team.id}
                    className={`${!team.isActive ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        team.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {team.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${!team.isActive && 'text-gray-500'}`}>
                        {team.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {team.members.map(member => (
                          <span 
                            key={member.id}
                            className={!team.isActive ? 'text-gray-500' : ''}
                          >
                            {member.name} ({member.email})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => handleEditTeam(team)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleToggleTeamStatus(team)}
                        className={`${
                          team.isActive 
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={team.isActive ? 'Inativar Equipe' : 'Ativar Equipe'}
                      >
                        {team.isActive ? (
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

      {/* Modal de Adicionar/Editar Equipe */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelEdit}
        title={editingTeam ? 'Editar Equipe' : 'Nova Equipe'}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome da Equipe
            </label>
            <input
              type="text"
              id="name"
              value={editingTeam?.name || newTeam.name}
              onChange={(e) => {
                if (editingTeam) {
                  setEditingTeam({ ...editingTeam, name: e.target.value });
                } else {
                  setNewTeam({ ...newTeam, name: e.target.value });
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-f1-red focus:ring-f1-red sm:text-sm"
              placeholder="Ex: Red Bull Racing"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Membros da Equipe (selecione 2)
            </label>
            <div className="space-y-2">
              {mockUsers.map(user => {
                const isSelected = (editingTeam || newTeam).members.some(m => m.id === user.id);
                return (
                  <button
                    key={user.id}
                    onClick={() => handleSelectMember(user)}
                    className={`w-full text-left px-4 py-2 rounded-md border ${
                      isSelected 
                        ? 'border-f1-red bg-f1-red/10 text-gray-900'
                        : 'border-gray-300 hover:border-f1-red hover:bg-f1-red/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{user.name} ({user.email})</span>
                      {isSelected && <CheckIcon className="w-5 h-5 text-f1-red" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-f1-red"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => editingTeam ? handleUpdateTeam(editingTeam) : handleAddTeam()}
              className="px-4 py-2 text-sm font-medium text-white bg-f1-red border border-transparent rounded-md hover:bg-f1-red/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-f1-red"
            >
              {editingTeam ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setTeamToToggle(null);
        }}
        title="Confirmar Ação"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-yellow-600">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <p className="font-medium">
              {teamToToggle?.isActive 
                ? 'Tem certeza que deseja inativar esta equipe?' 
                : 'Tem certeza que deseja ativar esta equipe?'}
            </p>
          </div>
          <p className="text-gray-600">
            {teamToToggle?.isActive 
              ? 'A equipe não poderá participar do campeonato enquanto estiver inativa.' 
              : 'A equipe poderá participar do campeonato após ser ativada.'}
          </p>
          <div className="pt-4 flex justify-end gap-3">
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
                teamToToggle?.isActive
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              {teamToToggle?.isActive ? 'Inativar' : 'Ativar'}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
} 