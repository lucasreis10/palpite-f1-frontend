import { Header } from '@/components/Header';
import { EventResults } from '@/components/EventResults';

// Dados mockados para exemplo
const mockQualifyingResults = {
  eventName: 'GP de São Paulo',
  date: '02/03/2024',
  type: 'qualifying' as const,
  officialResults: [
    { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 1 },
    { id: 2, name: 'Charles Leclerc', team: 'Ferrari', position: 2 },
    { id: 3, name: 'Lewis Hamilton', team: 'Mercedes', position: 3 },
    { id: 4, name: 'Lando Norris', team: 'McLaren', position: 4 },
    { id: 5, name: 'Carlos Sainz', team: 'Ferrari', position: 5 },
    { id: 6, name: 'Sergio Perez', team: 'Red Bull Racing', position: 6 },
    { id: 7, name: 'Oscar Piastri', team: 'McLaren', position: 7 },
    { id: 8, name: 'George Russell', team: 'Mercedes', position: 8 },
    { id: 9, name: 'Fernando Alonso', team: 'Aston Martin', position: 9 },
    { id: 10, name: 'Lance Stroll', team: 'Aston Martin', position: 10 },
  ],
  predictions: [
    {
      id: 1,
      user: { id: 1, name: 'João Silva', team: 'Red Bull Racing' },
      predictions: [
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 1 },
        { id: 2, name: 'Charles Leclerc', team: 'Ferrari', position: 2 },
        { id: 3, name: 'Lewis Hamilton', team: 'Mercedes', position: 3 },
      ],
      points: 30,
      accuracy: 0.8,
    },
    {
      id: 2,
      user: { id: 2, name: 'Maria Santos', team: 'Ferrari' },
      predictions: [
        { id: 2, name: 'Charles Leclerc', team: 'Ferrari', position: 1 },
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 2 },
        { id: 3, name: 'Lewis Hamilton', team: 'Mercedes', position: 3 },
      ],
      points: 25,
      accuracy: 0.7,
    },
    {
      id: 3,
      user: { id: 3, name: 'Pedro Oliveira', team: 'Mercedes' },
      predictions: [
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 1 },
        { id: 3, name: 'Lewis Hamilton', team: 'Mercedes', position: 2 },
        { id: 2, name: 'Charles Leclerc', team: 'Ferrari', position: 3 },
      ],
      points: 22,
      accuracy: 0.6,
    },
    {
      id: 4,
      user: { id: 4, name: 'Ana Costa', team: 'McLaren' },
      predictions: [
        { id: 3, name: 'Lewis Hamilton', team: 'Mercedes', position: 1 },
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 2 },
        { id: 2, name: 'Charles Leclerc', team: 'Ferrari', position: 3 },
      ],
      points: 20,
      accuracy: 0.5,
    },
    {
      id: 5,
      user: { id: 5, name: 'Lucas Ferreira', team: 'Aston Martin' },
      predictions: [
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 1 },
        { id: 4, name: 'Lando Norris', team: 'McLaren', position: 2 },
        { id: 2, name: 'Charles Leclerc', team: 'Ferrari', position: 3 },
      ],
      points: 18,
      accuracy: 0.4,
    },
    {
      id: 6,
      user: { id: 6, name: 'Carolina Lima', team: 'Alpine' },
      predictions: [
        { id: 2, name: 'Charles Leclerc', team: 'Ferrari', position: 1 },
        { id: 3, name: 'Lewis Hamilton', team: 'Mercedes', position: 2 },
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 3 },
      ],
      points: 15,
      accuracy: 0.3,
    },
    {
      id: 7,
      user: { id: 7, name: 'Rafael Souza', team: 'Williams' },
      predictions: [
        { id: 4, name: 'Lando Norris', team: 'McLaren', position: 1 },
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 2 },
        { id: 2, name: 'Charles Leclerc', team: 'Ferrari', position: 3 },
      ],
      points: 12,
      accuracy: 0.2,
    },
    {
      id: 8,
      user: { id: 8, name: 'Beatriz Almeida', team: 'Haas F1 Team' },
      predictions: [
        { id: 3, name: 'Lewis Hamilton', team: 'Mercedes', position: 1 },
        { id: 2, name: 'Charles Leclerc', team: 'Ferrari', position: 2 },
        { id: 4, name: 'Lando Norris', team: 'McLaren', position: 3 },
      ],
      points: 10,
      accuracy: 0.1,
    },
  ],
};

