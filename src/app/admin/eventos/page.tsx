'use client'

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Tab } from '@headlessui/react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  PencilSquareIcon,
  ArrowPathIcon,
  CloudArrowDownIcon,
} from '@heroicons/react/24/outline';
import { F1Service } from '@/services/f1';
import { toast } from 'react-hot-toast';
import { DriverAutocomplete } from '@/components/DriverAutocomplete';
import { drivers } from '@/data/drivers';

// Interface para o tipo de resultado
interface Result {
  position: number;
  driver: string;
  team: string;
}

interface ResultFormProps {
  onSubmit: (results: Result[]) => void;
  onImport: () => void;
  isLoading?: boolean;
}

const ResultForm = ({ onSubmit, onImport, isLoading = false }: ResultFormProps) => {
  const [results, setResults] = useState<Result[]>(
    Array.from({ length: 14 }, (_, i) => ({
      position: i + 1,
      driver: '',
      team: '',
    }))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(results);
  };

  const handleDriverSelect = (driver: { name: string; team: string }, position: number) => {
    const newResults = [...results];
    newResults[position - 1] = {
      position,
      driver: driver.name,
      team: driver.team,
    };
    setResults(newResults);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Registrar Resultado</h3>
        <button
          onClick={onImport}
          disabled={isLoading}
          className="flex items-center gap-2 text-f1-red hover:text-f1-red/80 font-medium"
        >
          <CloudArrowDownIcon className="w-5 h-5" />
          {isLoading ? 'Importando...' : 'Importar da F1'}
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {results.map((result, index) => (
          <DriverAutocomplete
            key={index}
            drivers={drivers.filter(d => 
              !results.some(r => r.driver === d.name) || 
              results[index].driver === d.name
            )}
            selectedDriver={
              result.driver ? 
              { id: index, name: result.driver, team: result.team } :
              null
            }
            onSelect={(driver) => handleDriverSelect(driver, index + 1)}
            position={index + 1}
          />
        ))}
        
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-f1-red text-white px-6 py-2 rounded-md font-medium hover:bg-f1-red/90 transition-colors"
          >
            Salvar Resultado
          </button>
        </div>
      </form>
    </div>
  );
};

// Dados mockados para exemplo
const events = [
  {
    id: 1,
    name: 'GP do Bahrein',
    date: '02/03/2024',
    qualifying: {
      status: 'consolidated',
      results: [
        { position: 1, driver: 'Max Verstappen', team: 'Red Bull Racing' },
        { position: 2, driver: 'Charles Leclerc', team: 'Ferrari' },
        { position: 3, driver: 'Lewis Hamilton', team: 'Mercedes' },
      ]
    },
    race: {
      status: 'consolidated',
      results: [
        { position: 1, driver: 'Max Verstappen', team: 'Red Bull Racing' },
        { position: 2, driver: 'Sergio Pérez', team: 'Red Bull Racing' },
        { position: 3, driver: 'Carlos Sainz', team: 'Ferrari' },
      ]
    }
  },
  {
    id: 2,
    name: 'GP da Arábia Saudita',
    date: '09/03/2024',
    qualifying: {
      status: 'pending',
      results: []
    },
    race: {
      status: 'pending',
      results: []
    }
  },
  {
    id: 3,
    name: 'GP da Austrália',
    date: '24/03/2024',
    qualifying: {
      status: 'pending',
      results: []
    },
    race: {
      status: 'pending',
      results: []
    }
  }
];

