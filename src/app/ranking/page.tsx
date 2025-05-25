import { Header } from '@/components/Header';
import { StandingsTable } from '@/components/StandingsTable';

// Dados mockados para exemplo
const mockStandings = [
  {
    id: 1,
    name: 'João Silva',
    team: 'Red Bull Racing',
    points: 245,
    lastPosition: 1,
    bestResult: 1,
    totalPredictions: 15,
  },
  {
    id: 2,
    name: 'Maria Santos',
    team: 'Ferrari',
    points: 220,
    lastPosition: 2,
    bestResult: 1,
    totalPredictions: 15,
  },
  {
    id: 3,
    name: 'Pedro Oliveira',
    team: 'Mercedes',
    points: 198,
    lastPosition: 4,
    bestResult: 2,
    totalPredictions: 14,
  },
  {
    id: 4,
    name: 'Ana Costa',
    team: 'McLaren',
    points: 187,
    lastPosition: 3,
    bestResult: 2,
    totalPredictions: 15,
  },
  {
    id: 5,
    name: 'Lucas Ferreira',
    team: 'Aston Martin',
    points: 156,
    lastPosition: 6,
    bestResult: 3,
    totalPredictions: 13,
  },
  {
    id: 6,
    name: 'Carolina Lima',
    team: 'Alpine',
    points: 134,
    lastPosition: 5,
    bestResult: 4,
    totalPredictions: 15,
  },
  {
    id: 7,
    name: 'Rafael Souza',
    team: 'Williams',
    points: 98,
    lastPosition: 8,
    bestResult: 5,
    totalPredictions: 12,
  },
  {
    id: 8,
    name: 'Beatriz Almeida',
    team: 'Haas F1 Team',
    points: 76,
    lastPosition: 10,
    bestResult: 6,
    totalPredictions: 15,
  },
];

export default function RankingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Classificação do Campeonato</h1>
          <p className="text-gray-600 mt-2">
            Acompanhe a pontuação e o desempenho dos palpiteiros ao longo da temporada
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

            <StandingsTable standings={mockStandings} />
          </div>
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Maior Pontuação</h3>
            <p className="text-3xl font-bold text-f1-red">32 pontos</p>
            <p className="text-gray-600">João Silva - GP da Austrália</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Média de Pontos</h3>
            <p className="text-3xl font-bold text-f1-red">18.5</p>
            <p className="text-gray-600">por corrida</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Total de Palpites</h3>
            <p className="text-3xl font-bold text-f1-red">114</p>
            <p className="text-gray-600">em 15 corridas</p>
          </div>
        </div>
      </div>
    </main>
  );
} 