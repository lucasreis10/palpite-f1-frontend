import { NextRequest, NextResponse } from 'next/server';
import { reminderService } from '../../../../services/reminderService';

export async function POST(request: NextRequest) {
  try {
    const { email, phone } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`🧪 Teste de lembrete solicitado para: ${email}${phone ? ` e ${phone}` : ''}`);

    // Enviar lembrete de teste
    const result = await reminderService.sendTestReminder(email, phone);

    return NextResponse.json({
      success: true,
      result,
      message: `Lembrete de teste enviado para ${result.userName}`,
      methods: result.methods,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro no teste de lembrete:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('🔄 Executando rotina de lembretes...');

    // Executar rotina de lembretes
    await reminderService.runReminderRoutine();

    return NextResponse.json({
      success: true,
      message: 'Rotina de lembretes executada com sucesso',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro na rotina de lembretes:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 