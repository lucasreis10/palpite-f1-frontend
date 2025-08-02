import { NextRequest, NextResponse } from 'next/server';

// URL do backend Java - ajuste conforme sua configuração
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8081';

export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'Funcionalidade de import Excel temporariamente indisponível',
    backendUrl: BACKEND_URL,
    status: 'Em desenvolvimento'
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

    // Retornar mensagem temporária
    return NextResponse.json({
      success: false,
      message: 'Funcionalidade de import Excel temporariamente indisponível. O backend está sendo configurado.',
      fileName: file.name,
      fileSize: file.size,
      status: 'Aguardando implementação completa do backend'
    });

  } catch (error) {
    console.error('❌ Erro na API de upload:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor frontend',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 