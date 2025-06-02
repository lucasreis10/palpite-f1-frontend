import { NextResponse } from 'next/server';
import axiosInstance from '../../../config/axios';
import { API_URLS } from '../../../config/api';

export async function GET() {
  try {
    console.log('Buscando pilotos via API...');
    
    // Buscar pilotos da API
    const response = await axiosInstance.get(`${API_URLS.PILOTS}`);
    const pilots = response.data;

    console.log('Pilotos encontrados:', pilots.length);
    
    return NextResponse.json(pilots);
  } catch (error) {
    console.error('Erro ao buscar pilotos:', error);
    
    // Retornar pilotos mock em caso de erro
    const mockPilots = [
      { id: 1, name: 'Max', familyName: 'Verstappen', code: 'VER', teamName: 'Red Bull Racing', teamColor: '4781D7' },
      { id: 2, name: 'Lewis', familyName: 'Hamilton', code: 'HAM', teamName: 'Mercedes', teamColor: '00D7B6' },
      { id: 3, name: 'Charles', familyName: 'Leclerc', code: 'LEC', teamName: 'Ferrari', teamColor: 'ED1131' },
      { id: 4, name: 'Lando', familyName: 'Norris', code: 'NOR', teamName: 'McLaren', teamColor: 'F47600' },
      { id: 5, name: 'George', familyName: 'Russell', code: 'RUS', teamName: 'Mercedes', teamColor: '00D7B6' },
      { id: 6, name: 'Carlos', familyName: 'Sainz Jr.', code: 'SAI', teamName: 'Ferrari', teamColor: 'ED1131' },
      { id: 7, name: 'Sergio', familyName: 'Pérez', code: 'PER', teamName: 'Red Bull Racing', teamColor: '4781D7' },
      { id: 8, name: 'Oscar', familyName: 'Piastri', code: 'PIA', teamName: 'McLaren', teamColor: 'F47600' },
      { id: 9, name: 'Fernando', familyName: 'Alonso', code: 'ALO', teamName: 'Aston Martin', teamColor: '229971' },
      { id: 10, name: 'Lance', familyName: 'Stroll', code: 'STR', teamName: 'Aston Martin', teamColor: '229971' },
      { id: 11, name: 'Pierre', familyName: 'Gasly', code: 'GAS', teamName: 'Alpine', teamColor: '00A1E8' },
      { id: 12, name: 'Esteban', familyName: 'Ocon', code: 'OCO', teamName: 'Alpine', teamColor: '00A1E8' },
      { id: 13, name: 'Alexander', familyName: 'Albon', code: 'ALB', teamName: 'Williams', teamColor: '1868DB' },
      { id: 14, name: 'Logan', familyName: 'Sargeant', code: 'SAR', teamName: 'Williams', teamColor: '1868DB' },
      { id: 15, name: 'Kevin', familyName: 'Magnussen', code: 'MAG', teamName: 'Haas F1 Team', teamColor: '9C9FA2' },
      { id: 16, name: 'Nico', familyName: 'Hülkenberg', code: 'HUL', teamName: 'Haas F1 Team', teamColor: '9C9FA2' },
      { id: 17, name: 'Yuki', familyName: 'Tsunoda', code: 'TSU', teamName: 'AlphaTauri', teamColor: '6C98FF' },
      { id: 18, name: 'Daniel', familyName: 'Ricciardo', code: 'RIC', teamName: 'AlphaTauri', teamColor: '6C98FF' },
      { id: 19, name: 'Zhou', familyName: 'Guanyu', code: 'ZHO', teamName: 'Alfa Romeo', teamColor: '9B0B2C' },
      { id: 20, name: 'Valtteri', familyName: 'Bottas', code: 'BOT', teamName: 'Alfa Romeo', teamColor: '9B0B2C' }
    ];

    return NextResponse.json(mockPilots);
  }
} 