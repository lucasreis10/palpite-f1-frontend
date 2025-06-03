interface Driver {
  id: number;
  name: string;
  team: string;
  position: number;
}

interface Prediction {
  id: number;
  user: {
    id: number;
    name: string;
    team: string;
  };
  predictions: Driver[];
  points: number;
  accuracy: number;
}

interface EventResultsProps {
  eventName: string;
  date: string;
  type: 'qualifying' | 'race';
  officialResults: Driver[];
  predictions: Prediction[];
}

export function EventResults({ eventName, date, type, officialResults, predictions }: EventResultsProps) {
  // Ordenar palpites por pontuação
  const sortedPredictions = [...predictions].sort((a, b) => b.points - a.points);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {type === 'qualifying' ? 'Resultado da Classificação' : 'Resultado da Corrida'}
            </h2>
            <p className="text-gray-600">{date}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Resultado Oficial */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resultado Oficial</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              {officialResults.length > 0 ? (
                officialResults.slice(0, 10).map((driver) => (
                  <div 
                    key={driver.id}
                    className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
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
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="mb-3">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">Resultados ainda não disponíveis</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {type === 'qualifying' ? 'Aguardando fim da classificação' : 'Aguardando fim da corrida'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Todos os Palpites */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Palpites dos Participantes</h3>
            <div className="space-y-4">
              {sortedPredictions.length > 0 ? (
                sortedPredictions.map((prediction, index) => {
                  // Definir o estilo baseado na posição
                  let style = "border-2 ";
                  if (index < 3) {
                    style += "border-green-500 bg-green-50";
                  } else if (index < 5) {
                    style += "border-blue-500 bg-blue-50";
                  } else if (index < 10) {
                    style += "border-yellow-500 bg-yellow-50";
                  } else {
                    style += "border-gray-200 bg-gray-50";
                  }

                  return (
                    <div 
                      key={prediction.id}
                      className={`rounded-lg p-4 ${style}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                            index < 3 ? 'bg-green-200 text-green-800' :
                            index < 5 ? 'bg-blue-200 text-blue-800' :
                            index < 10 ? 'bg-yellow-200 text-yellow-800' :
                            'bg-gray-200 text-gray-800'
                          }`}>
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">{prediction.user.name}</p>
                            <p className="text-sm text-gray-500">{prediction.user.team}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-f1-red">{prediction.points} pts</p>
                          {prediction.accuracy > 0 && (
                            <p className="text-sm text-gray-500">{(prediction.accuracy * 100).toFixed(0)}% acertos</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Mostrar detalhes dos palpites apenas se disponível */}
                      {prediction.predictions.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3 p-2 bg-white rounded-lg">
                          {prediction.predictions.slice(0, 6).map((driver, idx) => (
                            <div 
                              key={driver.id}
                              className="flex items-center gap-2"
                            >
                              <span className={`text-sm px-2 py-1 rounded-full ${
                                idx < 3 ? 'bg-green-100 text-green-800' :
                                idx < 6 ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>{idx + 1}.</span>
                              <span className="text-sm text-gray-900">{driver.name}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {index < 3 && (
                        <div className="mt-2 text-sm text-green-600 font-medium">
                          🏆 Pódio - Top 3
                        </div>
                      )}
                      {index >= 3 && index < 5 && (
                        <div className="mt-2 text-sm text-blue-600 font-medium">
                          ⭐ Top 5
                        </div>
                      )}
                      {index >= 5 && index < 10 && (
                        <div className="mt-2 text-sm text-yellow-600 font-medium">
                          ✨ Top 10
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="mb-3">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">Nenhum palpite disponível</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Os palpites dos participantes aparecerão aqui após o evento
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 