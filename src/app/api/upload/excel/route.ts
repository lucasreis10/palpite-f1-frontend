import { NextRequest, NextResponse } from 'next/server';

// URL do backend Java - ajuste conforme sua configuração
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8081';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API de upload de Excel ativa - conectando com backend Java',
    backendUrl: BACKEND_URL,
    endpoint: `${BACKEND_URL}/import/excel`
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

    console.log('🔄 Enviando arquivo Excel para backend Java:', file.name);
    
    // Criar FormData para enviar ao backend Java
    const backendFormData = new FormData();
    backendFormData.append('excel', file);

    // Fazer request para o backend Java
    const backendResponse = await fetch(`${BACKEND_URL}/import/excel`, {
      method: 'POST',
      body: backendFormData,
      headers: {
        // Não definir Content-Type para FormData (deixar o browser definir boundary)
      },
    });

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('❌ Erro do backend Java:', errorText);
      
      return NextResponse.json({
        success: false,
        message: 'Erro ao processar arquivo no backend',
        error: errorText
      }, { status: backendResponse.status });
    }

    const result = await backendResponse.json();
    console.log('✅ Resposta do backend Java recebida');

    return NextResponse.json(result);

  } catch (error) {
    console.error('❌ Erro ao comunicar com backend Java:', error);
    
    // Verificar se é erro de conexão
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({
        success: false,
        message: 'Erro de conexão com o backend. Verifique se o servidor Java está rodando.',
        error: 'Backend não disponível',
        backendUrl: BACKEND_URL
      }, { status: 503 });
    }

    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor frontend',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 