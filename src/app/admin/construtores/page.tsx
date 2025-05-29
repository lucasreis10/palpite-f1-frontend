'use client'

import { useState, useEffect } from 'react';
import { Header } from '../../../components/Header';
import { CreateConstructorModal } from '../../../components/CreateConstructorModal';
import { constructorsService, Constructor } from '../../../services/constructors';
import { 
  PencilIcon, 
  TrashIcon, 
  PlusIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  FlagIcon,
  LinkIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function ConstructorsAdminPage() {
  const [constructors, setConstructors] = useState<Constructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [constructorToToggle, setConstructorToToggle] = useState<Constructor | null>(null);
  const [editingConstructor, setEditingConstructor] = useState<Constructor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [nationalityFilter, setNationalityFilter] = useState<string>('all');

  useEffect(() => {
    loadConstructors();
  }, []);

  const loadConstructors = async () => {
    try {
      setIsLoading(true);
      const constructorsData = await constructorsService.getAllConstructors();
      setConstructors(constructorsData);
    } catch (error) {
      console.error('Erro ao carregar construtores:', error);
      toast.error('Erro ao carregar construtores');
      setConstructors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditConstructor = (constructor: Constructor) => {
    setEditingConstructor(constructor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConstructor(null);
  };

  const handleConstructorCreated = (newConstructor: Constructor) => {
    setConstructors(prev => [...prev, newConstructor]);
  };

  const handleConstructorUpdated = (updatedConstructor: Constructor) => {
    setConstructors(prev => prev.map(constructor => 
      constructor.id === updatedConstructor.id ? updatedConstructor : constructor
    ));
  };

  const handleToggleConstructorStatus = (constructor: Constructor) => {
    setConstructorToToggle(constructor);
    setIsConfirmModalOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!constructorToToggle) return;

    try {
      let updatedConstructor: Constructor;
      
      if (constructorToToggle.active) {
        updatedConstructor = await constructorsService.deactivateConstructor(constructorToToggle.id);
        toast.success('Construtor inativado com sucesso!');
      } else {
        updatedConstructor = await constructorsService.activateConstructor(constructorToToggle.id);
        toast.success('Construtor ativado com sucesso!');
      }

      setConstructors(prev => prev.map(constructor => 
        constructor.id === constructorToToggle.id ? updatedConstructor : constructor
      ));
      
      setIsConfirmModalOpen(false);
      setConstructorToToggle(null);
    } catch (error) {
      toast.error('Erro ao atualizar status do construtor. Tente novamente.');
      console.error('Erro ao atualizar status do construtor:', error);
    }
  };

  const filteredConstructors = constructors.filter(constructor => {
    const matchesSearch = constructorsService.searchConstructors([constructor], searchTerm).length > 0;
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && constructor.active) ||
      (statusFilter === 'inactive' && !constructor.active);

    const matchesNationality = 
      nationalityFilter === 'all' || 
      constructor.nationality === nationalityFilter;

    return matchesSearch && matchesStatus && matchesNationality;
  });

  const uniqueNationalities = constructorsService.getUniqueNationalities(constructors);

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
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Construtores</h1>
            <p className="text-gray-600 mt-2">
              Adicione, edite ou gerencie o status dos construtores de F1
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-f1-red text-black px-4 py-2 rounded-md hover:bg-f1-red/90 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Novo Construtor
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
              placeholder="Buscar por nome, nacionalidade ou ID..."
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
              <option value="all">Todos os construtores</option>
              <option value="active">Apenas ativos</option>
              <option value="inactive">Apenas inativos</option>
            </select>
          </div>

          {/* Filtro de Nacionalidade */}
          <div>
            <select
              value={nationalityFilter}
              onChange={(e) => setNationalityFilter(e.target.value)}
              className="block w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md leading-5 focus:outline-none focus:ring-1 focus:ring-f1-red focus:border-f1-red sm:text-sm"
            >
              <option value="all">Todas as nacionalidades</option>
              {uniqueNationalities.map((nationality) => (
                <option key={nationality} value={nationality}>
                  {nationality}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <BuildingOfficeIcon className="w-8 h-8 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-900">{constructors.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <CheckIcon className="w-8 h-8 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {constructors.filter(c => c.active).length}
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
                  {constructors.filter(c => !c.active).length}
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
                  {uniqueNationalities.length}
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
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Construtor</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nacionalidade</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Constructor ID</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">URL</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredConstructors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <BuildingOfficeIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>
                        {searchTerm || statusFilter !== 'all' || nationalityFilter !== 'all'
                          ? 'Nenhum construtor encontrado com os filtros aplicados' 
                          : 'Nenhum construtor cadastrado'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredConstructors.map((constructor) => (
                    <tr 
                      key={constructor.id}
                      className={`${!constructor.active ? 'bg-gray-50/50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          constructor.active 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {constructor.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className={`font-medium ${!constructor.active && 'text-gray-500'}`}>
                              {constructorsService.formatConstructorName(constructor)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {constructor.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <FlagIcon className="w-4 h-4 text-gray-400" />
                          <span className={!constructor.active ? 'text-gray-500' : ''}>
                            {constructor.nationality}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <HashtagIcon className="w-4 h-4 text-gray-400" />
                          <span className={`font-mono text-sm ${!constructor.active ? 'text-gray-500' : ''}`}>
                            {constructor.constructorId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {constructor.url ? (
                          <a
                            href={constructor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-900"
                          >
                            <LinkIcon className="w-4 h-4" />
                            <span className="text-sm">Wikipedia</span>
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <button
                          onClick={() => handleEditConstructor(constructor)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar Construtor"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleToggleConstructorStatus(constructor)}
                          className={`${
                            constructor.active 
                              ? 'text-red-600 hover:text-red-900'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={constructor.active ? 'Inativar Construtor' : 'Ativar Construtor'}
                        >
                          {constructor.active ? (
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

      {/* Modal de Criar/Editar Construtor */}
      <CreateConstructorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConstructorCreated={handleConstructorCreated}
        onConstructorUpdated={handleConstructorUpdated}
        editingConstructor={editingConstructor}
      />

      {/* Modal de Confirmação */}
      {isConfirmModalOpen && constructorToToggle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 text-yellow-600 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6" />
              <h3 className="text-lg font-medium">Confirmar Ação</h3>
            </div>
            <p className="text-gray-600 mb-4">
              {constructorToToggle.active 
                ? `Tem certeza que deseja inativar ${constructorsService.formatConstructorName(constructorToToggle)}?` 
                : `Tem certeza que deseja ativar ${constructorsService.formatConstructorName(constructorToToggle)}?`}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {constructorToToggle.active 
                ? 'O construtor não poderá participar do campeonato enquanto estiver inativo.' 
                : 'O construtor poderá participar do campeonato após ser ativado.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmModalOpen(false);
                  setConstructorToToggle(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-f1-red"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmToggleStatus}
                className={`px-4 py-2 text-sm font-medium text-black border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  constructorToToggle.active
                    ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
              >
                {constructorToToggle.active ? 'Inativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
} 