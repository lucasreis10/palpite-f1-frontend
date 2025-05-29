'use client'

import { useState, useEffect } from 'react';
import { Header } from './../../../components/Header';
import { CreatePilotModal } from './../../../components/CreatePilotModal';
import { pilotsService, Pilot } from './../../../services/pilots';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  UserIcon,
  CalendarIcon,
  FlagIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function DriversAdminPage() {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pilotToToggle, setPilotToToggle] = useState<Pilot | null>(null);
  const [editingPilot, setEditingPilot] = useState<Pilot | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadPilots();
  }, []);

  const loadPilots = async () => {
    try {
      setIsLoading(true);
      const pilotsData = await pilotsService.getAllPilots();
      setPilots(pilotsData);
    } catch (error) {
      console.error('Erro ao carregar pilotos:', error);
      toast.error('Erro ao carregar pilotos');
      setPilots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPilot = (pilot: Pilot) => {
    setEditingPilot(pilot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPilot(null);
  };

  const handlePilotCreated = (newPilot: Pilot) => {
    setPilots(prev => [...prev, newPilot]);
  };

  const handlePilotUpdated = (updatedPilot: Pilot) => {
    setPilots(prev => prev.map(pilot => 
      pilot.id === updatedPilot.id ? updatedPilot : pilot
    ));
  };

  const handleTogglePilotStatus = (pilot: Pilot) => {
    setPilotToToggle(pilot);
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!pilotToToggle) return;

    try {
      let updatedPilot: Pilot;
      
      if (pilotToToggle.active) {
        updatedPilot = await pilotsService.deactivatePilot(pilotToToggle.id);
        toast.success('Piloto inativado com sucesso!');
      } else {
        updatedPilot = await pilotsService.activatePilot(pilotToToggle.id);
        toast.success('Piloto ativado com sucesso!');
      }

      setPilots(prev => prev.map(pilot => 
        pilot.id === pilotToToggle.id ? updatedPilot : pilot
      ));
      
      setIsConfirmModalOpen(false);
      setPilotToToggle(null);
    } catch (error) {
      toast.error('Erro ao atualizar status do piloto. Tente novamente.');
      console.error('Erro ao atualizar status do piloto:', error);
    }
  };

  const filteredPilots = pilots.filter(pilot => {
    const matchesSearch = 
      pilotsService.formatPilotName(pilot).toLowerCase().includes(searchTerm.toLowerCase()) ||
      pilotsService.getTeamName(pilot).toLowerCase().includes(searchTerm.toLowerCase()) ||
      pilot.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pilot.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && pilot.active) ||
      (statusFilter === 'inactive' && !pilot.active);

    return matchesSearch && matchesStatus;
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
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Pilotos</h1>
            <p className="text-gray-600 mt-2">
              Adicione, edite ou gerencie o status dos pilotos do grid
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-f1-red text-black px-4 py-2 rounded-md hover:bg-f1-red/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Piloto
          </button>
        </div>

        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Barra de Busca */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, equipe, nacionalidade ou código..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-f1-red focus:border-f1-red sm:text-sm"
            />
          </div>

          {/* Filtro de Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              className="block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-f1-red focus:border-f1-red sm:text-sm"
            >
              <option value="all">Todos os pilotos</option>
              <option value="active">Apenas ativos</option>
              <option value="inactive">Apenas inativos</option>
            </select>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <UserIcon className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{pilots.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <CheckIcon className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pilots.filter(p => p.active).length}
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
                  {pilots.filter(p => !p.active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <FlagIcon className="w-8 h-8 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Nacionalidades</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(pilots.map(p => p.nationality)).size}
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Piloto</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Equipe</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nacionalidade</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Idade</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Código</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Número</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPilots.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Nenhum piloto encontrado com os filtros aplicados' 
                          : 'Nenhum piloto cadastrado'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPilots.map((pilot) => (
                    <tr 
                      key={pilot.id}
                      className={`${!pilot.active ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pilot.active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {pilot.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className={`font-medium ${!pilot.active && 'text-gray-500'}`}>
                              {pilotsService.formatPilotName(pilot)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pilot.driverId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={!pilot.active ? 'text-gray-500' : ''}>
                          {pilotsService.getTeamName(pilot)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={!pilot.active ? 'text-gray-500' : ''}>
                          {pilot.nationality}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${!pilot.active ? 'text-gray-500' : ''}`}>
                            {pilotsService.calculateAge(pilot.dateOfBirth)} anos
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-mono text-sm ${!pilot.active ? 'text-gray-500' : ''}`}>
                          {pilot.code || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <HashtagIcon className="w-4 h-4 text-gray-400" />
                          <span className={`text-sm ${!pilot.active ? 'text-gray-500' : ''}`}>
                            {pilot.permanentNumber || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => handleEditPilot(pilot)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar Piloto"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleTogglePilotStatus(pilot)}
                          className={`${
                            pilot.active 
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={pilot.active ? 'Inativar Piloto' : 'Ativar Piloto'}
                        >
                          {pilot.active ? (
                            <TrashIcon className="w-5 h-5" />
                          ) : (
                            <CheckIcon className="w-5 h-5" />
                          )}
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

      {/* Modal de Criar/Editar Piloto */}
      <CreatePilotModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPilotCreated={handlePilotCreated}
        onPilotUpdated={handlePilotUpdated}
        editingPilot={editingPilot}
      />

      {/* Modal de Confirmação */}
      {isConfirmModalOpen && pilotToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-yellow-600 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6" />
              <h3 className="text-lg font-medium">Confirmar Ação</h3>
            </div>
            <p className="text-gray-600 mb-4">
              {pilotToToggle.active 
                ? `Tem certeza que deseja inativar ${pilotsService.formatPilotName(pilotToToggle)}?` 
                : `Tem certeza que deseja ativar ${pilotsService.formatPilotName(pilotToToggle)}?`}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {pilotToToggle.active 
                ? 'O piloto não poderá ser selecionado para palpites enquanto estiver inativo.' 
                : 'O piloto poderá ser selecionado para palpites após ser ativado.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setPilotToToggle(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-f1-red"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmToggleStatus}
                className={`px-4 py-2 text-sm font-medium text-black border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  pilotToToggle.active
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                {pilotToToggle.active ? 'Inativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 