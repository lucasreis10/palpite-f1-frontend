import { Header } from '@/components/Header';
import Link from 'next/link';

// Dados mockados para exemplo
const topDrivers = [
  { id: 1, name: 'João Silva', team: 'Red Bull Racing', points: 245, position: 1, lastPosition: 1 },
  { id: 2, name: 'Maria Santos', team: 'Ferrari', points: 220, position: 2, lastPosition: 2 },
  { id: 3, name: 'Pedro Oliveira', team: 'Mercedes', points: 198, position: 3, lastPosition: 4 },
  { id: 4, name: 'Ana Costa', team: 'McLaren', points: 187, position: 4, lastPosition: 3 },
  { id: 5, name: 'Lucas Ferreira', team: 'Aston Martin', points: 156, position: 5, lastPosition: 6 },
  { id: 6, name: 'Carolina Lima', team: 'Alpine', points: 134, position: 6, lastPosition: 5 },
  { id: 7, name: 'Rafael Souza', team: 'Williams', points: 98, position: 7, lastPosition: 8 },
  { id: 8, name: 'Beatriz Almeida', team: 'Haas F1 Team', points: 76, position: 8, lastPosition: 10 },
  { id: 9, name: 'Gabriel Costa', team: 'RB', points: 65, position: 9, lastPosition: 7 },
  { id: 10, name: 'Isabella Santos', team: 'Kick Sauber', points: 45, position: 10, lastPosition: 9 },
];

const topTeams = [
  { 
    id: 1, 
    name: 'Red Bull Racing', 
    points: 465,
    members: [
      { name: 'João Silva', points: 245 },
      { name: 'Pedro Santos', points: 220 }
    ]
  },
  { 
    id: 2, 
    name: 'Ferrari', 
    points: 418,
    members: [
      { name: 'Maria Santos', points: 220 },
      { name: 'Carlos Oliveira', points: 198 }
    ]
  },
  { 
    id: 3, 
    name: 'Mercedes', 
    points: 385,
    members: [
      { name: 'Pedro Oliveira', points: 198 },
      { name: 'Lucas Alves', points: 187 }
    ]
  },
  { 
    id: 4, 
    name: 'McLaren', 
    points: 343,
    members: [
      { name: 'Ana Costa', points: 187 },
      { name: 'Bruno Silva', points: 156 }
    ]
  },
  { 
    id: 5, 
    name: 'Aston Martin', 
    points: 290,
    members: [
      { name: 'Lucas Ferreira', points: 156 },
      { name: 'Fernando Dias', points: 134 }
    ]
  },
];

const nextRaces = [
  { id: 1, name: 'GP de São Paulo', circuit: 'Autódromo de Interlagos', date: '05/11/2024', time: '14:00' },
  { id: 2, name: 'GP de Las Vegas', circuit: 'Las Vegas Street Circuit', date: '19/11/2024', time: '22:00' },
  { id: 3, name: 'GP de Abu Dhabi', circuit: 'Yas Marina Circuit', date: '03/12/2024', time: '10:00' },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <section className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Bem-vindo ao Bolão F1</h1>
          <p className="text-xl mb-8 text-gray-600">Faça seus palpites e acompanhe o ranking da temporada!</p>
        </section>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Próximas Corridas */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Próximas Corridas</h2>
            <div className="space-y-6">
              {nextRaces.map((race) => (
                <div key={race.id} className="flex items-start justify-between border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div>
                    <h3 className="font-bold text-gray-900">{race.name}</h3>
                    <p className="text-gray-600">{race.circuit}</p>
                    <p className="text-sm text-gray-500">{race.date} - {race.time}</p>
                  </div>
                  {race.id === 1 && (
                    <Link 
                      href="/palpites"
                      className="bg-f1-red text-black py-2 px-4 rounded-md hover:bg-f1-red/90 transition-colors font-bold text-sm"
                    >
                      Fazer Palpite
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Último Resultado */}
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Último Resultado - GP do Bahrein</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Classificação</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">1</span>
                    <span className="text-gray-600">Max Verstappen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">2</span>
                    <span className="text-gray-600">Charles Leclerc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">3</span>
                    <span className="text-gray-600">Lewis Hamilton</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Corrida</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">1</span>
                    <span className="text-gray-600">Max Verstappen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">2</span>
                    <span className="text-gray-600">Sergio Pérez</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-bold text-sm">3</span>
                    <span className="text-gray-600">Carlos Sainz</span>
                  </div>
                </div>
                <Link 
                  href="/ultimo-evento"
                  className="inline-block mt-4 text-f1-red hover:text-f1-red/80 transition-colors font-medium text-sm"
                >
                  Ver resultado completo →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Top 10 Palpiteiros */}
        <section className="mb-12">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Top 10 Palpiteiros</h2>
              <Link 
                href="/ranking"
                className="text-f1-red hover:text-f1-red/80 transition-colors font-medium"
              >
                Ver ranking completo →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {topDrivers.map((driver) => (
                <div 
                  key={driver.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      driver.position <= 3 ? 'bg-green-100 text-green-800' : 
                      driver.position <= 6 ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.position}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{driver.name}</p>
                      <p className="text-sm text-gray-500">{driver.team}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{driver.points} pts</p>
                    <p className="text-sm text-gray-500">
                      {driver.lastPosition === driver.position ? 'Manteve' : 
                       driver.lastPosition > driver.position ? '↑' : '↓'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Top 5 Equipes */}
        <section className="mb-12">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Top 5 Equipes</h2>
              <Link 
                href="/equipes"
                className="text-f1-red hover:text-f1-red/80 transition-colors font-medium"
              >
                Ver todas as equipes →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topTeams.map((team) => (
                <div 
                  key={team.id}
                  className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      team.id <= 3 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {team.id}
                    </span>
                    <h3 className="font-bold text-gray-900">{team.name}</h3>
                  </div>
                  <p className="text-2xl font-bold text-f1-red mb-3">{team.points} pts</p>
                  <div className="space-y-2">
                    {team.members.map((member, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{member.name}</span>
                        <span className="font-medium text-gray-900">{member.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Estatísticas Gerais */}
        <section>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Melhor Pontuação</h3>
              <p className="text-3xl font-bold text-f1-red">32 pontos</p>
              <p className="text-gray-600">João Silva - GP da Austrália</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Total de Palpites</h3>
              <p className="text-3xl font-bold text-f1-red">1.248</p>
              <p className="text-gray-600">em 15 corridas</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Média por Corrida</h3>
              <p className="text-3xl font-bold text-f1-red">83,2</p>
              <p className="text-gray-600">palpites por corrida</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
