'use client'

import { useState, useEffect } from 'react';
import { Header } from './../../components/Header';
import Link from 'next/link';
import ProtectedRoute from './../../components/ProtectedRoute';
import { Toast } from './../../components/Toast';
import { AdminStatsCard } from './../../components/AdminStatsCard';
import { adminService, AdminStats, RecentActivity } from './../../services/admin';
import { 
  TrophyIcon, 
  UsersIcon, 
  FlagIcon, 
  UserGroupIcon,
  CalendarIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Carregar dados iniciais
  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsData, activitiesData] = await Promise.all([
        adminService.getAdminStats(),
        adminService.getRecentActivities()
      ]);
      
      setStats(statsData);
      setActivities(activitiesData);
      
      if (!isRefreshing) {
        showToast('Dados administrativos carregados com sucesso! 📊', 'success');
      }
    } catch (error) {
      console.error('Erro ao carregar dados administrativos:', error);
      showToast('Erro ao carregar dados. Usando informações de fallback.', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    showToast('Atualizando dados...', 'info');
    await loadAdminData();
    showToast('Dados atualizados com sucesso! 🔄', 'success');
  };

  // Criar itens do menu com dados dinâmicos
  const getAdminMenuItems = () => {
    if (!stats) return [];

    return [
      {
        title: 'Gerenciar Eventos',
        description: 'Cadastre novos eventos, feche resultados e consolide pontuações',
        icon: TrophyIcon,
        href: '/admin/eventos',
        stats: {
          label: 'Eventos em 2024',
          value: stats.totalEvents.toString(),
        }
      },
      {
        title: 'Pilotos',
        description: 'Gerencie a lista de pilotos disponíveis para palpites',
        icon: FlagIcon,
        href: '/admin/pilotos',
        stats: {
          label: 'Pilotos Ativos',
          value: stats.activePilots.toString(),
        }
      },
      {
        title: 'Equipes',
        description: 'Administre as equipes participantes do bolão',
        icon: UserGroupIcon,
        href: '/admin/equipes',
        stats: {
          label: 'Equipes Registradas',
          value: stats.activeTeams.toString(),
        }
      },
      {
        title: 'Construtores F1',
        description: 'Gerencie os construtores/escuderias da Fórmula 1',
        icon: BuildingOfficeIcon,
        href: '/admin/construtores',
        stats: {
          label: 'Construtores Ativos',
          value: '10',
        }
      },
      {
        title: 'Usuários',
        description: 'Gerencie usuários e suas permissões',
        icon: UsersIcon,
        href: '/admin/usuarios',
        stats: {
          label: 'Usuários Ativos',
          value: stats.activeUsers.toString(),
        }
      },
      {
        title: 'Calendário',
        description: 'Configure o calendário da temporada e prazos de palpites',
        icon: CalendarIcon,
        href: '/admin/calendario',
        stats: {
          label: 'Próxima Corrida',
          value: stats.nextRace,
        }
      },
      {
        title: 'Histórico e Rankings',
        description: 'Visualize rankings da temporada e histórico detalhado por GP',
        icon: ChartBarIcon,
        href: '/admin/historico',
        stats: {
          label: 'Temporada Atual',
          value: '2025',
        }
      },
    ];
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'result':
        return '🏁';
      case 'user':
        return '👤';
      case 'team':
        return '👥';
      case 'event':
        return '📅';
      default:
        return '📝';
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireAdmin={true}>
        <main className="min-h-screen bg-white">
          <Header />
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  const adminMenuItems = getAdminMenuItems();

  return (
    <ProtectedRoute requireAdmin={true}>
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
                <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
                <p className="text-gray-600 mt-2">
                  Gerencie eventos, usuários, equipes e configure o sistema
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-f1-red text-black rounded-md hover:bg-f1-red/90 transition-colors font-bold text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Atualizando...' : 'Atualizar Dados'}
              </button>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <AdminStatsCard
                title="Total de Eventos"
                value={stats.totalEvents}
                subtitle={`${stats.completedEvents} concluídos, ${stats.pendingEvents} pendentes`}
                icon={<TrophyIcon className="w-6 h-6 text-gray-700" />}
              />
              <AdminStatsCard
                title="Pilotos Ativos"
                value={stats.activePilots}
                subtitle={`de ${stats.totalPilots} total cadastrados`}
                icon={<FlagIcon className="w-6 h-6 text-gray-700" />}
              />
              <AdminStatsCard
                title="Equipes Ativas"
                value={stats.activeTeams}
                subtitle={`de ${stats.totalTeams} total cadastradas`}
                icon={<UserGroupIcon className="w-6 h-6 text-gray-700" />}
              />
              <AdminStatsCard
                title="Usuários Ativos"
                value={stats.activeUsers}
                subtitle={`de ${stats.totalUsers} total registrados`}
                icon={<UsersIcon className="w-6 h-6 text-gray-700" />}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="block group"
                >
                  <div className="border border-gray-200 rounded-lg p-6 hover:border-f1-red transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                        <Icon className="w-6 h-6 text-gray-700" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">{item.title}</h2>
                        <p className="text-gray-600 mb-3">{item.description}</p>
                        <div className="text-sm">
                          <span className="text-gray-500">{item.stats.label}: </span>
                          <span className="font-medium text-gray-900">{item.stats.value}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Próxima Corrida e Estatísticas Adicionais */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Próxima Corrida</h2>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-f1-red/10">
                      <CalendarIcon className="w-8 h-8 text-f1-red" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{stats.nextRace}</h3>
                      <p className="text-gray-600">Próximo evento do calendário</p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-sm text-gray-500">
                          Palpites: <span className="font-medium text-gray-900">Abertos</span>
                        </span>
                        <span className="text-sm text-gray-500">
                          Prazo: <span className="font-medium text-gray-900">48h restantes</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <AdminStatsCard
                  title="Taxa de Participação"
                  value="87%"
                  subtitle="dos usuários ativos"
                  className="h-fit"
                />
                <AdminStatsCard
                  title="Palpites Hoje"
                  value="23"
                  subtitle="novos palpites"
                  className="h-fit"
                />
              </div>
            </div>
          )}

          {/* Últimas Atividades */}
          <section className="mt-12">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Últimas Atividades</h2>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <div 
                      key={activity.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{getActivityIcon(activity.type)}</span>
                        <div>
                          <p className="font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-500">{activity.event}</p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{activity.time}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma atividade recente encontrada</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </ProtectedRoute>
  );
} 