const mockRaceResults = {
  eventName: 'GP de São Paulo',
  date: '03/03/2024',
  type: 'race' as const,
  officialResults: [
    { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 1 },
    { id: 2, name: 'Sergio Perez', team: 'Red Bull Racing', position: 2 },
    { id: 3, name: 'Charles Leclerc', team: 'Ferrari', position: 3 },
    { id: 4, name: 'Lewis Hamilton', team: 'Mercedes', position: 4 },
    { id: 5, name: 'Lando Norris', team: 'McLaren', position: 5 },
    { id: 6, name: 'Carlos Sainz', team: 'Ferrari', position: 6 },
    { id: 7, name: 'George Russell', team: 'Mercedes', position: 7 },
    { id: 8, name: 'Oscar Piastri', team: 'McLaren', position: 8 },
    { id: 9, name: 'Fernando Alonso', team: 'Aston Martin', position: 9 },
    { id: 10, name: 'Lance Stroll', team: 'Aston Martin', position: 10 },
  ],
  predictions: [
    {
      id: 1,
      user: { id: 1, name: 'João Silva', team: 'Red Bull Racing' },
      predictions: [
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 1 },
        { id: 2, name: 'Sergio Perez', team: 'Red Bull Racing', position: 2 },
        { id: 3, name: 'Charles Leclerc', team: 'Ferrari', position: 3 },
      ],
      points: 50,
      accuracy: 1.0,
    },
    {
      id: 2,
      user: { id: 2, name: 'Maria Santos', team: 'Ferrari' },
      predictions: [
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 1 },
        { id: 3, name: 'Charles Leclerc', team: 'Ferrari', position: 2 },
        { id: 2, name: 'Sergio Perez', team: 'Red Bull Racing', position: 3 },
      ],
      points: 35,
      accuracy: 0.8,
    },
    {
      id: 3,
      user: { id: 3, name: 'Pedro Oliveira', team: 'Mercedes' },
      predictions: [
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 1 },
        { id: 2, name: 'Sergio Perez', team: 'Red Bull Racing', position: 2 },
        { id: 4, name: 'Lewis Hamilton', team: 'Mercedes', position: 3 },
      ],
      points: 30,
      accuracy: 0.7,
    },
    {
      id: 4,
      user: { id: 4, name: 'Ana Costa', team: 'McLaren' },
      predictions: [
        { id: 2, name: 'Sergio Perez', team: 'Red Bull Racing', position: 1 },
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 2 },
        { id: 3, name: 'Charles Leclerc', team: 'Ferrari', position: 3 },
      ],
      points: 25,
      accuracy: 0.6,
    },
    {
      id: 5,
      user: { id: 5, name: 'Lucas Ferreira', team: 'Aston Martin' },
      predictions: [
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 1 },
        { id: 4, name: 'Lewis Hamilton', team: 'Mercedes', position: 2 },
        { id: 2, name: 'Sergio Perez', team: 'Red Bull Racing', position: 3 },
      ],
      points: 20,
      accuracy: 0.5,
    },
    {
      id: 6,
      user: { id: 6, name: 'Carolina Lima', team: 'Alpine' },
      predictions: [
        { id: 3, name: 'Charles Leclerc', team: 'Ferrari', position: 1 },
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 2 },
        { id: 2, name: 'Sergio Perez', team: 'Red Bull Racing', position: 3 },
      ],
      points: 18,
      accuracy: 0.4,
    },
    {
      id: 7,
      user: { id: 7, name: 'Rafael Souza', team: 'Williams' },
      predictions: [
        { id: 4, name: 'Lewis Hamilton', team: 'Mercedes', position: 1 },
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 2 },
        { id: 2, name: 'Sergio Perez', team: 'Red Bull Racing', position: 3 },
      ],
      points: 15,
      accuracy: 0.3,
    },
    {
      id: 8,
      user: { id: 8, name: 'Beatriz Almeida', team: 'Haas F1 Team' },
      predictions: [
        { id: 2, name: 'Sergio Perez', team: 'Red Bull Racing', position: 1 },
        { id: 3, name: 'Charles Leclerc', team: 'Ferrari', position: 2 },
        { id: 1, name: 'Max Verstappen', team: 'Red Bull Racing', position: 3 },
      ],
      points: 12,
      accuracy: 0.2,
    },
  ],
};

export default function LastEventPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GP de São Paulo</h1>
          <p className="text-gray-600 mt-2">
            Resultados do último fim de semana de corrida
          </p>
        </div>

        <div className="space-y-8">
          <EventResults {...mockQualifyingResults} />
          <EventResults {...mockRaceResults} />
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Melhor Palpiteiro - Classificação</h3>
            <p className="text-3xl font-bold text-f1-red">João Silva</p>
            <p className="text-gray-600">30 pontos - 80% de acertos</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Melhor Palpiteiro - Corrida</h3>
            <p className="text-3xl font-bold text-f1-red">João Silva</p>
            <p className="text-gray-600">50 pontos - 100% de acertos</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Total do Fim de Semana</h3>
            <p className="text-3xl font-bold text-f1-red">80 pts</p>
            <p className="text-gray-600">João Silva - Red Bull Racing</p>
          </div>
        </div>
      </div>
    </main>
  );
} 