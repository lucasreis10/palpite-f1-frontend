'use client';

import { Header } from '../../components/Header';
import { NextRaceWidget } from '../../components/NextRaceWidget';

export default function NextRacePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏁 Próxima Corrida
          </h1>
          <p className="text-gray-600">
            Acompanhe todas as informações da próxima corrida da Fórmula 1
          </p>
        </div>

        <div className="space-y-8">
          {/* Widget Completo */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Widget Completo
            </h2>
            <NextRaceWidget showSessions={true} />
          </div>

          {/* Widget Sem Sessões */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Widget Sem Cronograma
            </h2>
            <NextRaceWidget showSessions={false} />
          </div>

          {/* Widget Compacto */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Widget Compacto
            </h2>
            <div className="max-w-md">
              <NextRaceWidget compact={true} showSessions={false} />
            </div>
          </div>

          {/* Grid de Widgets Compactos */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Grid de Widgets Compactos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <NextRaceWidget compact={true} showSessions={false} />
              <NextRaceWidget compact={true} showSessions={false} />
              <NextRaceWidget compact={true} showSessions={false} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 