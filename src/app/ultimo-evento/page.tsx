'use client'

import { useState, useEffect } from 'react';
import { Header } from './../../components/Header';
import { EventResults } from './../../components/EventResults';
import { Toast } from './../../components/Toast';
import { dashboardService, LastResult, ParticipantGuess } from './../../services/dashboard';
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
  const [currentGrandPrixName, setCurrentGrandPrixName] = useState<string | null>(null);
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
    const guesses = type === 'qualifying' ? lastResult.qualifyingGuesses : lastResult.raceGuesses;
    
    const officialResults: Driver[] = results.map((result, index) => ({
      id: index + 1,
      name: result.pilotName,
      team: result.teamName || 'Equipe F1',
      position: result.position
    }));

    // Converter palpites reais da API para formato esperado
    const predictions: Prediction[] = guesses.map((guess) => ({
      id: guess.userId,
      user: {
        id: guess.userId,
        name: guess.userName,
        team: guess.teamName // Usando o nome real da equipe
      },
      predictions: [], // Array vazio - não exibimos detalhes dos palpites, apenas ranking
      points: Math.round(guess.score * 100) / 100, // arredondar para 2 casas decimais
      accuracy: 0 // Não calculamos acurácia neste contexto
    }));

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
        
        console.log('🔍 Dados recebidos da API:', lastResult);
        
        if (lastResult && lastResult.grandPrixName && lastResult.grandPrixName !== 'Nenhum resultado disponível') {
          console.log('✅ Grand Prix encontrado:', lastResult.grandPrixName);
          console.log('📊 Qualifying results:', lastResult.qualifyingResults.length);
          console.log('🏁 Race results:', lastResult.raceResults.length);
          
          // Verificar se há resultados disponíveis
          const hasQualifyingResults = lastResult.qualifyingResults.length > 0;
          const hasRaceResults = lastResult.raceResults.length > 0;
          
          if (hasQualifyingResults || hasRaceResults) {
            console.log('✅ Resultados encontrados, criando EventData');
            const qualifyingEventData = convertApiDataToEventData(lastResult, 'qualifying');
            const raceEventData = convertApiDataToEventData(lastResult, 'race');
            
            setQualifyingData(qualifyingEventData);
            setRaceData(raceEventData);
            setCurrentGrandPrixName(lastResult.grandPrixName);
            
            showToast(`Dados do ${lastResult.grandPrixName} carregados com sucesso! 🏁`, 'success');
          } else {
            console.log('ℹ️ Grand Prix encontrado mas sem resultados');
            // Grand Prix encontrado mas sem resultados ainda
            setCurrentGrandPrixName(lastResult.grandPrixName);
            setQualifyingData(null);
            setRaceData(null);
            showToast(`${lastResult.grandPrixName} encontrado, mas os resultados ainda não estão disponíveis.`, 'info');
          }
        } else {
          console.log('❌ Nenhum Grand Prix válido encontrado, tentando API F1');
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
            console.log('❌ Erro ao carregar dados da F1:', f1Error);
            setCurrentGrandPrixName(null);
            setQualifyingData(null);
            setRaceData(null);
            showToast('Nenhum dado de evento disponível no momento.', 'info');
          }
        }

      } catch (error) {
        console.error('Erro ao carregar dados do último evento:', error);
        showToast('Erro ao carregar dados do último evento.', 'error');
        
        // Sem dados disponíveis
        setCurrentGrandPrixName(null);
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
      
      console.log('🔄 Refresh - Dados recebidos:', lastResult);
      
      if (lastResult && lastResult.grandPrixName && lastResult.grandPrixName !== 'Nenhum resultado disponível') {
        console.log('✅ Refresh - Grand Prix encontrado:', lastResult.grandPrixName);
        
        // Verificar se há resultados disponíveis
        const hasQualifyingResults = lastResult.qualifyingResults.length > 0;
        const hasRaceResults = lastResult.raceResults.length > 0;
        
        if (hasQualifyingResults || hasRaceResults) {
          const qualifyingEventData = convertApiDataToEventData(lastResult, 'qualifying');
          const raceEventData = convertApiDataToEventData(lastResult, 'race');
          
          setQualifyingData(qualifyingEventData);
          setRaceData(raceEventData);
          setCurrentGrandPrixName(lastResult.grandPrixName);
          
          showToast('Dados atualizados com sucesso! 🔄', 'success');
        } else {
          // Grand Prix encontrado mas sem resultados
          setCurrentGrandPrixName(lastResult.grandPrixName);
          setQualifyingData(null);
          setRaceData(null);
          showToast(`${lastResult.grandPrixName} encontrado, mas os resultados ainda não estão disponíveis.`, 'info');
        }
      } else {
        setCurrentGrandPrixName(null);
        setQualifyingData(null);
        setRaceData(null);
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </main>
    );
  }

  const eventName = currentGrandPrixName || qualifyingData?.eventName || raceData?.eventName || 'Último Grande Prêmio';
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
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aguardando Resultados</h3>
              <p className="text-gray-600 mb-4">
                Os resultados do último Grande Prêmio ainda não estão disponíveis.
              </p>
              <p className="text-sm text-gray-500">
                Os dados serão exibidos assim que a classificação e corrida forem concluídas.
              </p>
              <button
                onClick={handleRefreshData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                Verificar Novamente
              </button>
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
                ? `${bestQualifyingUser.points} pontos`
                : 'Dados não disponíveis'
              }
            </p>
            {bestQualifyingUser && (
              <p className="text-sm text-gray-500 mt-1">{bestQualifyingUser.user.team}</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Melhor Palpiteiro - Corrida</h3>
            <p className="text-3xl font-bold text-f1-red">
              {bestRaceUser?.user.name || 'N/A'}
            </p>
            <p className="text-gray-600">
              {bestRaceUser 
                ? `${bestRaceUser.points} pontos`
                : 'Dados não disponíveis'
              }
            </p>
            {bestRaceUser && (
              <p className="text-sm text-gray-500 mt-1">{bestRaceUser.user.team}</p>
            )}
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
                ? bestQualifyingUser.user.name
                : 'Dados não disponíveis'
              }
            </p>
            {bestQualifyingUser && bestRaceUser && bestQualifyingUser.user.name === bestRaceUser.user.name && (
              <p className="text-sm text-gray-500 mt-1">{bestQualifyingUser.user.team}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 