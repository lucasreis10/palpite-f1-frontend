import { Header } from '@/components/Header';
import { TeamStandingsTable } from '@/components/TeamStandingsTable';

interface TeamMember {
  id: number;
  name: string;
  points: number;
  bestResult: number;
}

interface Team {
  id: number;
  name: string;
  points: number;
  members: [TeamMember, TeamMember];
  lastPosition: number;
  bestResult: number;
}

// Dados mockados para exemplo
const mockTeamStandings: Team[] = [
  {
    id: 1,
    name: 'Red Bull Racing',
    points: 465,
    members: [
      { id: 1, name: 'João Silva', points: 245, bestResult: 1 },
      { id: 2, name: 'Pedro Alves', points: 220, bestResult: 2 }
    ] as [TeamMember, TeamMember],
    lastPosition: 1,
    bestResult: 1,
  },
  {
    id: 2,
    name: 'Ferrari',
    points: 398,
    members: [
      { id: 3, name: 'Maria Santos', points: 220, bestResult: 1 },
      { id: 4, name: 'Carlos Lima', points: 178, bestResult: 3 }
    ] as [TeamMember, TeamMember],
    lastPosition: 2,
    bestResult: 1,
  },
  {
    id: 3,
    name: 'Mercedes',
    points: 385,
    members: [
      { id: 5, name: 'Pedro Oliveira', points: 198, bestResult: 2 },
      { id: 6, name: 'Ana Silva', points: 187, bestResult: 2 }
    ] as [TeamMember, TeamMember],
    lastPosition: 3,
    bestResult: 2,
  },
  {
    id: 4,
    name: 'McLaren',
    points: 332,
    members: [
      { id: 7, name: 'Ana Costa', points: 187, bestResult: 2 },
      { id: 8, name: 'Lucas Santos', points: 145, bestResult: 4 }
    ] as [TeamMember, TeamMember],
    lastPosition: 4,
    bestResult: 2,
  },
  {
    id: 5,
    name: 'Aston Martin',
    points: 290,
    members: [
      { id: 9, name: 'Lucas Ferreira', points: 156, bestResult: 3 },
      { id: 10, name: 'Marina Costa', points: 134, bestResult: 5 }
    ] as [TeamMember, TeamMember],
    lastPosition: 5,
    bestResult: 3,
  },
];

export default function TeamStandingsPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Classificação de Equipes</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe o desempenho das equipes e seus palpiteiros na temporada
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Temporada 2024</h2>
                <p className="text-gray-600">Atualizado após o GP de São Paulo</p>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-100"></span>
                  <span className="text-sm text-gray-600">Top 3</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-100"></span>
                  <span className="text-sm text-gray-600">Top 6</span>
                </div>
              </div>
            </div>

            <TeamStandingsTable standings={mockTeamStandings} />
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Melhor Equipe</h3>
            <p className="text-3xl font-bold text-f1-red">Red Bull Racing</p>
            <p className="text-gray-600">465 pontos na temporada</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Média por Equipe</h3>
            <p className="text-3xl font-bold text-f1-red">374</p>
            <p className="text-gray-600">pontos por equipe</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Dupla Mais Forte</h3>
            <p className="text-3xl font-bold text-f1-red">465 pts</p>
            <p className="text-gray-600">João Silva e Pedro Alves</p>
          </div>
        </div>
      </div>
    </main>
  );
} 