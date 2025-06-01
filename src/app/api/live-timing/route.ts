import { NextResponse } from 'next/server';
import { liveTimingService } from '@/services/liveTimingService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionKey = searchParams.get('sessionKey');

    if (!sessionKey) {
      // Buscar sessão mais recente
      const latestSession = await liveTimingService.getLatestSession();
      
      if (!latestSession) {
        return NextResponse.json(
          { error: 'Nenhuma sessão ativa encontrada' },
          { status: 404 }
        );
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
    return NextResponse.json(
      { error: 'Erro ao buscar dados de timing' },
      { status: 500 }
    );
  }
} 