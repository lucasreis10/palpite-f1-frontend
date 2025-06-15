import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '../../../config/axios';
import { RaceScoreCalculator, QualifyingScoreCalculator } from '../../../utils/scoreCalculators';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testando conexão com backend Java...');
    
    // Testar endpoint simples
    const testResponse = await axiosInstance.get('/guesses/test-history');
    console.log('✅ Teste básico OK:', testResponse.data);
    
    // Testar busca de Grand Prix
    const gpResponse = await axiosInstance.get('/grand-prix/next');
    console.log('✅ Grand Prix encontrado:', gpResponse.data);
    
    // Testar busca de palpites
    const guessesResponse = await axiosInstance.get(`/guesses/grand-prix/${gpResponse.data.id}?guessType=RACE`);
    console.log('✅ Palpites encontrados:', guessesResponse.data.length);
    
    return NextResponse.json({
      success: true,
      testEndpoint: testResponse.data,
      grandPrix: gpResponse.data,
      guessesCount: guessesResponse.data.length,
      firstGuess: guessesResponse.data[0] || null
    });
    
  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.response?.data || null
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { realRace, guessRace, realQualifying, guessQualifying } = body;

    console.log('🧪 Testando cálculos de pontuação...');
    console.log('📊 Dados recebidos:', { realRace, guessRace, realQualifying, guessQualifying });

    // Calcular pontuações no frontend (TypeScript)
    const frontendRaceCalc = new RaceScoreCalculator(realRace, guessRace);
    const frontendQualifyingCalc = new QualifyingScoreCalculator(realQualifying, guessQualifying);
    
    const frontendRaceScore = frontendRaceCalc.calculate();
    const frontendQualifyingScore = frontendQualifyingCalc.calculate();
    const frontendTotalScore = frontendRaceScore + frontendQualifyingScore;

    console.log('✅ Frontend (TypeScript) - Race:', frontendRaceScore);
    console.log('✅ Frontend (TypeScript) - Qualifying:', frontendQualifyingScore);
    console.log('✅ Frontend (TypeScript) - Total:', frontendTotalScore);

    // Calcular pontuações no backend (Java)
    let backendRaceScore = 0;
    let backendQualifyingScore = 0;
    let backendTotalScore = 0;
    let backendError = null;

    try {
      const backendResponse = await axiosInstance.post('/guesses/live-timing', {
        realRace,
        guessRace,
        realQualifying,
        guessQualifying
      });

      if (backendResponse.data) {
        backendRaceScore = backendResponse.data.raceScore || 0;
        backendQualifyingScore = backendResponse.data.qualifyingScore || 0;
        backendTotalScore = backendResponse.data.totalScore || 0;
      }

      console.log('✅ Backend (Java) - Race:', backendRaceScore);
      console.log('✅ Backend (Java) - Qualifying:', backendQualifyingScore);
      console.log('✅ Backend (Java) - Total:', backendTotalScore);
    } catch (error: any) {
      console.error('❌ Erro ao chamar backend Java:', error.message);
      backendError = error.message;
    }

    // Comparar resultados
    const raceMatch = Math.abs(frontendRaceScore - backendRaceScore) < 0.001;
    const qualifyingMatch = Math.abs(frontendQualifyingScore - backendQualifyingScore) < 0.001;
    const totalMatch = Math.abs(frontendTotalScore - backendTotalScore) < 0.001;

    const result = {
      success: true,
      frontend: {
        raceScore: frontendRaceScore,
        qualifyingScore: frontendQualifyingScore,
        totalScore: frontendTotalScore
      },
      backend: {
        raceScore: backendRaceScore,
        qualifyingScore: backendQualifyingScore,
        totalScore: backendTotalScore,
        error: backendError
      },
      comparison: {
        raceMatch,
        qualifyingMatch,
        totalMatch,
        allMatch: raceMatch && qualifyingMatch && totalMatch
      },
      differences: {
        race: frontendRaceScore - backendRaceScore,
        qualifying: frontendQualifyingScore - backendQualifyingScore,
        total: frontendTotalScore - backendTotalScore
      }
    };

    console.log('📊 Resultado da comparação:', result);

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('❌ Erro no teste de cálculos:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.response?.data || null
    }, { status: 500 });
  }
} 