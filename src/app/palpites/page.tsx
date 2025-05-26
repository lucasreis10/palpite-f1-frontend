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
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Faça seu Palpite</h1>
            <p className="text-gray-600 mt-2">
              Envie seu palpite para o próximo Grande Prêmio selecionando os 10 primeiros colocados
            </p>
          </div>

          <BetForm />

          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pontuação</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-100"></span>
                  <span className="text-gray-600">25 pontos por acerto no pódio</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-100"></span>
                  <span className="text-gray-600">18 pontos por acerto nas posições 4-6</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-gray-100"></span>
                  <span className="text-gray-600">10 pontos por acerto nas posições 7-10</span>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ) : nextGrandPrix ? (
              <>
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Prazo Classificação</h3>
                  <p className="text-lg font-bold text-f1-red">
                    {nextGrandPrix.qualifyingDateTime 
                      ? new Date(nextGrandPrix.qualifyingDateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                      : 'N/A'
                    }
                  </p>
                  <p className="text-gray-600">
                    {nextGrandPrix.qualifyingDateTime 
                      ? new Date(nextGrandPrix.qualifyingDateTime).toLocaleDateString('pt-BR')
                      : 'Data não disponível'
                    }
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Próxima Corrida</h3>
                  <p className="text-lg font-bold text-f1-red">{nextGrandPrix.name}</p>
                  <p className="text-gray-600">{nextGrandPrix.circuitName}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {nextGrandPrix.city}, {nextGrandPrix.country}
                  </p>
                  <p className="text-sm text-gray-500">
                    Corrida: {new Date(nextGrandPrix.raceDateTime).toLocaleString('pt-BR')}
                  </p>
                </div>
              </>
            ) : (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm col-span-2">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Nenhuma Corrida Disponível</h3>
                <p className="text-gray-600">
                  Não há nenhum Grande Prêmio futuro disponível para palpites no momento.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
} 