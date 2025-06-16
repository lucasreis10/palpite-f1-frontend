'use client';

import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NextRace {
  id: number;
  name: string;
  location?: string;
  city?: string;
  country: string;
  date?: string; // campo legado
  raceDateTime: string; // campo principal
  round: number;
  circuitName: string;
  qualifyingDateTime?: string;
  practice1DateTime?: string;
  practice2DateTime?: string;
  practice3DateTime?: string;
  sprintDateTime?: string;
  sessions?: {
    practice1?: string;
    practice2?: string;
    practice3?: string;
    qualifying?: string;
    sprintQualifying?: string;
    sprint?: string;
    race: string;
  };
}

interface NextRaceWidgetProps {
  className?: string;
  showSessions?: boolean;
  compact?: boolean;
}

export function NextRaceWidget({ 
  className = '', 
  showSessions = true, 
  compact = false 
}: NextRaceWidgetProps) {
  const [nextRace, setNextRace] = useState<NextRace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNextRace = async () => {
      try {
        const response = await fetch('/api/dashboard/next-races?limit=1');
        if (!response.ok) throw new Error('Erro ao carregar próxima corrida');
        
        const data = await response.json();
        if (data && data.length > 0) {
          setNextRace(data[0]);
        }
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchNextRace();
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchNextRace, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !nextRace) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🏁</div>
          <p className="text-sm">
            {error || 'Nenhuma corrida encontrada'}
          </p>
        </div>
      </div>
    );
  }

  // Verificar se a data é válida - usar raceDateTime como principal, date como fallback
  const dateString = nextRace.raceDateTime || nextRace.date;
  if (!dateString) {
    console.error('Nenhuma data encontrada para a corrida:', nextRace);
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-sm">Data da corrida não disponível</p>
        </div>
      </div>
    );
  }

  const raceDate = new Date(dateString);
  const isValidDate = !isNaN(raceDate.getTime());
  
  if (!isValidDate) {
    console.error('Data inválida recebida:', nextRace.date);
    return (
      <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">⚠️</div>
          <p className="text-sm">Data da corrida inválida</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const isRaceWeekend = raceDate.getTime() - now.getTime() <= 7 * 24 * 60 * 60 * 1000; // 7 dias
  const timeToRace = formatDistanceToNow(raceDate, { locale: ptBR, addSuffix: true });

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      'Brazil': '🇧🇷',
      'Monaco': '🇲🇨',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'United Kingdom': '🇬🇧',
      'Austria': '🇦🇹',
      'France': '🇫🇷',
      'Hungary': '🇭🇺',
      'Belgium': '🇧🇪',
      'Netherlands': '🇳🇱',
      'Singapore': '🇸🇬',
      'Japan': '🇯🇵',
      'Qatar': '🇶🇦',
      'United States': '🇺🇸',
      'Mexico': '🇲🇽',
      'Australia': '🇦🇺',
      'Saudi Arabia': '🇸🇦',
      'Bahrain': '🇧🇭',
      'UAE': '🇦🇪',
      'Canada': '🇨🇦',
      'Azerbaijan': '🇦🇿'
    };
    return flags[country] || '🏁';
  };

  if (compact) {
    return (
      <div className={`bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{getCountryFlag(nextRace.country)}</span>
              <h3 className="font-bold text-sm">{nextRace.name}</h3>
            </div>
            <p className="text-xs text-red-100">
              {format(raceDate, "dd 'de' MMMM", { locale: ptBR })} • {timeToRace}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">R{nextRace.round}</div>
            <div className="text-xs text-red-100">Rodada</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{getCountryFlag(nextRace.country)}</span>
              <div>
                                 <h2 className="text-xl font-bold">{nextRace.name}</h2>
                 <p className="text-red-100 text-sm">{nextRace.city || nextRace.location}, {nextRace.country}</p>
              </div>
            </div>
            <p className="text-red-100 text-sm">{nextRace.circuitName}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">R{nextRace.round}</div>
            <div className="text-sm text-red-100">Rodada</div>
          </div>
        </div>
      </div>

      {/* Race Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              🏁 Corrida Principal
            </h3>
            <p className="text-2xl font-bold text-red-600">
              {format(raceDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {timeToRace}
            </p>
          </div>
          {isRaceWeekend && (
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              🔥 Fim de semana de corrida!
            </div>
          )}
        </div>

        {/* Sessions Schedule */}
        {showSessions && (
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">📅 Cronograma</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Usar campos diretos da interface primeiro, depois fallback para sessions */}
              {(nextRace.practice1DateTime || nextRace.sessions?.practice1) && (
                (() => {
                  const dateTime = nextRace.practice1DateTime || nextRace.sessions?.practice1;
                  return dateTime && !isNaN(new Date(dateTime).getTime()) && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-gray-600">TL1:</span>
                      <span className="font-medium">
                        {format(new Date(dateTime), "dd/MM HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  );
                })()
              )}
              {(nextRace.practice2DateTime || nextRace.sessions?.practice2) && (
                (() => {
                  const dateTime = nextRace.practice2DateTime || nextRace.sessions?.practice2;
                  return dateTime && !isNaN(new Date(dateTime).getTime()) && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-gray-600">TL2:</span>
                      <span className="font-medium">
                        {format(new Date(dateTime), "dd/MM HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  );
                })()
              )}
              {(nextRace.practice3DateTime || nextRace.sessions?.practice3) && (
                (() => {
                  const dateTime = nextRace.practice3DateTime || nextRace.sessions?.practice3;
                  return dateTime && !isNaN(new Date(dateTime).getTime()) && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="text-gray-600">TL3:</span>
                      <span className="font-medium">
                        {format(new Date(dateTime), "dd/MM HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  );
                })()
              )}
              {(nextRace.sprintDateTime || nextRace.sessions?.sprint) && (
                (() => {
                  const dateTime = nextRace.sprintDateTime || nextRace.sessions?.sprint;
                  return dateTime && !isNaN(new Date(dateTime).getTime()) && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                      <span className="text-gray-600">Sprint:</span>
                      <span className="font-medium">
                        {format(new Date(dateTime), "dd/MM HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  );
                })()
              )}
              {(nextRace.qualifyingDateTime || nextRace.sessions?.qualifying) && (
                (() => {
                  const dateTime = nextRace.qualifyingDateTime || nextRace.sessions?.qualifying;
                  return dateTime && !isNaN(new Date(dateTime).getTime()) && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span className="text-gray-600">Classificação:</span>
                      <span className="font-medium">
                        {format(new Date(dateTime), "dd/MM HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  );
                })()
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span className="text-gray-600">Corrida:</span>
                <span className="font-medium">
                  {format(raceDate, "dd/MM HH:mm", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 