'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTimeline, TimelineEvent, TimelineFilters } from '../../hooks/useTimeline';
import { 
  ClockIcon, 
  TrophyIcon, 
  StarIcon,
  FireIcon,
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  BoltIcon,
  HeartIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';



const eventTypeConfig = {
  first_points: { icon: StarIcon, color: 'text-yellow-500', bgColor: 'bg-yellow-50', name: 'Primeiros Pontos' },
  personal_best: { icon: TrophyIcon, color: 'text-green-500', bgColor: 'bg-green-50', name: 'Melhor Pontuação' },
  perfect_weekend: { icon: SparklesIcon, color: 'text-purple-500', bgColor: 'bg-purple-50', name: 'Final de Semana Perfeito' },
  streak_start: { icon: FireIcon, color: 'text-orange-500', bgColor: 'bg-orange-50', name: 'Início de Sequência' },
  streak_milestone: { icon: BoltIcon, color: 'text-red-500', bgColor: 'bg-red-50', name: 'Marco de Sequência' },
  streak_broken: { icon: XCircleIcon, color: 'text-gray-500', bgColor: 'bg-gray-50', name: 'Sequência Quebrada' },
  top_10: { icon: ChartBarIcon, color: 'text-blue-500', bgColor: 'bg-blue-50', name: 'Top 10' },
  top_5: { icon: TrophyIcon, color: 'text-indigo-500', bgColor: 'bg-indigo-50', name: 'Top 5' },
  podium: { icon: TrophyIcon, color: 'text-yellow-600', bgColor: 'bg-yellow-50', name: 'Pódio' },
  first_place: { icon: TrophyIcon, color: 'text-gold-500', bgColor: 'bg-yellow-100', name: '1º Lugar' },
  milestone_race: { icon: CalendarIcon, color: 'text-pink-500', bgColor: 'bg-pink-50', name: 'Corrida Marco' },
  upset_prediction: { icon: BoltIcon, color: 'text-cyan-500', bgColor: 'bg-cyan-50', name: 'Palpite Surpresa' },
  comeback: { icon: HeartIcon, color: 'text-rose-500', bgColor: 'bg-rose-50', name: 'Recuperação' },
  rain_master: { icon: ClockIcon, color: 'text-blue-600', bgColor: 'bg-blue-50', name: 'Mestre da Chuva' },
  qualifying_expert: { icon: CheckCircleIcon, color: 'text-emerald-500', bgColor: 'bg-emerald-50', name: 'Expert em Quali' },
  street_circuit_king: { icon: UserIcon, color: 'text-violet-500', bgColor: 'bg-violet-50', name: 'Rei dos Circuitos Urbanos' }
};

export default function TimelinePage() {
  const { user } = useAuth();
  const { events, loading, error, fetchTimeline } = useTimeline();
  const [filters, setFilters] = useState<TimelineFilters>({
    season: 'all',
    eventType: 'all',
    search: ''
  });

  // Aplicar filtros quando mudarem
  useEffect(() => {
    if (user) {
      fetchTimeline(user.id, filters);
    }
  }, [filters, user]);

  const filteredEvents = events.filter(event => {
    const matchesSeason = filters.season === 'all' || event.season.toString() === filters.season;
    const matchesEventType = filters.eventType === 'all' || event.eventType === filters.eventType;
    const matchesSearch = filters.search === '' || 
      event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      event.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSeason && matchesEventType && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventConfig = (eventType: string) => {
    return eventTypeConfig[eventType as keyof typeof eventTypeConfig] || {
      icon: StarIcon,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      name: eventType
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h1>
          <p className="text-gray-600">Você precisa estar logado para ver sua timeline.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <ClockIcon className="h-8 w-8 text-red-600" />
                Timeline Interativa
              </h1>
              <p className="text-gray-600 mt-1">
                Acompanhe sua jornada e conquistas na temporada
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Bem-vindo de volta,</p>
              <p className="text-lg font-semibold text-gray-900">{user.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro por Temporada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temporada
              </label>
              <select
                value={filters.season}
                onChange={(e) => setFilters(prev => ({ ...prev, season: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Todas as Temporadas</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>

            {/* Filtro por Tipo de Evento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Evento
              </label>
              <select
                value={filters.eventType}
                onChange={(e) => setFilters(prev => ({ ...prev, eventType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Todos os Tipos</option>
                <option value="first_points">Primeiros Pontos</option>
                <option value="personal_best">Melhor Pontuação</option>
                <option value="perfect_weekend">Final de Semana Perfeito</option>
                <option value="streak_start">Início de Sequência</option>
                <option value="top_5">Top 5</option>
                <option value="podium">Pódio</option>
              </select>
            </div>

            {/* Busca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando sua timeline...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-8 text-center">
              <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum evento encontrado</h3>
              <p className="text-gray-600">
                {filters.search || filters.eventType !== 'all' || filters.season !== 'all'
                  ? 'Tente ajustar os filtros para ver mais eventos.'
                  : 'Comece a fazer palpites para ver sua timeline crescer!'}
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {filteredEvents.map((event, eventIdx) => {
                    const config = getEventConfig(event.eventType);
                    const IconComponent = config.icon;
                    
                    return (
                      <li key={event.id}>
                        <div className="relative pb-8">
                          {eventIdx !== filteredEvents.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full ${config.bgColor} flex items-center justify-center ring-8 ring-white`}>
                                <IconComponent className={`h-5 w-5 ${config.color}`} aria-hidden="true" />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h3 className="text-lg font-semibold text-gray-900">
                                        {event.title}
                                      </h3>
                                      {event.pointsGained && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          +{event.pointsGained} pts
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-gray-600 mb-3">
                                      {event.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <CalendarIcon className="h-4 w-4" />
                                        {formatDate(event.createdAt)}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                                        Temporada {event.season}
                                      </span>
                                      {event.grandPrix && (
                                        <span className="flex items-center gap-1">
                                          🏁 {event.grandPrix.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}>
                                      {config.name}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Estatísticas da Timeline */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">
              {events.length}
            </div>
            <div className="text-sm text-gray-600">Total de Eventos</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {events.filter(e => e.pointsGained).reduce((sum, e) => sum + (e.pointsGained || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Pontos Conquistados</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {events.filter(e => e.eventType === 'perfect_weekend').length}
            </div>
            <div className="text-sm text-gray-600">Fins de Semana Perfeitos</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {events.filter(e => e.eventType === 'podium' || e.eventType === 'first_place').length}
            </div>
            <div className="text-sm text-gray-600">Pódios Alcançados</div>
          </div>
        </div>
      </div>
    </div>
  );
}