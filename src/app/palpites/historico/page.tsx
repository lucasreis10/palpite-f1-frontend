'use client';

import { useState, useEffect } from 'react';
import { Header } from './../../../components/Header';
import { guessService, Pilot } from './../../../services/guesses';
import { useAuth } from './../../../hooks/useAuth';
import { Tab } from '@headlessui/react';

interface HistoryItem {
  grandPrix: {
    id: number;
    name: string;
    round: number;
    season: number;
    completed: boolean;
  };
  qualifying: {
    pilots: Pilot[];
    score?: number;
  } | null;
  race: {
    pilots: Pilot[];
    score?: number;
  } | null;
}

export default function HistoricoPalpitesPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user, selectedSeason]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await guessService.getUserGuessHistory(user!.id);
      setHistory(data.filter(h => h.grandPrix.season === selectedSeason));
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setError('Não foi possível carregar o histórico de palpites');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreBadgeColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-600';
    if (score >= 200) return 'bg-yellow-100 text-yellow-800';
    if (score >= 150) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

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
            <h1 className="text-3xl font-bold text-gray-900">📊 Histórico de Palpites</h1>
            <p className="text-gray-600 mt-2">
              Veja todos os seus palpites anteriores e pontuações
            </p>
          </div>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-f1-red"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Nenhum palpite encontrado</h2>
            <p className="text-gray-600">
              Você ainda não fez nenhum palpite na temporada {selectedSeason}.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((item) => (
              <div key={item.grandPrix.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header do GP */}
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {item.grandPrix.name}
                      </h2>
                      <p className="text-gray-600">
                        Round {item.grandPrix.round} • Temporada {item.grandPrix.season}
                      </p>
                    </div>
                    {item.grandPrix.completed && (
                      <div className="flex items-center gap-4">
                        {item.qualifying?.score !== undefined && (
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(item.qualifying.score)}`}>
                            Quali: {item.qualifying.score} pts
                          </div>
                        )}
                        {item.race?.score !== undefined && (
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(item.race.score)}`}>
                            Race: {item.race.score} pts
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4">
                  <Tab.Group>
                    <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-4">
                      <Tab className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                        ${selected
                          ? 'bg-white text-f1-red shadow'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }>
                        🏎️ Classificação
                      </Tab>
                      <Tab className={({ selected }) =>
                        `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors
                        ${selected
                          ? 'bg-white text-f1-red shadow'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`
                      }>
                        🏁 Corrida
                      </Tab>
                    </Tab.List>
                    <Tab.Panels>
                      <Tab.Panel>
                        {item.qualifying ? (
                          <div className="space-y-2">
                            {item.qualifying.pilots.map((pilot, index) => (
                              <div 
                                key={pilot.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                  index < 3 ? 'bg-yellow-400 text-yellow-900' : 
                                  index < 6 ? 'bg-blue-100 text-blue-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {index + 1}
                                </span>
                                <div>
                                  <p className="font-medium text-gray-900">{pilot.fullName}</p>
                                  <p className="text-sm text-gray-500">{pilot.constructor?.name || 'Sem Equipe'}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            Nenhum palpite feito para a classificação
                          </div>
                        )}
                      </Tab.Panel>
                      <Tab.Panel>
                        {item.race ? (
                          <div className="space-y-2">
                            {item.race.pilots.map((pilot, index) => (
                              <div 
                                key={pilot.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                  index < 3 ? 'bg-yellow-400 text-yellow-900' : 
                                  index < 6 ? 'bg-blue-100 text-blue-800' : 
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {index + 1}
                                </span>
                                <div>
                                  <p className="font-medium text-gray-900">{pilot.fullName}</p>
                                  <p className="text-sm text-gray-500">{pilot.constructor?.name || 'Sem Equipe'}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            Nenhum palpite feito para a corrida
                          </div>
                        )}
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 