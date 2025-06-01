import { useState, useEffect, useCallback } from 'react';

interface LiveTimingOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  sessionKey?: number;
}

export function useLiveTiming(options: LiveTimingOptions = {}) {
  const { 
    autoRefresh = true, 
    refreshInterval = 5000,
    sessionKey 
  } = options;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const url = sessionKey 
        ? `/api/live-timing?sessionKey=${sessionKey}`
        : '/api/live-timing';
        
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar dados');
      }
      
      const newData = await response.json();
      setData(newData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
} 