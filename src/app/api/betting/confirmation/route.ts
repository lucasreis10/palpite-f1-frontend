import { NextRequest, NextResponse } from 'next/server';
import { emailService, type BettingGuess } from '../../../../services/emailService';

export async function POST(request: NextRequest) {
  try {
    const { 
      email, 
      userName, 
      grandPrixName, 
      qualifyingGuesses, 
      raceGuesses 
    } = await request.json();

    // Validações básicas
    if (!email || !userName || !grandPrixName) {
      return NextResponse.json(
        { error: 'Dados obrigatórios: email, userName, grandPrixName' },
        { status: 400 }
      );
    }

    if (!qualifyingGuesses || !raceGuesses) {
      return NextResponse.json(
        { error: 'Palpites de classificação e corrida são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar se os palpites têm o formato correto (Top 10)
    if (qualifyingGuesses.length !== 10 || raceGuesses.length !== 10) {
      return NextResponse.json(
        { error: 'Devem ser fornecidos exatamente 10 palpites para classificação e 10 para corrida' },
        { status: 400 }
      );
    }

    console.log(`📧 Enviando confirmação de palpite para ${userName} (${email})`);
    console.log(`🏎️ GP: ${grandPrixName}`);
    console.log(`📊 Palpites: ${qualifyingGuesses.length} qualifying + ${raceGuesses.length} race`);

    // Enviar email de confirmação
    const result = await emailService.sendBettingConfirmation(
      email,
      userName,
      grandPrixName,
      qualifyingGuesses,
      raceGuesses,
      new Date()
    );

    if (result.success) {
      console.log(`✅ Email de confirmação enviado com sucesso via ${result.provider}`);
      
      return NextResponse.json({
        success: true,
        message: 'Email de confirmação enviado com sucesso',
        provider: result.provider,
        messageId: result.messageId,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error(`❌ Falha ao enviar email: ${result.error}`);
      
      return NextResponse.json(
        { 
          error: 'Falha ao enviar email de confirmação',
          details: result.error,
          provider: result.provider
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('❌ Erro no envio de confirmação:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para testar com dados mock
export async function GET() {
  try {
    // Dados de teste
    const mockQualifyingGuesses: BettingGuess[] = [
      { position: 1, pilotName: 'Max Verstappen', pilotCode: 'VER', teamName: 'Red Bull Racing' },
      { position: 2, pilotName: 'Lando Norris', pilotCode: 'NOR', teamName: 'McLaren' },
      { position: 3, pilotName: 'Oscar Piastri', pilotCode: 'PIA', teamName: 'McLaren' },
      { position: 4, pilotName: 'George Russell', pilotCode: 'RUS', teamName: 'Mercedes' },
      { position: 5, pilotName: 'Lewis Hamilton', pilotCode: 'HAM', teamName: 'Mercedes' },
      { position: 6, pilotName: 'Charles Leclerc', pilotCode: 'LEC', teamName: 'Ferrari' },
      { position: 7, pilotName: 'Carlos Sainz', pilotCode: 'SAI', teamName: 'Ferrari' },
      { position: 8, pilotName: 'Fernando Alonso', pilotCode: 'ALO', teamName: 'Aston Martin' },
      { position: 9, pilotName: 'Lance Stroll', pilotCode: 'STR', teamName: 'Aston Martin' },
      { position: 10, pilotName: 'Sergio Perez', pilotCode: 'PER', teamName: 'Red Bull Racing' }
    ];

    const mockRaceGuesses: BettingGuess[] = [
      { position: 1, pilotName: 'Max Verstappen', pilotCode: 'VER', teamName: 'Red Bull Racing' },
      { position: 2, pilotName: 'Oscar Piastri', pilotCode: 'PIA', teamName: 'McLaren' },
      { position: 3, pilotName: 'Lando Norris', pilotCode: 'NOR', teamName: 'McLaren' },
      { position: 4, pilotName: 'Lewis Hamilton', pilotCode: 'HAM', teamName: 'Mercedes' },
      { position: 5, pilotName: 'George Russell', pilotCode: 'RUS', teamName: 'Mercedes' },
      { position: 6, pilotName: 'Charles Leclerc', pilotCode: 'LEC', teamName: 'Ferrari' },
      { position: 7, pilotName: 'Fernando Alonso', pilotCode: 'ALO', teamName: 'Aston Martin' },
      { position: 8, pilotName: 'Carlos Sainz', pilotCode: 'SAI', teamName: 'Ferrari' },
      { position: 9, pilotName: 'Sergio Perez', pilotCode: 'PER', teamName: 'Red Bull Racing' },
      { position: 10, pilotName: 'Lance Stroll', pilotCode: 'STR', teamName: 'Aston Martin' }
    ];

    console.log('🧪 Teste de confirmação de palpite com dados mock');

    // Enviar email de teste
    const result = await emailService.sendBettingConfirmation(
      'lucaschristian10@gmail.com',
      'Lucas Reis',
      'Grande Prêmio da Grã-Bretanha',
      mockQualifyingGuesses,
      mockRaceGuesses,
      new Date()
    );

    return NextResponse.json({
      success: true,
      message: 'Email de confirmação de teste enviado',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Erro no teste de confirmação:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 