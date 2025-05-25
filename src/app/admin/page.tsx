'use client'

import { Header } from '@/components/Header';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  TrophyIcon, 
  UsersIcon, 
  FlagIcon, 
  UserGroupIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

const adminMenuItems = [
  {
    title: 'Gerenciar Eventos',
    description: 'Cadastre novos eventos, feche resultados e consolide pontuações',
    icon: TrophyIcon,
    href: '/admin/eventos',
    stats: {
      label: 'Eventos em 2024',
      value: '24',
    }
  },
  {
    title: 'Pilotos',
    description: 'Gerencie a lista de pilotos disponíveis para palpites',
    icon: FlagIcon,
    href: '/admin/pilotos',
    stats: {
      label: 'Pilotos Ativos',
      value: '20',
    }
  },
  {
    title: 'Equipes',
    description: 'Administre as equipes participantes do bolão',
    icon: UserGroupIcon,
    href: '/admin/equipes',
    stats: {
      label: 'Equipes Registradas',
      value: '12',
    }
  },
  {
    title: 'Usuários',
    description: 'Gerencie usuários e suas permissões',
    icon: UsersIcon,
    href: '/admin/usuarios',
    stats: {
      label: 'Usuários Ativos',
      value: '48',
    }
  },
  {
    title: 'Calendário',
    description: 'Configure o calendário da temporada e prazos de palpites',
    icon: CalendarIcon,
    href: '/admin/calendario',
    stats: {
      label: 'Próxima Corrida',
      value: 'GP São Paulo',
    }
  },
];

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administração</h1>
          <p className="text-gray-600 mt-2">
            Gerencie eventos, usuários, equipes e configure o sistema
          </p>
        </div>

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

        {/* Últimas Atividades */}
        <section className="mt-12">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Últimas Atividades</h2>
            <div className="space-y-4">
              {[
                { action: 'Resultado consolidado', event: 'GP do Bahrein - Corrida', time: 'há 2 horas' },
                { action: 'Novo usuário registrado', event: 'Maria Santos', time: 'há 5 horas' },
                { action: 'Equipe atualizada', event: 'Red Bull Racing', time: 'há 1 dia' },
                { action: 'Resultado editado', event: 'GP do Bahrein - Classificação', time: 'há 2 dias' },
              ].map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.event}</p>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
    </ProtectedRoute>
  );
} 