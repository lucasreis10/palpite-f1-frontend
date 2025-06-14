'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DriverStanding {
  position: number;
  driverNumber: number;
  driverName: string;
  driverAcronym: string;
  teamName: string;
  teamColor: string;
  gapToLeader: number | null;
  interval: number | null;
  lastUpdate: string;
}

interface LiveRanking {
  userId: number;
  userName: string;
  userEmail: string;
  currentScore: number;
  totalPossibleScore: number;
  correctGuesses: any[];
  raceGuesses: any[];
  positionDifferences: { [position: number]: number };
}

interface RaceControlMessage {
  date: string;
  category: string;
  message: string;
  flag?: string;
  scope?: string;
  driver_number?: number;
}

interface SessionInfo {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  location: string;
  country_name: string;
  circuit_short_name: string;
}

interface LiveTimingData {
  session: SessionInfo | null;
  standings: DriverStanding[];
  raceControl: RaceControlMessage[];
  liveRanking: LiveRanking[];
  hasGuesses: boolean;
  isMockData?: boolean;
  hasF1Data?: boolean;
  timestamp: string;
  sessionName: string;
  grandPrixName: string;
  sessionStatus: string;
  isActive: boolean;
  participants: Array<{
    id: number;
    name: string;
    position: number;
    gap: string;
    interval: string;
    lastLap: string;
    bestLap: string;
    team: string;
    isLeader: boolean;
  }>;
}

