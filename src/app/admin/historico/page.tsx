'use client';

import { useState, useEffect } from 'react';
import { getSeasonRankingSimple, getGrandPrixHistory, type GrandPrixHistoryResponse, type SeasonRankingResponse } from '../../../services/history';
import { eventsService, type GrandPrixEvent } from '../../../services/events';

export default function HistoricoPage() {
  const [activeTab, setActiveTab] = useState('season');
  const [selectedSeason, setSelectedSeason] = useState(2025);
  const [selectedGrandPrix, setSelectedGrandPrix] = useState<number | null>(null);
  const [seasonRanking, setSeasonRanking] = useState<SeasonRankingResponse | null>(null);
  const [grandPrixHistory, setGrandPrixHistory] = useState<GrandPrixHistoryResponse | null>(null);
  const [events, setEvents] = useState<GrandPrixEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar eventos da temporada
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await eventsService.getEventsBySeason(selectedSeason);
        setEvents(eventsData.filter(event => event.completed));
      } catch (err) {
        console.error('Erro ao carregar eventos:', err);
      }
    };
    loadEvents();
  }, [selectedSeason]);

  // Carregar ranking da temporada
  useEffect(() => {
    if (activeTab === 'season') {
      loadSeasonRanking();
    }
  }, [activeTab, selectedSeason]);

  // Carregar histórico do GP
  useEffect(() => {
    if (activeTab === 'grandprix' && selectedGrandPrix) {
      loadGrandPrixHistory();
    }
  }, [activeTab, selectedGrandPrix]);

  const loadSeasonRanking = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSeasonRankingSimple(selectedSeason);
      setSeasonRanking(data);
    } catch (err) {
      setError('Erro ao carregar ranking da temporada');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadGrandPrixHistory = async () => {
    if (!selectedGrandPrix) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getGrandPrixHistory(selectedGrandPrix);
      setGrandPrixHistory(data);
    } catch (err) {
      setError('Erro ao carregar histórico do Grand Prix');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatScore = (score: number) => {
    return score.toFixed(3);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRankingBadgeColor = (position: number) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg'; // Ouro
    if (position === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg'; // Prata
    if (position === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-lg'; // Bronze
    return 'bg-blue-500 text-white';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Histórico e Rankings</h1>
          <p className="text-gray-600 mt-2">Análise completa de desempenho e estatísticas</p>
        </div>
        
        <div className="flex items-center gap-4">
          <select 
            value={selectedSeason.toString()} 
            onChange={(e) => setSelectedSeason(parseInt(e.target.value))}
            className="px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      <div className="w-full">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('season')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'season' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            🏆 Ranking da Temporada
          </button>
          <button
            onClick={() => setActiveTab('grandprix')}
            className={`px-4 py-2 font-medium text-sm border-b-2 ${
              activeTab === 'grandprix' 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            📅 Histórico por GP
          </button>
        </div>

        {activeTab === 'season' && (
          <div className="mt-6 space-y-6">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-red-600">{error}</p>
              </div>
            ) : seasonRanking ? (
              <>
                {/* Estatísticas da Temporada */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 text-xl">👥</span>
                      <div>
                        <p className="text-sm text-gray-600">Participantes</p>
                        <p className="text-2xl font-bold">{seasonRanking.statistics.totalParticipants}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-xl">📅</span>
                      <div>
                        <p className="text-sm text-gray-600">Eventos</p>
                        <p className="text-2xl font-bold">{seasonRanking.statistics.completedEvents}/{seasonRanking.statistics.totalEvents}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-600 text-xl">📈</span>
                      <div>
                        <p className="text-sm text-gray-600">Pontuação Média</p>
                        <p className="text-2xl font-bold">{formatScore(seasonRanking.statistics.averageScore)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600 text-xl">⭐</span>
                      <div>
                        <p className="text-sm text-gray-600">Maior Pontuação</p>
                        <p className="text-2xl font-bold">{formatScore(seasonRanking.statistics.highestEventScore)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ranking da Temporada */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      🏆 Ranking Geral da Temporada {selectedSeason}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Classificação baseada na pontuação total (Qualifying + Race)
                    </p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {seasonRanking.ranking.map((participant) => (
                        <div key={participant.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${getRankingBadgeColor(participant.position)}`}>
                              #{participant.position}
                            </span>
                            <div>
                              <h3 className="font-semibold">{participant.userName}</h3>
                              <p className="text-sm text-gray-600">{participant.userEmail}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <p className="font-semibold text-lg">{formatScore(participant.totalScore)}</p>
                              <p className="text-gray-600">Total</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{formatScore(participant.qualifyingScore)}</p>
                              <p className="text-gray-600">Qualifying</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{formatScore(participant.raceScore)}</p>
                              <p className="text-gray-600">Race</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{participant.eventsParticipated}</p>
                              <p className="text-gray-600">Eventos</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{formatScore(participant.averageScore)}</p>
                              <p className="text-gray-600">Média</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Destaques da Temporada */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        🏅 Melhor Performer
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="text-center">
                        <h3 className="text-xl font-bold">{seasonRanking.statistics.topPerformer}</h3>
                        <p className="text-2xl font-bold text-yellow-600">{formatScore(seasonRanking.statistics.topPerformerScore)} pts</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        🎯 Mais Ativo
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="text-center">
                        <h3 className="text-xl font-bold">{seasonRanking.statistics.mostActiveParticipant}</h3>
                        <p className="text-2xl font-bold text-blue-600">{seasonRanking.statistics.mostActiveParticipantGuesses} palpites</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {activeTab === 'grandprix' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">Selecionar Grand Prix</h2>
                <p className="text-gray-600 mt-1">Escolha um evento para ver o histórico detalhado</p>
              </div>
              <div className="p-6">
                <select 
                  value={selectedGrandPrix?.toString() || ''} 
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedGrandPrix(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um Grand Prix...</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id.toString()}>
                      Round {event.round} - {event.name} ({event.country})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-red-600">{error}</p>
              </div>
            ) : grandPrixHistory ? (
              <>
                {/* Informações do GP */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      📅 {grandPrixHistory.grandPrixName}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Round {grandPrixHistory.round} • {grandPrixHistory.country} • {formatDate(grandPrixHistory.raceDate)}
                    </p>
                  </div>
                </div>

                {/* Estatísticas do Evento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 text-xl">👥</span>
                      <div>
                        <p className="text-sm text-gray-600">Participantes</p>
                        <p className="text-2xl font-bold">{grandPrixHistory.statistics.totalParticipants}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 text-xl">📈</span>
                      <div>
                        <p className="text-sm text-gray-600">Pontuação Média</p>
                        <p className="text-2xl font-bold">{formatScore(grandPrixHistory.statistics.averageCombinedScore)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600 text-xl">⭐</span>
                      <div>
                        <p className="text-sm text-gray-600">Melhor Pontuação</p>
                        <p className="text-2xl font-bold">{formatScore(grandPrixHistory.statistics.highestCombinedScore)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ranking Combinado do GP */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">🏆 Ranking Combinado (Qualifying + Race)</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {grandPrixHistory.combinedRanking.map((participant) => (
                        <div key={participant.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded text-sm font-medium ${getRankingBadgeColor(participant.position)}`}>
                              #{participant.position}
                            </span>
                            <div>
                              <h3 className="font-semibold">{participant.userName}</h3>
                              <div className="flex gap-2 mt-1">
                                {participant.hasQualifyingGuess && <span className="px-2 py-1 bg-gray-200 text-xs rounded">Q</span>}
                                {participant.hasRaceGuess && <span className="px-2 py-1 bg-gray-200 text-xs rounded">R</span>}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <p className="font-semibold text-lg">{formatScore(participant.score)}</p>
                              <p className="text-gray-600">Total</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{formatScore(participant.qualifyingScore)}</p>
                              <p className="text-gray-600">Qualifying</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium">{formatScore(participant.raceScore)}</p>
                              <p className="text-gray-600">Race</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Melhor Performer do GP */}
                {grandPrixHistory.statistics.topPerformerName !== 'Nenhum' && (
                  <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        🥇 Melhor Performer do GP
                      </h3>
                    </div>
                    <div className="p-6">
                      <div className="text-center">
                        <h3 className="text-xl font-bold">{grandPrixHistory.statistics.topPerformerName}</h3>
                        <p className="text-2xl font-bold text-yellow-600">{formatScore(grandPrixHistory.statistics.topPerformerScore)} pts</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : selectedGrandPrix ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-600">Carregando histórico do Grand Prix...</p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
} 