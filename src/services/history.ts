import { API_URLS } from '../config/api';
import { authService } from './auth';

export interface GrandPrixHistoryResponse {
  grandPrixId: number;
  grandPrixName: string;
  country: string;
  season: number;
  round: number;
  raceDate: string;
  completed: boolean;
  qualifyingRanking: ParticipantRanking[];
  raceRanking: ParticipantRanking[];
  combinedRanking: ParticipantRanking[];
  statistics: EventStatistics;
}

export interface ParticipantRanking {
  position: number;
  userId: number;
  userName: string;
  userEmail: string;
  score: number;
  qualifyingScore: number;
  raceScore: number;
  hasQualifyingGuess: boolean;
  hasRaceGuess: boolean;
  totalGuesses: number;
}

export interface EventStatistics {
  totalParticipants: number;
  qualifyingParticipants: number;
  raceParticipants: number;
  averageQualifyingScore: number;
  averageRaceScore: number;
  averageCombinedScore: number;
  highestQualifyingScore: number;
  highestRaceScore: number;
  highestCombinedScore: number;
  topPerformerName: string;
  topPerformerScore: number;
}

export interface SeasonRankingResponse {
  season: number;
  ranking: SeasonParticipant[];
  statistics: SeasonStatistics;
}

export interface SeasonParticipant {
  position: number;
  userId: number;
  userName: string;
  userEmail: string;
  totalScore: number;
  qualifyingScore: number;
  raceScore: number;
  totalGuesses: number;
  qualifyingGuesses: number;
  raceGuesses: number;
  averageScore: number;
  bestEventScore: number;
  bestEventName: string;
  eventsParticipated: number;
  eventHistory?: EventParticipation[];
}

export interface EventParticipation {
  grandPrixId: number;
  grandPrixName: string;
  country: string;
  round: number;
  qualifyingScore: number;
  raceScore: number;
  totalScore: number;
  qualifyingPosition?: number;
  racePosition?: number;
  combinedPosition?: number;
  hasQualifyingGuess: boolean;
  hasRaceGuess: boolean;
}

export interface SeasonStatistics {
  totalParticipants: number;
  totalEvents: number;
  completedEvents: number;
  averageParticipationRate: number;
  averageScore: number;
  highestEventScore: number;
  mostActiveParticipant: string;
  mostActiveParticipantGuesses: number;
  topPerformer: string;
  topPerformerScore: number;
}

export async function getGrandPrixHistory(grandPrixId: number): Promise<GrandPrixHistoryResponse> {
  try {
    const response = await authService.authenticatedFetch(`${API_URLS.BASE_URL}/history/grand-prix/${grandPrixId}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar histórico do GP: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar histórico do GP:', error);
    throw error;
  }
}

export async function getSeasonHistory(season: number): Promise<SeasonRankingResponse> {
  try {
    const response = await authService.authenticatedFetch(`${API_URLS.BASE_URL}/history/season/${season}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar histórico da temporada: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar histórico da temporada:', error);
    throw error;
  }
}

export async function getSeasonRankingSimple(season: number): Promise<SeasonRankingResponse> {
  try {
    const response = await authService.authenticatedFetch(`${API_URLS.BASE_URL}/history/season/${season}/simple`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar ranking simples da temporada: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar ranking simples da temporada:', error);
    throw error;
  }
} 