export default function LiveTimingPage() {
  const [data, setData] = useState<LiveTimingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timing' | 'control'>('timing');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/live-timing');
        if (!response.ok) throw new Error('Falha ao carregar dados');
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = autoRefresh ? setInterval(fetchData, 5000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Dados Indisponíveis</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-slate-300 hover:text-white text-sm sm:text-base">
                ← Voltar
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  🔴 {data?.grandPrixName || 'F1 Live Timing'}
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm">
                  {data?.sessionName} • {data?.sessionStatus}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                autoRefresh ? 'bg-green-600 text-white' : 'bg-slate-600 text-slate-300'
              }`}
            >
              {autoRefresh ? '🟢 AO VIVO' : '⏸️ PAUSADO'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('timing')}
              className={`flex-1 sm:flex-initial sm:px-6 py-3 text-sm font-medium ${
                activeTab === 'timing'
                  ? 'text-red-400 border-b-2 border-red-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📊 Timing
            </button>
            <button
              onClick={() => setActiveTab('control')}
              className={`flex-1 sm:flex-initial sm:px-6 py-3 text-sm font-medium ${
                activeTab === 'control'
                  ? 'text-red-400 border-b-2 border-red-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🏁 Controle
            </button>
          </div>
        </div>
      </div>

      {/* Banner Beta */}
      <div className="bg-orange-600 border-b border-orange-500">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="bg-orange-800 text-orange-100 px-2 py-1 rounded text-xs font-bold">
              BETA
            </span>
            <p className="text-orange-100 text-center">
              ⚠️ Funcionalidade experimental - Dados ao vivo disponíveis apenas durante corridas oficiais da F1
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {activeTab === 'timing' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Standings */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                  <h2 className="text-lg font-bold text-white">🏎️ Classificação</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Pos</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Piloto</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-slate-300">Equipe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.standings.map((driver) => (
                        <tr key={driver.driverNumber} className="border-b border-slate-700 hover:bg-slate-700/50">
                          <td className="px-4 py-3 text-sm">{driver.position}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{driver.driverName}</span>
                              <span className="text-slate-400 text-sm">{driver.driverAcronym}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: `#${driver.teamColor}` }}
                              />
                              <span className="text-slate-300">{driver.teamName}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Live Ranking */}
            {data?.hasGuesses && (
              <div className="lg:col-span-1">
                <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 border-b border-slate-700">
                    <h2 className="text-lg font-bold text-white">🏆 Ranking ao Vivo</h2>
                  </div>
                  <div className="p-4">
                    {data?.liveRanking
                      .sort((a, b) => b.currentScore - a.currentScore)
                      .map((ranking, index) => (
                        <div 
                          key={ranking.userId}
                          className="mb-4 last:mb-0 p-4 bg-slate-700/50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-xl font-bold ${
                                index === 0 ? 'text-yellow-400' :
                                index === 1 ? 'text-slate-300' :
                                index === 2 ? 'text-orange-400' :
                                'text-slate-400'
                              }`}>
                                #{index + 1}
                              </span>
                              <span className="font-medium">{ranking.userName}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-slate-300">
                                Pontos: <span className="font-bold text-white">{ranking.currentScore.toFixed(3)}</span>
                              </div>
                              <div className="text-xs text-slate-400">
                                Acertos: <span className="font-medium">{ranking.correctGuesses}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Palpites */}
                          <div className="mt-3 grid grid-cols-5 gap-1">
                            {ranking.raceGuesses.map((guess, pos) => {
                              const currentPosition = data.standings.findIndex(
                                driver => driver.driverAcronym === guess.code
                              ) + 1;
                              const positionDiff = currentPosition > 0 ? currentPosition - (pos + 1) : null;
                              
                              return (
                                <div 
                                  key={pos}
                                  className={`text-center p-1 rounded ${
                                    currentPosition === pos + 1 ? 'bg-green-800' :
                                    Math.abs(positionDiff || 0) <= 3 ? 'bg-blue-800' :
                                    'bg-slate-800'
                                  }`}
                                  title={`${pos + 1}º Lugar: ${guess.familyName}${
                                    positionDiff !== null ? ` (atual: ${currentPosition}º, ${positionDiff > 0 ? '+' : ''}${positionDiff})` : ''
                                  }`}
                                >
                                  <div className="text-xs font-medium">{pos + 1}º</div>
                                  <div className="text-sm">{guess.code}</div>
                                  {positionDiff !== null && (
                                    <div className={`text-xs ${
                                      positionDiff === 0 ? 'text-green-400' :
                                      positionDiff > 0 ? 'text-red-400' :
                                      'text-blue-400'
                                    }`}>
                                      {positionDiff === 0 ? '=' : positionDiff > 0 ? `+${positionDiff}` : positionDiff}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <RaceControl messages={data?.raceControl || []} />
        )}
      </div>

      {/* Session Info */}
      {data?.session && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 py-2">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-400">Sessão:</span>{' '}
                  <span className="font-medium">{data.session.session_name}</span>
                </div>
                <div>
                  <span className="text-slate-400">Local:</span>{' '}
                  <span className="font-medium">{data.session.location}, {data.session.country_name}</span>
                </div>
              </div>
              <div className="text-slate-400">
                Última atualização: {new Date(data.timestamp).toLocaleTimeString('pt-BR')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Mobile-First para Timing
function TimingSection({ participants }: { participants: LiveTimingData['participants'] }) {
  if (!participants.length) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400 text-4xl mb-4">📊</div>
        <p className="text-slate-300">Aguardando dados de timing...</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Cards */}
      <div className="block lg:hidden space-y-2">
        {participants.map((p) => (
          <div
            key={p.id}
            className={`rounded-lg border p-3 bg-slate-800 ${
              p.isLeader ? 'border-yellow-500 ring-1 ring-yellow-500/20' : 'border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  p.isLeader ? 'bg-yellow-500 text-black' : 'bg-slate-600 text-white'
                }`}>
                  {p.position}
                </span>
                <div>
                  <p className="font-semibold text-sm text-white">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.team}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-emerald-400">{p.gap}</p>
                <p className="text-xs text-slate-400">Gap</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <p className="font-mono text-blue-400">{p.lastLap}</p>
                <p className="text-slate-500">Última</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-purple-400">{p.bestLap}</p>
                <p className="text-slate-500">Melhor</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Tabela */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full bg-slate-800 rounded-lg border border-slate-700">
          <thead className="bg-slate-700">
            <tr className="text-xs font-semibold text-slate-300">
              <th className="p-3 text-left">Pos</th>
              <th className="p-3 text-left">Piloto</th>
              <th className="p-3 text-left">Equipe</th>
              <th className="p-3 text-center">Gap</th>
              <th className="p-3 text-center">Última Volta</th>
              <th className="p-3 text-center">Melhor Volta</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((p) => (
              <tr key={p.id} className="border-b border-slate-700 hover:bg-slate-750">
                <td className="p-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    p.isLeader ? 'bg-yellow-500 text-black' : 'bg-slate-600 text-white'
                  }`}>
                    {p.position}
                  </span>
                </td>
                <td className="p-3 font-semibold text-white">{p.name}</td>
                <td className="p-3 text-slate-300">{p.team}</td>
                <td className="p-3 text-center font-mono text-emerald-400">{p.gap}</td>
                <td className="p-3 text-center font-mono text-blue-400">{p.lastLap}</td>
                <td className="p-3 text-center font-mono text-purple-400">{p.bestLap}</td>
              </tr>
            ))}</tbody>
        </table>
      </div>
    </>
  );
}

// Componente para Controle de Corrida
function RaceControl({ messages }: { messages: LiveTimingData['raceControl'] }) {
  if (!messages.length) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-400 text-4xl mb-4">🏁</div>
        <p className="text-slate-300">Nenhuma mensagem de controle</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg, index) => (
        <div key={`${msg.date}-${index}`} className="bg-slate-800 rounded-lg p-4 border-l-4 border-blue-500 border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded w-fit">
              {msg.category}
            </span>
            <span className="text-xs text-slate-400 font-mono">{msg.date}</span>
          </div>
          <p className="mt-2 text-sm sm:text-base text-slate-100">{msg.message}</p>
        </div>
      ))}
    </div>
  );
} 