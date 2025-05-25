import { Header } from '@/components/Header';
import { BetForm } from '@/components/BetForm';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function PalpitesPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Faça seu Palpite</h1>
          <p className="text-gray-600 mt-2">
            Envie seu palpite para o próximo Grande Prêmio selecionando os 10 primeiros colocados
          </p>
        </div>

        <BetForm />

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Pontuação</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-100"></span>
                <span className="text-gray-600">25 pontos por acerto no pódio</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-100"></span>
                <span className="text-gray-600">18 pontos por acerto nas posições 4-6</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-100"></span>
                <span className="text-gray-600">10 pontos por acerto nas posições 7-10</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Prazo</h3>
            <p className="text-3xl font-bold text-f1-red">16:00</p>
            <p className="text-gray-600">Sábado, 02/03/2024</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Próxima Corrida</h3>
            <p className="text-3xl font-bold text-f1-red">GP de São Paulo</p>
            <p className="text-gray-600">Autódromo de Interlagos</p>
          </div>
        </div>
      </div>
    </main>
    </ProtectedRoute>
  );
} 