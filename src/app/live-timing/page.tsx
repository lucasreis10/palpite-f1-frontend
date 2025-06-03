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
  correctGuesses: number;
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header Mobile-First */}
      <div className="bg-red-600 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-white hover:text-red-200 text-sm sm:text-base">
                ← Voltar
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">
                  🔴 {data?.grandPrixName || 'F1 Live Timing'}
                </h1>
                <p className="text-red-100 text-xs sm:text-sm">
                  {data?.sessionName} • {data?.sessionStatus}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1 rounded-full text-sm ${
                autoRefresh ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              {autoRefresh ? '🟢 AO VIVO' : '⏸️ PAUSADO'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Responsivas */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('timing')}
              className={`flex-1 sm:flex-initial sm:px-6 py-3 text-sm font-medium ${
                activeTab === 'timing'
                  ? 'text-white border-b-2 border-red-500'
                  : 'text-gray-400'
              }`}
            >
              📊 Timing
            </button>
            <button
              onClick={() => setActiveTab('control')}
              className={`flex-1 sm:flex-initial sm:px-6 py-3 text-sm font-medium ${
                activeTab === 'control'
                  ? 'text-white border-b-2 border-red-500'
                  : 'text-gray-400'
              }`}
            >
              🏁 Controle
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 py-4">
        {activeTab === 'timing' ? (
          <TimingSection participants={data?.participants || []} />
        ) : (
          <RaceControl messages={data?.raceControl || []} />
        )}
      </div>
    </div>
  );
}

// Componente Mobile-First para Timing
function TimingSection({ participants }: { participants: LiveTimingData['participants'] }) {
  if (!participants.length) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-4xl mb-4">📊</div>
        <p className="text-gray-400">Aguardando dados de timing...</p>
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
            className={`rounded-lg border p-3 ${
              p.isLeader ? 'bg-yellow-500/10 border-yellow-500' : 'bg-gray-800 border-gray-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  p.isLeader ? 'bg-yellow-500 text-black' : 'bg-gray-700'
                }`}>
                  {p.position}
                </span>
                <div>
                  <p className="font-semibold text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.team}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono text-green-400">{p.gap}</p>
                <p className="text-xs text-gray-400">Gap</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center">
                <p className="font-mono text-blue-400">{p.lastLap}</p>
                <p className="text-gray-500">Última</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-purple-400">{p.bestLap}</p>
                <p className="text-gray-500">Melhor</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Tabela */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full bg-gray-800 rounded-lg">
          <thead className="bg-gray-700">
            <tr className="text-xs font-semibold text-gray-300">
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
              <tr key={p.id} className="border-b border-gray-700 hover:bg-gray-750">
                <td className="p-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    p.isLeader ? 'bg-yellow-500 text-black' : 'bg-gray-600'
                  }`}>
                    {p.position}
                  </span>
                </td>
                <td className="p-3 font-semibold">{p.name}</td>
                <td className="p-3 text-gray-400">{p.team}</td>
                <td className="p-3 text-center font-mono text-green-400">{p.gap}</td>
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
        <div className="text-gray-400 text-4xl mb-4">🏁</div>
        <p className="text-gray-400">Nenhuma mensagem de controle</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg) => (
        <div key={msg.id} className="bg-gray-800 rounded-lg p-4 border-l-4 border-blue-500">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="px-2 py-1 bg-blue-600 text-xs font-bold rounded w-fit">
              {msg.category}
            </span>
            <span className="text-xs text-gray-400 font-mono">{msg.timestamp}</span>
          </div>
          <p className="mt-2 text-sm sm:text-base">{msg.message}</p>
        </div>
      ))}
    </div>
  );
} 