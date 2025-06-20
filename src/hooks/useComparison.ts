import { useState } from 'react';
import { useAuth } from './useAuth';
import { API_CONFIG } from '../config/api';

export interface User {
  id: number;
  name: string;
  email: string;
  totalPoints: number;
  position: number;
  avatar?: string;
}

export interface ComparisonStats {
  totalPoints: number;
  averagePoints: number;
  bestScore: number;
  totalRaces: number;
  podiums: number;
  perfectWeekends: number;
  currentStreak: number;
  bestStreak: number;
  qualifyingAccuracy: number;
  raceAccuracy: number;
}

export interface HeadToHeadComparison {
  user1: User;
  user2: User;
  user1Stats: ComparisonStats;
  user2Stats: ComparisonStats;
  directComparison: {
    user1Wins: number;
    user2Wins: number;
    draws: number;
    totalRaces: number;
  };
  recentRaces: Array<{
    grandPrixName: string;
    date: string;
    user1Points: number;
    user2Points: number;
    winner: 'user1' | 'user2' | 'draw';
  }>;
}

export function useComparison() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [comparison, setComparison] = useState<HeadToHeadComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_CONFIG.BASE_URL}/users`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar usuários: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setUsers([]); // Deixar vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const compareUsers = async (user1Id: number, user2Id: number) => {
    setLoading(true);
    setError(null);

    try {
      const url = `${API_CONFIG.BASE_URL}/comparison/head-to-head?user1Id=${user1Id}&user2Id=${user2Id}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Se a API falhar, usar dados mock temporários
        console.warn('API de comparação não disponível, usando dados mock');
        
        const user1 = users.find(u => u.id === user1Id);
        const user2 = users.find(u => u.id === user2Id);
        
        if (!user1 || !user2) {
          throw new Error('Usuários não encontrados');
        }

        const mockComparison: HeadToHeadComparison = {
          user1: user1,
          user2: user2,
          user1Stats: {
            totalPoints: 125.5,
            averagePoints: 12.55,
            bestScore: 25.0,
            totalRaces: 10,
            podiums: 3,
            perfectWeekends: 1,
            currentStreak: 2,
            bestStreak: 4,
            qualifyingAccuracy: 70.0,
            raceAccuracy: 65.0
          },
          user2Stats: {
            totalPoints: 98.2,
            averagePoints: 12.28,
            bestScore: 22.5,
            totalRaces: 8,
            podiums: 2,
            perfectWeekends: 0,
            currentStreak: 1,
            bestStreak: 3,
            qualifyingAccuracy: 62.5,
            raceAccuracy: 60.0
          },
          directComparison: {
            user1Wins: 6,
            user2Wins: 2,
            draws: 2,
            totalRaces: 10
          },
          recentRaces: [
            {
              grandPrixName: "Bahrain Grand Prix",
              date: "2024-03-02",
              user1Points: 18.5,
              user2Points: 15.2,
              winner: 'user1'
            },
            {
              grandPrixName: "Saudi Arabian Grand Prix", 
              date: "2024-03-09",
              user1Points: 12.0,
              user2Points: 16.8,
              winner: 'user2'
            },
            {
              grandPrixName: "Australian Grand Prix",
              date: "2024-03-24",
              user1Points: 20.5,
              user2Points: 20.5,
              winner: 'draw'
            }
          ]
        };

        setComparison(mockComparison);
        return;
      }

      const data = await response.json();
      
      // Mapear a resposta da API para o formato esperado pelo frontend
      const mappedComparison: HeadToHeadComparison = {
        user1: {
          id: user1Id,
          name: data.user1Name,
          email: '',
          totalPoints: data.user1Stats.totalPoints,
          position: 0
        },
        user2: {
          id: user2Id,
          name: data.user2Name,
          email: '',
          totalPoints: data.user2Stats.totalPoints,
          position: 0
        },
        user1Stats: {
          totalPoints: data.user1Stats.totalPoints,
          averagePoints: data.user1Stats.averagePoints,
          bestScore: data.user1Stats.bestRaceScore,
          totalRaces: data.user1Stats.totalGuesses,
          podiums: 0,
          perfectWeekends: 0,
          currentStreak: 0,
          bestStreak: 0,
          qualifyingAccuracy: data.performanceComparison?.user1QualifyingAverage || 0,
          raceAccuracy: data.user1Stats.accuracyRate
        },
        user2Stats: {
          totalPoints: data.user2Stats.totalPoints,
          averagePoints: data.user2Stats.averagePoints,
          bestScore: data.user2Stats.bestRaceScore,
          totalRaces: data.user2Stats.totalGuesses,
          podiums: 0,
          perfectWeekends: 0,
          currentStreak: 0,
          bestStreak: 0,
          qualifyingAccuracy: data.performanceComparison?.user2QualifyingAverage || 0,
          raceAccuracy: data.user2Stats.accuracyRate
        },
        directComparison: {
          user1Wins: data.user1Wins,
          user2Wins: data.user2Wins,
          draws: data.ties,
          totalRaces: data.totalRaces
        },
        recentRaces: data.raceComparisons?.map((race: any) => ({
          grandPrixName: race.grandPrixName || 'Grande Prêmio',
          date: race.raceDate || new Date().toISOString(),
          user1Points: race.user1Score || 0,
          user2Points: race.user2Score || 0,
          winner: race.winner === user1Id ? 'user1' : race.winner === user2Id ? 'user2' : 'draw'
        })) || []
      };
      
      setComparison(mappedComparison);
    } catch (err) {
      console.error('Erro ao comparar usuários:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setComparison(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    comparison,
    loading,
    error,
    fetchUsers,
    compareUsers,
    clearComparison: () => setComparison(null),
  };
} 