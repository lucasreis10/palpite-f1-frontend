import { NextResponse } from 'next/server';
import { dashboardService } from '../../../../services/dashboard';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    const nextRaces = await dashboardService.getNextRaces(limit);
    
    return NextResponse.json(nextRaces);
  } catch (error) {
    console.error('Erro ao buscar próximas corridas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar próximas corridas' },
      { status: 500 }
    );
  }
} 