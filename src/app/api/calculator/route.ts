import { NextRequest, NextResponse } from 'next/server';
import axiosInstance from '../../../config/axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guessType, userGuess, actualResult } = body;

    console.log('🧮 Calculadora - Dados recebidos:', { 
      guessType, 
      userGuessLength: userGuess?.length, 
      actualResultLength: actualResult?.length 
    });

    // Validar dados de entrada
    if (!guessType || !userGuess || !actualResult) {
      return NextResponse.json({
        success: false,
        error: 'Dados incompletos. Necessário: guessType, userGuess, actualResult'
      }, { status: 400 });
    }

    if (!Array.isArray(userGuess) || !Array.isArray(actualResult)) {
      return NextResponse.json({
        success: false,
        error: 'userGuess e actualResult devem ser arrays'
      }, { status: 400 });
    }

    if (userGuess.length !== actualResult.length) {
      return NextResponse.json({
        success: false,
        error: 'userGuess e actualResult devem ter o mesmo tamanho'
      }, { status: 400 });
    }

    try {
      // Chamar o backend Java para calcular a pontuação
      console.log('📤 Enviando para backend Java:', {
        guessType,
        userGuess,
        actualResult
      });

      const response = await axiosInstance.post('/guesses/calculate-score', {
        guessType,
        userGuess,
        actualResult
      });

      console.log('✅ Resposta do backend Java:', response.data);

      const result = {
        success: true,
        totalScore: response.data.totalScore,
        individualScores: response.data.individualScores || [],
        maxPossibleScore: response.data.maxPossibleScore || 0,
        details: response.data.details || []
      };

      return NextResponse.json(result);

    } catch (backendError: any) {
      console.error('❌ Erro ao chamar backend Java:', backendError.message);
      
      // Se o backend falhar, retornar erro específico
      return NextResponse.json({
        success: false,
        error: 'Erro no cálculo do backend',
        details: backendError.response?.data || backendError.message
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Erro no endpoint da calculadora:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 