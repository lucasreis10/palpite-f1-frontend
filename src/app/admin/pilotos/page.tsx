'use client'

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { drivers as initialDrivers } from '@/data/drivers';
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

interface Driver {
  id: number;
  name: string;
  team: string;
  isActive?: boolean;
}

export default function DriversAdminPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [driverToToggle, setDriverToToggle] = useState<Driver | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newDriver, setNewDriver] = useState<Omit<Driver, 'id'>>({
    name: '',
    team: '',
    isActive: true,
  });

  useEffect(() => {
    setDrivers(initialDrivers.map(driver => ({ ...driver, isActive: true })));
  }, []);

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
  };

  const handleCancelEdit = () => {
    setEditingDriver(null);
    setNewDriver({ name: '', team: '', isActive: true });
    setIsModalOpen(false);
  };

  const handleUpdateDriver = (updatedDriver: Driver) => {
    try {
      // TODO: Implementar chamada à API para atualizar piloto
      setDrivers(drivers.map(d => 
        d.id === updatedDriver.id ? updatedDriver : d
      ));
      setEditingDriver(null);
      toast.success('Piloto atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar piloto. Tente novamente.');
      console.error('Erro ao atualizar piloto:', error);
    }
  };

  const handleToggleDriverStatus = (driver: Driver) => {
    setDriverToToggle(driver);
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!driverToToggle) return;

    try {
      // TODO: Implementar chamada à API para atualizar status do piloto
      const updatedDriver = { ...driverToToggle, isActive: !driverToToggle.isActive };
      setDrivers(drivers.map(d => 
        d.id === driverToToggle.id ? updatedDriver : d
      ));
      toast.success(`Piloto ${driverToToggle.isActive ? 'inativado' : 'ativado'} com sucesso!`);
      setIsConfirmModalOpen(false);
      setDriverToToggle(null);
    } catch (error) {
      toast.error('Erro ao atualizar status do piloto. Tente novamente.');
      console.error('Erro ao atualizar status do piloto:', error);
    }
  };

  const handleAddDriver = () => {
    try {
      if (!newDriver.name || !newDriver.team) {
        toast.error('Por favor, preencha todos os campos.');
        return;
      }

      // TODO: Implementar chamada à API para adicionar piloto
      const newId = Math.max(...drivers.map(d => d.id)) + 1;
      const driverToAdd = { ...newDriver, id: newId };
      
      setDrivers([...drivers, driverToAdd as Driver]);
      setIsModalOpen(false);
      setNewDriver({ name: '', team: '', isActive: true });
      toast.success('Piloto adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro ao adicionar piloto. Tente novamente.');
      console.error('Erro ao adicionar piloto:', error);
    }
  };

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Pilotos</h1>
            <p className="text-gray-600 mt-2">
              Adicione, edite ou desative pilotos do grid
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

        {/* Barra de Busca */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou equipe..."
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Piloto</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Equipe</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr 
                    key={driver.id}
                    className={`${!driver.isActive ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        driver.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {driver.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingDriver?.id === driver.id ? (
                        <input
                          type="text"
                          value={editingDriver.name}
                          onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-f1-red focus:ring-f1-red"
                        />
                      ) : (
                        <span className={`font-medium ${!driver.isActive && 'text-gray-500'}`}>
                          {driver.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingDriver?.id === driver.id ? (
                        <input
                          type="text"
                          value={editingDriver.team}
                          onChange={(e) => setEditingDriver({ ...editingDriver, team: e.target.value })}
                          className="w-full rounded-md border-gray-300 shadow-sm focus:border-f1-red focus:ring-f1-red"
                        />
                      ) : (
                        <span className={!driver.isActive ? 'text-gray-500' : ''}>
                          {driver.team}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      {editingDriver?.id === driver.id ? (
                        <>
                          <button
                            onClick={() => handleUpdateDriver(editingDriver)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEditDriver(driver)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleToggleDriverStatus(driver)}
                            className={`${
                              driver.isActive 
                                ? 'text-red-600 hover:text-red-900'
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={driver.isActive ? 'Inativar Piloto' : 'Ativar Piloto'}
                          >
                            {driver.isActive ? (
                              <TrashIcon className="w-5 h-5" />
                            ) : (
                              <CheckIcon className="w-5 h-5" />
                            )}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Adicionar Piloto */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelEdit}
        title="Novo Piloto"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nome do Piloto
            </label>
            <input
              type="text"
              id="name"
              value={newDriver.name}
              onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-f1-red focus:ring-f1-red sm:text-sm"
              placeholder="Ex: Max Verstappen"
            />
          </div>
          <div>
            <label htmlFor="team" className="block text-sm font-medium text-gray-700">
              Equipe
            </label>
            <input
              type="text"
              id="team"
              value={newDriver.team}
              onChange={(e) => setNewDriver({ ...newDriver, team: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-f1-red focus:ring-f1-red sm:text-sm"
              placeholder="Ex: Red Bull Racing"
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-f1-red"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleAddDriver}
              className="px-4 py-2 text-sm font-medium text-white bg-f1-red border border-transparent rounded-md hover:bg-f1-red/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-f1-red"
            >
              Adicionar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmação */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setDriverToToggle(null);
        }}
        title="Confirmar Ação"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-yellow-600">
            <ExclamationTriangleIcon className="w-6 h-6" />
            <p className="font-medium">
              {driverToToggle?.isActive 
                ? 'Tem certeza que deseja inativar este piloto?' 
                : 'Tem certeza que deseja ativar este piloto?'}
            </p>
          </div>
          <p className="text-gray-600">
            {driverToToggle?.isActive 
              ? 'O piloto não poderá ser selecionado para palpites enquanto estiver inativo.' 
              : 'O piloto poderá ser selecionado para palpites após ser ativado.'}
          </p>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsConfirmModalOpen(false);
                setDriverToToggle(null);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-800 border border-neutral-700 rounded-md hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-f1-red"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmToggleStatus}
              className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                driverToToggle?.isActive
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              {driverToToggle?.isActive ? 'Inativar' : 'Ativar'}
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
} 