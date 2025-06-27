import { NextResponse } from 'next/server';
import { liveTimingService } from '../../../services/liveTimingService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('sessionKey');

    if (!sessionKey) {
      // Buscar sessão mais recente
      const latestSession = await liveTimingService.getLatestSession();
      
      if (!latestSession) {
        // Retornar dados mock quando não há sessão ativa
        console.log('Nenhuma sessão F1 ativa - retornando dados mock');
        
        return NextResponse.json({
          session: null,
          standings: [],
          raceControl: [],
          liveRanking: [],
          hasGuesses: false,
          isMockData: true,
          hasF1Data: false,
          timestamp: new Date().toISOString(),
          sessionName: 'Nenhuma sessão ativa',
          grandPrixName: 'Aguardando próxima corrida',
          sessionStatus: 'inactive',
          isActive: false,
          participants: []
        });
      }

      const data = await liveTimingService.getSessionData(latestSession.session_key);
      
      return NextResponse.json({
        ...data,
        timestamp: new Date().toISOString()
      });
    }

    // Buscar dados da sessão específica
    const data = await liveTimingService.getSessionData(parseInt(sessionKey));
    
    return NextResponse.json({
      ...data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao buscar dados de timing:', error);
    
    // Em caso de erro, retornar dados mock em vez de erro 500
    return NextResponse.json({
      session: null,
      standings: [],
      raceControl: [],
      liveRanking: [],
      hasGuesses: false,
      isMockData: true,
      hasF1Data: false,
      timestamp: new Date().toISOString(),
      sessionName: 'Erro ao conectar',
      grandPrixName: 'Serviço temporariamente indisponível',
      sessionStatus: 'error',
      isActive: false,
      participants: [],
      error: 'Serviço de timing temporariamente indisponível'
    });
  }
} 