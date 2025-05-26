'use client'

import { useState, useEffect } from 'react';
import { Header } from './../../components/Header';
import { EventResults } from './../../components/EventResults';
import { Toast } from './../../components/Toast';
import { dashboardService, LastResult } from './../../services/dashboard';
import { F1Service } from './../../services/f1';

interface Driver {
  id: number;
  name: string;
  team: string;
  position: number;
}

interface Prediction {
  id: number;
  user: {
    id: number;
    name: string;
    team: string;
  };
  predictions: Driver[];
  points: number;
  accuracy: number;
}

interface EventData {
  eventName: string;
  date: string;
  type: 'qualifying' | 'race';
  officialResults: Driver[];
  predictions: Prediction[];
}

export default function LastEventPage() {
  const [qualifyingData, setQualifyingData] = useState<EventData | null>(null);
  const [raceData, setRaceData] = useState<EventData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  // Função para mostrar toast
  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    });
  };

  // Função para fechar toast
  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Converter dados da API para formato esperado
  const convertApiDataToEventData = (
    lastResult: LastResult,
    type: 'qualifying' | 'race'
  ): EventData => {
    const results = type === 'qualifying' ? lastResult.qualifyingResults : lastResult.raceResults;
    
         const officialResults: Driver[] = results.map((result, index) => ({
       id: index + 1,
       name: result.pilotName,
       team: result.teamName || 'Equipe F1',
       position: result.position
     }));

    // TODO: Buscar palpites reais da API
    const predictions: Prediction[] = [];

    return {
      eventName: lastResult.grandPrixName,
      date: new Date().toLocaleDateString('pt-BR'),
      type,
      officialResults,
      predictions
    };
  };

  useEffect(() => {
    const loadLastEventData = async () => {
      try {
        setIsLoading(true);
        
        // Tentar carregar dados da API primeiro
        const lastResult = await dashboardService.getLastResult();
        
        if (lastResult && lastResult.grandPrixName !== 'Nenhum resultado disponível') {
          const qualifyingEventData = convertApiDataToEventData(lastResult, 'qualifying');
          const raceEventData = convertApiDataToEventData(lastResult, 'race');
          
          setQualifyingData(qualifyingEventData);
          setRaceData(raceEventData);
          
          showToast(`Dados do ${lastResult.grandPrixName} carregados com sucesso! 🏁`, 'success');
        } else {
          // Fallback: tentar buscar dados da API da F1
          try {
            const [qualifyingResults, raceResults] = await Promise.all([
              F1Service.getLatestQualifyingResults(),
              F1Service.getLatestRaceResults()
            ]);

            const qualifyingEventData: EventData = {
              eventName: 'Último Grande Prêmio',
              date: new Date().toLocaleDateString('pt-BR'),
              type: 'qualifying',
              officialResults: qualifyingResults.map((result, index) => ({
                id: index + 1,
                name: result.driver,
                team: result.team,
                position: result.position
              })),
              predictions: [] // Sem palpites da API externa
            };

            const raceEventData: EventData = {
              eventName: 'Último Grande Prêmio',
              date: new Date().toLocaleDateString('pt-BR'),
              type: 'race',
              officialResults: raceResults.map((result, index) => ({
                id: index + 1,
                name: result.driver,
                team: result.team,
                position: result.position
              })),
              predictions: [] // Sem palpites da API externa
            };

            setQualifyingData(qualifyingEventData);
            setRaceData(raceEventData);
            
            showToast('Dados carregados da API da F1! 🏎️', 'info');
          } catch (f1Error) {
            throw new Error('Erro ao carregar dados da F1');
          }
        }

      } catch (error) {
        console.error('Erro ao carregar dados do último evento:', error);
        showToast('Erro ao carregar dados do último evento.', 'error');
        
        // Sem dados disponíveis
        setQualifyingData(null);
        setRaceData(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadLastEventData();
  }, []);

  const handleRefreshData = async () => {
    try {
      showToast('Atualizando dados do último evento...', 'info');
      
      const lastResult = await dashboardService.getLastResult();
      
      if (lastResult && lastResult.grandPrixName !== 'Nenhum resultado disponível') {
        const qualifyingEventData = convertApiDataToEventData(lastResult, 'qualifying');
        const raceEventData = convertApiDataToEventData(lastResult, 'race');
        
        setQualifyingData(qualifyingEventData);
        setRaceData(raceEventData);
        
        showToast('Dados atualizados com sucesso! 🔄', 'success');
      } else {
        showToast('Nenhum resultado disponível no momento.', 'info');
      }
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      showToast('Erro ao atualizar dados. Tente novamente.', 'error');
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Carregando dados do último evento...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const eventName = qualifyingData?.eventName || raceData?.eventName || 'Último Grande Prêmio';
  const bestQualifyingUser = qualifyingData?.predictions[0];
  const bestRaceUser = raceData?.predictions[0];

  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{eventName}</h1>
              <p className="text-gray-600 mt-2">
                Resultados do último fim de semana de corrida
              </p>
            </div>
            <button
              onClick={handleRefreshData}
              className="px-4 py-2 bg-f1-red text-black rounded-md hover:bg-f1-red/90 transition-colors font-bold text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Atualizar
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {qualifyingData && <EventResults {...qualifyingData} />}
          {raceData && <EventResults {...raceData} />}
          
          {!qualifyingData && !raceData && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Nenhum dado de evento disponível</p>
            </div>
          )}
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Melhor Palpiteiro - Classificação</h3>
            <p className="text-3xl font-bold text-f1-red">
              {bestQualifyingUser?.user.name || 'N/A'}
            </p>
            <p className="text-gray-600">
              {bestQualifyingUser 
                ? `${bestQualifyingUser.points} pontos - ${(bestQualifyingUser.accuracy * 100).toFixed(0)}% de acertos`
                : 'Dados não disponíveis'
              }
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Melhor Palpiteiro - Corrida</h3>
            <p className="text-3xl font-bold text-f1-red">
              {bestRaceUser?.user.name || 'N/A'}
            </p>
            <p className="text-gray-600">
              {bestRaceUser 
                ? `${bestRaceUser.points} pontos - ${(bestRaceUser.accuracy * 100).toFixed(0)}% de acertos`
                : 'Dados não disponíveis'
              }
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Total do Fim de Semana</h3>
            <p className="text-3xl font-bold text-f1-red">
              {bestQualifyingUser && bestRaceUser && bestQualifyingUser.user.name === bestRaceUser.user.name
                ? `${bestQualifyingUser.points + bestRaceUser.points} pts`
                : 'N/A'
              }
            </p>
            <p className="text-gray-600">
              {bestQualifyingUser && bestRaceUser && bestQualifyingUser.user.name === bestRaceUser.user.name
                ? `${bestQualifyingUser.user.name} - ${bestQualifyingUser.user.team}`
                : 'Dados não disponíveis'
              }
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 