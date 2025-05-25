'use client'

import { useState } from 'react';
import { DriverAutocomplete } from './DriverAutocomplete';
import { Tab } from '@headlessui/react';

interface Driver {
  id: number;
  name: string;
  team: string;
}

interface LastBet {
  qualifying: Driver[];
  race: Driver[];
}

export function BetForm() {
  const [selectedQualifyingDrivers, setSelectedQualifyingDrivers] = useState<(Driver | null)[]>(new Array(10).fill(null));
  const [selectedRaceDrivers, setSelectedRaceDrivers] = useState<(Driver | null)[]>(new Array(10).fill(null));
  
  // Simulando último palpite (isso viria do backend)
  const lastBet: LastBet = {
    qualifying: [
      { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing' },
      { id: 2, name: 'Sergio Pérez', team: 'Red Bull Racing' },
      { id: 5, name: 'Charles Leclerc', team: 'Ferrari' },
      { id: 6, name: 'Carlos Sainz', team: 'Ferrari' },
      { id: 3, name: 'Lewis Hamilton', team: 'Mercedes' },
      { id: 4, name: 'George Russell', team: 'Mercedes' },
      { id: 7, name: 'Lando Norris', team: 'McLaren' },
      { id: 8, name: 'Oscar Piastri', team: 'McLaren' },
      { id: 9, name: 'Fernando Alonso', team: 'Aston Martin' },
      { id: 10, name: 'Lance Stroll', team: 'Aston Martin' },
    ],
    race: [
      { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing' },
      { id: 2, name: 'Sergio Pérez', team: 'Red Bull Racing' },
      { id: 3, name: 'Lewis Hamilton', team: 'Mercedes' },
      { id: 5, name: 'Charles Leclerc', team: 'Ferrari' },
      { id: 6, name: 'Carlos Sainz', team: 'Ferrari' },
      { id: 4, name: 'George Russell', team: 'Mercedes' },
      { id: 7, name: 'Lando Norris', team: 'McLaren' },
      { id: 8, name: 'Oscar Piastri', team: 'McLaren' },
      { id: 9, name: 'Fernando Alonso', team: 'Aston Martin' },
      { id: 10, name: 'Lance Stroll', team: 'Aston Martin' },
    ]
  };
  
  const drivers: Driver[] = [
    { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing' },
    { id: 2, name: 'Sergio Pérez', team: 'Red Bull Racing' },
    { id: 3, name: 'Lewis Hamilton', team: 'Mercedes' },
    { id: 4, name: 'George Russell', team: 'Mercedes' },
    { id: 5, name: 'Charles Leclerc', team: 'Ferrari' },
    { id: 6, name: 'Carlos Sainz', team: 'Ferrari' },
    { id: 7, name: 'Lando Norris', team: 'McLaren' },
    { id: 8, name: 'Oscar Piastri', team: 'McLaren' },
    { id: 9, name: 'Fernando Alonso', team: 'Aston Martin' },
    { id: 10, name: 'Lance Stroll', team: 'Aston Martin' },
    { id: 11, name: 'Pierre Gasly', team: 'Alpine' },
    { id: 12, name: 'Esteban Ocon', team: 'Alpine' },
    { id: 13, name: 'Alexander Albon', team: 'Williams' },
    { id: 14, name: 'Logan Sargeant', team: 'Williams' },
    { id: 15, name: 'Valtteri Bottas', team: 'Kick Sauber' },
    { id: 16, name: 'Zhou Guanyu', team: 'Kick Sauber' },
    { id: 17, name: 'Daniel Ricciardo', team: 'RB' },
    { id: 18, name: 'Yuki Tsunoda', team: 'RB' },
    { id: 19, name: 'Kevin Magnussen', team: 'Haas F1 Team' },
    { id: 20, name: 'Nico Hulkenberg', team: 'Haas F1 Team' },
  ];

  const handleQualifyingDriverSelect = (driver: Driver, position: number) => {
    setSelectedQualifyingDrivers(prev => {
      const newSelection = [...prev];
      newSelection[position - 1] = driver;
      return newSelection;
    });
  };

  const handleRaceDriverSelect = (driver: Driver, position: number) => {
    setSelectedRaceDrivers(prev => {
      const newSelection = [...prev];
      newSelection[position - 1] = driver;
      return newSelection;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQualifyingDrivers.some(driver => driver === null)) {
      alert('Por favor, selecione todos os pilotos para a classificação');
      return;
    }
    if (selectedRaceDrivers.some(driver => driver === null)) {
      alert('Por favor, selecione todos os pilotos para a corrida');
      return;
    }
    console.log('Palpites enviados:', {
      qualifying: selectedQualifyingDrivers,
      race: selectedRaceDrivers
    });
  };

  const handleClear = () => {
    setSelectedQualifyingDrivers(new Array(10).fill(null));
    setSelectedRaceDrivers(new Array(10).fill(null));
  };

  const handleRepeatLastBet = () => {
    setSelectedQualifyingDrivers(lastBet.qualifying);
    setSelectedRaceDrivers(lastBet.race);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full max-w-full">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">GP de São Paulo</h2>
            <p className="text-gray-600 text-sm sm:text-base">Envie seu palpite até 02/03/2024 às 16:00</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-100"></span>
              <span className="text-sm text-gray-600">Pódio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-100"></span>
              <span className="text-sm text-gray-600">Pontos</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tab.Group>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                  ${selected
                    ? 'bg-white text-f1-red shadow'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                Classificação
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                  ${selected
                    ? 'bg-white text-f1-red shadow'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                Corrida
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-6">
              <Tab.Panel>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Seleção de Pilotos - Classificação */}
                  <div className="order-2 lg:order-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Selecione os Pilotos - Classificação</h3>
                    <div className="space-y-3">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((position) => (
                        <DriverAutocomplete
                          key={position}
                          drivers={drivers.filter(d => !selectedQualifyingDrivers.includes(d) || selectedQualifyingDrivers[position - 1]?.id === d.id)}
                          selectedDriver={selectedQualifyingDrivers[position - 1]}
                          onSelect={(driver) => handleQualifyingDriverSelect(driver, position)}
                          position={position}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview do Palpite - Classificação */}
                  <div className="order-1 lg:order-2 sticky top-0 lg:top-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Seu Palpite - Classificação</h3>
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                      {selectedQualifyingDrivers.map((driver, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0"
                        >
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index < 3 ? 'bg-green-100 text-green-800' : 
                            index < 6 ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {index + 1}
                          </span>
                          {driver ? (
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">{driver.name}</p>
                              <p className="text-sm text-gray-500 truncate">{driver.team}</p>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">Selecione um piloto</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Seleção de Pilotos - Corrida */}
                  <div className="order-2 lg:order-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Selecione os Pilotos - Corrida</h3>
                    <div className="space-y-3">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((position) => (
                        <DriverAutocomplete
                          key={position}
                          drivers={drivers.filter(d => !selectedRaceDrivers.includes(d) || selectedRaceDrivers[position - 1]?.id === d.id)}
                          selectedDriver={selectedRaceDrivers[position - 1]}
                          onSelect={(driver) => handleRaceDriverSelect(driver, position)}
                          position={position}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Preview do Palpite - Corrida */}
                  <div className="order-1 lg:order-2 sticky top-0 lg:top-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Seu Palpite - Corrida</h3>
                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                      {selectedRaceDrivers.map((driver, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0"
                        >
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index < 3 ? 'bg-green-100 text-green-800' : 
                            index < 6 ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {index + 1}
                          </span>
                          {driver ? (
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate">{driver.name}</p>
                              <p className="text-sm text-gray-500 truncate">{driver.team}</p>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">Selecione um piloto</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleRepeatLastBet}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Repetir Último Palpite
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Limpar
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 bg-f1-red text-black rounded-md hover:bg-f1-red/90 transition-colors font-bold text-sm"
            >
              Enviar Palpites
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 