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
  timestamp: string;
}

export default function LiveTimingPage() {
  const [data, setData] = useState<LiveTimingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 segundos

  const fetchData = async () => {
    try {
      const response = await fetch('/api/live-timing');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar dados');
      }
      const newData = await response.json();
      setData(newData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const formatGap = (gap: number | null) => {
    if (gap === null) return '-';
    if (gap >= 60) {
      const minutes = Math.floor(gap / 60);
      const seconds = (gap % 60).toFixed(3);
      return `+${minutes}:${seconds.padStart(6, '0')}`;
    }
    return `+${gap.toFixed(3)}`;
  };

  const formatInterval = (interval: number | null) => {
    if (interval === null) return 'LEADER';
    return formatGap(interval);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Flag': return 'text-yellow-400';
      case 'SafetyCar': return 'text-orange-400';
      case 'Penalty': return 'text-red-400';
      default: return 'text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Voltar ao início
          </Link>
          
          <h1 className="text-3xl font-bold mb-2">Live Timing F1</h1>
          
          {/* Aviso de funcionalidade experimental */}
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="font-semibold text-yellow-400 mb-1">⚠️ Funcionalidade Experimental</h3>
                <p className="text-sm text-gray-300">
                  Esta funcionalidade busca dados em tempo real da API OpenF1. Os dados têm aproximadamente 3 segundos de delay
                  e podem não estar disponíveis fora dos horários de sessões oficiais.
                </p>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded text-blue-500"
              />
              <span>Atualização automática</span>
            </label>
            
            {autoRefresh && (
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-1"
              >
                <option value={3000}>3 segundos</option>
                <option value={5000}>5 segundos</option>
                <option value={10000}>10 segundos</option>
                <option value={30000}>30 segundos</option>
              </select>
            )}
            
            <button
              onClick={fetchData}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-1 rounded transition-colors"
            >
              Atualizar
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        {loading && !data ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Carregando dados...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/30 border border-red-600 rounded-lg p-6 text-center">
            <p className="text-red-400 font-semibold mb-2">Erro ao carregar dados</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações da Sessão */}
            {data.session && (
              <div className="lg:col-span-3 bg-gray-800 rounded-lg p-4 mb-4">
                <h2 className="text-xl font-bold mb-2">{data.session.session_name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Circuito:</span> {data.session.circuit_short_name}
                  </div>
                  <div>
                    <span className="text-gray-400">País:</span> {data.session.country_name}
                  </div>
                  <div>
                    <span className="text-gray-400">Tipo:</span> {data.session.session_type}
                  </div>
                  <div>
                    <span className="text-gray-400">Última atualização:</span> {formatDate(data.timestamp)}
                  </div>
                </div>
              </div>
            )}

            {/* Classificação */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold mb-4">Classificação</h2>
              <div className="bg-gray-800 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="text-left p-3">Pos</th>
                      <th className="text-left p-3">Piloto</th>
                      <th className="text-left p-3">Equipe</th>
                      <th className="text-right p-3">Gap</th>
                      <th className="text-right p-3">Int</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.standings.map((driver) => (
                      <tr key={driver.driverNumber} className="border-t border-gray-700 hover:bg-gray-700/50 transition-colors">
                        <td className="p-3 font-bold">{driver.position}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                              {driver.driverNumber}
                            </span>
                            <span className="font-semibold">{driver.driverAcronym}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: `#${driver.teamColor}` }}
                            />
                            <span className="text-sm">{driver.teamName}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono text-sm">
                          {formatGap(driver.gapToLeader)}
                        </td>
                        <td className="p-3 text-right font-mono text-sm">
                          {formatInterval(driver.interval)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Controle de Corrida */}
            <div>
              <h2 className="text-xl font-bold mb-4">Controle de Corrida</h2>
              <div className="space-y-2">
                {data.raceControl.length === 0 ? (
                  <div className="bg-gray-800 rounded-lg p-4 text-center text-gray-400">
                    Nenhuma mensagem recente
                  </div>
                ) : (
                  data.raceControl.map((msg, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1">
                        <span className={`text-sm font-semibold ${getCategoryColor(msg.category)}`}>
                          {msg.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(msg.date)}
                        </span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                      {msg.flag && (
                        <span className="inline-block mt-1 text-xs bg-gray-700 px-2 py-1 rounded">
                          {msg.flag}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 