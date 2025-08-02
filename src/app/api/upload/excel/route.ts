import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '@/config/axios';
import { API_CONFIG } from '@/config/api';

// URL do backend Java usando a configuração centralizada
const BACKEND_URL = API_CONFIG.BASE_URL;

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API de upload de Excel ativa - usando axios configurado',
    backendUrl: BACKEND_URL,
    endpoint: `${BACKEND_URL}/import/excel`,
    status: 'ACTIVE'
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('excel') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Nenhum arquivo enviado' },
        { status: 400 }
      );
    }

    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      return NextResponse.json(
        { success: false, message: 'Arquivo deve ser Excel (.xlsx ou .xls)' },
        { status: 400 }
      );
    }

    console.log('🔄 Enviando arquivo Excel para backend Java via axios:', file.name);
    
    // Criar FormData para enviar ao backend Java
    const backendFormData = new FormData();
    backendFormData.append('excel', file);

    // Fazer request usando axios configurado
    const response = await axiosInstance.post('/import/excel', backendFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 segundos para uploads grandes
    });

    console.log('✅ Resposta do backend Java recebida via axios:', response.data);

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('❌ Erro ao comunicar com backend Java via axios:', error);
    
    // Verificar se é erro de conexão do axios
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json({
        success: false,
        message: 'Erro de conexão com o backend. Verifique se o servidor Java está rodando.',
        error: 'Backend não disponível',
        backendUrl: BACKEND_URL,
        suggestion: 'Execute: cd ../palpite-f1-backend && ./gradlew bootRun'
      }, { status: 503 });
    }

    // Verificar se é erro de timeout
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      return NextResponse.json({
        success: false,
        message: 'Timeout no processamento do arquivo. Arquivo muito grande ou servidor sobrecarregado.',
        error: 'Timeout',
        backendUrl: BACKEND_URL
      }, { status: 408 });
    }

    // Verificar se temos resposta do servidor (erro HTTP)
    if (error.response) {
      const errorData = error.response.data;
      console.error('❌ Erro HTTP do backend Java:', error.response.status, errorData);
      
      return NextResponse.json({
        success: false,
        message: errorData?.message || 'Erro ao processar arquivo no backend',
        error: errorData,
        backendUrl: BACKEND_URL,
        status: error.response.status
      }, { status: error.response.status });
    }

    // Erro genérico
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor frontend',
      error: error.message || 'Erro desconhecido'
    }, { status: 500 });
  }
} 