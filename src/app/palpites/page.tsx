'use client';

import { useState, useEffect } from 'react';
import { Header } from './../../components/Header';
import { BetForm } from './../../components/BetForm';
import ProtectedRoute from './../../components/ProtectedRoute';
import { guessService, NextGrandPrix } from './../../services/guesses';

export default function PalpitesPage() {
  const [nextGrandPrix, setNextGrandPrix] = useState<NextGrandPrix | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNextGrandPrix = async () => {
      try {
        const gpData = await guessService.getNextGrandPrix();
        setNextGrandPrix(gpData);
      } catch (error) {
        console.error('Erro ao carregar próximo GP:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNextGrandPrix();
  }, []);

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
              🏁 Faça seu Palpite
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Selecione os 10 primeiros colocados para o próximo GP
            </p>
          </div>

          <div className="mb-6">
            <BetForm />
          </div>

          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                🏆 Sistema de Pontuação
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-yellow-400 flex-shrink-0"></span>
                  <span className="text-sm text-gray-600">25 pts - Pódio (1º, 2º, 3º)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-blue-400 flex-shrink-0"></span>
                  <span className="text-sm text-gray-600">18 pts - Posições 4º-6º</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-gray-400 flex-shrink-0"></span>
                  <span className="text-sm text-gray-600">10 pts - Posições 7º-10º</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : nextGrandPrix ? (
              <>
                <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    🏎️ Próxima Corrida
                  </h3>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-f1-red truncate">{nextGrandPrix.name}</p>
                    <p className="text-gray-600 text-sm truncate">{nextGrandPrix.circuitName}</p>
                    <p className="text-gray-500 text-xs">
                      {nextGrandPrix.city}, {nextGrandPrix.country}
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      🏁 {new Date(nextGrandPrix.raceDateTime).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    ⏰ Prazos
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Classificação</p>
                      <p className="text-sm text-f1-red font-mono">
                        {nextGrandPrix.qualifyingDateTime 
                          ? new Date(nextGrandPrix.qualifyingDateTime).toLocaleString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Corrida</p>
                      <p className="text-sm text-f1-red font-mono">
                        {new Date(nextGrandPrix.raceDateTime).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-2">❌ Nenhuma Corrida Disponível</h3>
                <p className="text-gray-600 text-sm">
                  Não há nenhum Grande Prêmio futuro disponível para palpites no momento.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 block sm:hidden">
            <h4 className="text-sm font-bold text-blue-900 mb-2">💡 Dicas Mobile</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use as abas para alternar entre Classificação e Corrida</li>
              <li>• Toque no campo para buscar pilotos</li>
              <li>• Use "Copiar da Classificação" para agilizar</li>
              <li>• Seus palpites são salvos automaticamente</li>
            </ul>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
} 