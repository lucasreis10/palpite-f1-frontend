'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  Download, 
  Users, 
  Trophy, 
  BarChart3,
  AlertCircle,
  Loader2,
  FileText,
  Calendar
} from 'lucide-react';

interface ProcessingStats {
  totalUsers: number;
  totalGuesses: number;
  totalRaces: number;
  qualifyingGuesses: number;
  raceGuesses: number;
  unmappedPilots: number;
}

interface ProcessingResult {
  success: boolean;
  message: string;
  data?: {
    users: Array<{
      name: string;
      qualifyingGuesses: number;
      raceGuesses: number;
    }>;
    guesses: any[];
    races: string[];
    stats: ProcessingStats;
    sql: string;
  };
  error?: string;
}

export default function ExcelUploadPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1,
    multiple: false
  });

  const processFile = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('excel', uploadedFile);

      const response = await fetch('/api/upload/excel', {
        method: 'POST',
        body: formData,
      });

      const data: ProcessingResult = await response.json();
      setResult(data);

    } catch (error) {
      console.error('Erro no upload:', error);
      setResult({
        success: false,
        message: 'Erro ao processar arquivo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadSQL = () => {
    if (!result?.data?.sql) return;

    const blob = new Blob([result.data.sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palpites-import-${new Date().toISOString().split('T')[0]}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadJSON = () => {
    if (!result?.data) return;

    const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palpites-processados-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileSpreadsheet className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Import de Palpites</h1>
          </div>
          <p className="text-gray-600">
            Faça upload do arquivo Excel com palpites históricos. O sistema processará automaticamente a aba "Palpite".
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload do Arquivo Excel
          </h2>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragActive
                ? 'border-red-400 bg-red-50'
                : 'border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50'
            }`}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center gap-4">
              <FileSpreadsheet className={`h-12 w-12 ${isDragActive ? 'text-red-500' : 'text-gray-400'}`} />
              
              {uploadedFile ? (
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-900">{uploadedFile.name}</p>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  {isDragActive ? (
                    <p className="text-lg text-red-600">Solte o arquivo aqui...</p>
                  ) : (
                    <>
                      <p className="text-lg text-gray-600">
                        Arraste e solte o arquivo Excel aqui, ou clique para selecionar
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Suporta arquivos .xlsx e .xls
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {uploadedFile && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={processFile}
                disabled={isProcessing}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5" />
                    Processar Arquivo
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Processing Result */}
        {result && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              {result.success ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <h2 className="text-xl font-semibold text-gray-900">
                Resultado do Processamento
              </h2>
            </div>

            <div className={`p-4 rounded-lg mb-4 ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </p>
              {result.error && (
                <p className="text-red-600 text-sm mt-2">
                  Erro: {result.error}
                </p>
              )}
            </div>

            {result.success && result.data && (
              <>
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Usuários</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {result.data.stats.totalUsers}
                    </p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Palpites</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {result.data.stats.totalGuesses}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Corridas</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                      {result.data.stats.totalRaces}
                    </p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Não Mapeados</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900">
                      {result.data.stats.unmappedPilots}
                    </p>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Detalhes dos Palpites</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Qualifying:</span>
                        <span className="font-medium">{result.data.stats.qualifyingGuesses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Race:</span>
                        <span className="font-medium">{result.data.stats.raceGuesses}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">Corridas Encontradas</h3>
                    <div className="text-sm text-gray-600 max-h-20 overflow-y-auto">
                      {result.data.races.slice(0, 5).join(', ')}
                      {result.data.races.length > 5 && '...'}
                    </div>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={downloadSQL}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Download SQL
                  </button>
                  
                  <button
                    onClick={downloadJSON}
                    className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="h-5 w-5" />
                    Download JSON
                  </button>
                </div>

                {/* Instructions */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-2">Próximos Passos:</h4>
                      <ol className="text-sm text-yellow-700 space-y-1">
                        <li>1. Baixe o arquivo SQL gerado</li>
                        <li>2. Execute o SQL no banco de dados do backend Java</li>
                        <li>3. Verifique se os usuários foram criados corretamente</li>
                        <li>4. Teste os endpoints de palpites</li>
                        <li>5. Configure o sistema de email se necessário</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">ℹ️ Como Usar</h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Preparação do Arquivo:</h3>
              <p>• O arquivo Excel deve conter uma aba chamada "Palpite"</p>
              <p>• A estrutura deve seguir o padrão: usuários nas linhas, corridas nas colunas</p>
              <p>• Cada usuário deve ter 10 linhas (posições 1º a 10º)</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Processamento:</h3>
              <p>• O sistema identifica automaticamente corridas e pilotos</p>
              <p>• Gera palpites separados para Qualifying e Race</p>
              <p>• Cria usuários com emails automáticos (@palpitef1.com)</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Resultado:</h3>
              <p>• SQL pronto para executar no banco de dados</p>
              <p>• JSON com dados estruturados para análise</p>
              <p>• Estatísticas detalhadas do processamento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 