export default function EventsAdminPage() {
  const [selectedEvent, setSelectedEvent] = useState(events[0]);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'consolidated':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'consolidated':
        return <CheckCircleIcon className="w-5 h-5" />;
      case 'pending':
        return <ArrowPathIcon className="w-5 h-5" />;
      default:
        return <XCircleIcon className="w-5 h-5" />;
    }
  };

  const handleImportResults = async () => {
    setIsImporting(true);
    try {
      const results = selectedTab === 0 
        ? await F1Service.getLatestQualifyingResults()
        : await F1Service.getLatestRaceResults();
      
      // Atualizar o estado do evento com os resultados importados
      const updatedEvent = { ...selectedEvent };
      if (selectedTab === 0) {
        updatedEvent.qualifying = {
          status: 'consolidated',
          results: results
        };
      } else {
        updatedEvent.race = {
          status: 'consolidated',
          results: results
        };
      }
      
      setSelectedEvent(updatedEvent);
      toast.success('Resultados importados com sucesso!');
    } catch (error) {
      toast.error('Erro ao importar resultados. Tente novamente.');
      console.error('Erro ao importar resultados:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSubmitResults = async (results: Result[]) => {
    try {
      // TODO: Implementar a lógica para salvar os resultados no backend
      toast.success('Resultados salvos com sucesso!');
      
      // Atualizar o estado local
      const updatedEvent = { ...selectedEvent };
      if (selectedTab === 0) {
        updatedEvent.qualifying = {
          status: 'consolidated',
          results: results
        };
      } else {
        updatedEvent.race = {
          status: 'consolidated',
          results: results
        };
      }
      
      setSelectedEvent(updatedEvent);
    } catch (error) {
      toast.error('Erro ao salvar resultados. Tente novamente.');
      console.error('Erro ao salvar resultados:', error);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Eventos</h1>
          <p className="text-gray-600 mt-2">
            Cadastre novos eventos, registre resultados e consolide pontuações
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Lista de Eventos */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-gray-900">Eventos</h2>
                  <button className="bg-f1-red text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-f1-red/90 transition-colors">
                    Novo Evento
                  </button>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {events.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                      selectedEvent.id === event.id ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{event.name}</h3>
                      <span className="text-sm text-gray-500">{event.date}</span>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          getStatusColor(event.qualifying.status)
                        }`}>
                          {getStatusIcon(event.qualifying.status)}
                          <span className="ml-1">Quali</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          getStatusColor(event.race.status)
                        }`}>
                          {getStatusIcon(event.race.status)}
                          <span className="ml-1">Corrida</span>
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detalhes do Evento */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.name}</h2>
                    <p className="text-gray-600">{selectedEvent.date}</p>
                  </div>
                  <button className="text-gray-500 hover:text-gray-700">
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                </div>

                <Tab.Group onChange={setSelectedTab}>
                  <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
                    <Tab className={({ selected }) =>
                      `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                      ${selected
                        ? 'bg-white text-f1-red shadow'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }>
                      Classificação
                    </Tab>
                    <Tab className={({ selected }) =>
                      `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                      ${selected
                        ? 'bg-white text-f1-red shadow'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }>
                      Corrida
                    </Tab>
                  </Tab.List>
                  <Tab.Panels>
                    <Tab.Panel>
                      <div className="space-y-6">
                        {selectedEvent.qualifying.status === 'pending' ? (
                          <ResultForm
                            onSubmit={handleSubmitResults}
                            onImport={handleImportResults}
                            isLoading={isImporting}
                          />
                        ) : (
                          <>
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium text-gray-900">
                                Resultado da Classificação
                              </h3>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    const updatedEvent = { ...selectedEvent };
                                    updatedEvent.qualifying.status = 'pending';
                                    setSelectedEvent(updatedEvent);
                                  }}
                                  className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                                >
                                  Editar Resultado
                                </button>
                                <button className="text-f1-red hover:text-f1-red/80 font-medium text-sm">
                                  Reconsolidar Pontos
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {selectedEvent.qualifying.results.map((result) => (
                                <div 
                                  key={result.position}
                                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                                >
                                  <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                      result.position <= 3 ? 'bg-green-100 text-green-800' : 
                                      result.position <= 6 ? 'bg-blue-100 text-blue-800' : 
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {result.position}
                                    </span>
                                    <div>
                                      <p className="font-medium text-gray-900">{result.driver}</p>
                                      <p className="text-sm text-gray-500">{result.team}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </Tab.Panel>
                    <Tab.Panel>
                      <div className="space-y-6">
                        {selectedEvent.race.status === 'pending' ? (
                          <ResultForm
                            onSubmit={handleSubmitResults}
                            onImport={handleImportResults}
                            isLoading={isImporting}
                          />
                        ) : (
                          <>
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium text-gray-900">
                                Resultado da Corrida
                              </h3>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    const updatedEvent = { ...selectedEvent };
                                    updatedEvent.race.status = 'pending';
                                    setSelectedEvent(updatedEvent);
                                  }}
                                  className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                                >
                                  Editar Resultado
                                </button>
                                <button className="text-f1-red hover:text-f1-red/80 font-medium text-sm">
                                  Reconsolidar Pontos
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {selectedEvent.race.results.map((result) => (
                                <div 
                                  key={result.position}
                                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                                >
                                  <div className="flex items-center gap-4">
                                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                      result.position <= 3 ? 'bg-green-100 text-green-800' : 
                                      result.position <= 6 ? 'bg-blue-100 text-blue-800' : 
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {result.position}
                                    </span>
                                    <div>
                                      <p className="font-medium text-gray-900">{result.driver}</p>
                                      <p className="text-sm text-gray-500">{result.team}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 