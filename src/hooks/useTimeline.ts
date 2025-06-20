import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { API_CONFIG } from '../config/api';

export interface TimelineEvent {
  id: number;
  eventType: string;
  title: string;
  description: string;
  pointsGained?: number;
  season: number;
  createdAt: string;
  icon: string;
  color: string;
  grandPrix?: {
    name: string;
    country: string;
    date: string;
  };
}

export interface TimelineFilters {
  season: string;
  eventType: string;
  search: string;
}

export function useTimeline() {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeline = async (userId: number, filters?: Partial<TimelineFilters>) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (filters?.season && filters.season !== 'all') {
        queryParams.append('season', filters.season);
      }
      if (filters?.eventType && filters.eventType !== 'all') {
        queryParams.append('eventType', filters.eventType);
      }
      if (filters?.search) {
        queryParams.append('search', filters.search);
      }

      const url = `${API_CONFIG.BASE_URL}/timeline/user/${userId}?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar timeline: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Erro ao carregar timeline:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setEvents([]); // Deixar vazio em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const refreshTimeline = () => {
    if (user) {
      fetchTimeline(user.id);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTimeline(user.id);
    }
  }, [user]);

  return {
    events,
    loading,
    error,
    fetchTimeline,
    refreshTimeline,
  };
} 