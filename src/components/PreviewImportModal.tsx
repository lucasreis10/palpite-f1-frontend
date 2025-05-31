'use client';

interface Result {
  position: number;
  driver: string;
  team: string;
}

interface PreviewImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  results: Result[];
  isLoading: boolean;
  type: 'qualifying' | 'race';
}

export function PreviewImportModal({ isOpen, onClose, onConfirm, results, isLoading, type }: PreviewImportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            {type === 'qualifying' ? '🏎️ Resultado da Classificação' : '🏁 Resultado da Corrida'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-f1-red"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Nenhum resultado disponível
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                    index < 3 ? 'bg-yellow-400 text-yellow-900' : 
                    index < 6 ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {result.position}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">{result.driver}</p>
                    <p className="text-sm text-gray-500">{result.team}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || results.length === 0}
            className="flex-1 px-4 py-2 bg-f1-red text-black rounded-lg hover:bg-f1-red/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black inline-block mr-2"></div>
                Carregando...
              </>
            ) : (
              'Importar Resultado'
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 