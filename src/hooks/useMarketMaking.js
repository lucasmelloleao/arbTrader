// src/hooks/useMarketMaking.js
import { useState, useEffect, useCallback } from 'react';
import api from '../api';

/**
 * Custom hook for Market Making UI.
 * Handles fetching strategies and recent trades, with auto‑refresh for trades.
 */
export default function useMarketMaking() {
  const [strategies, setStrategies] = useState([]);
  const [trades, setTrades] = useState([]);
  const [loadingStrategies, setLoadingStrategies] = useState(false);
  const [loadingTrades, setLoadingTrades] = useState(false);
  const [error, setError] = useState(null);

  const fetchStrategies = useCallback(async () => {
    setLoadingStrategies(true);
    try {
      const res = await api.get('/market-making');
      setStrategies(res.data || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoadingStrategies(false);
    }
  }, []);

  const fetchTrades = useCallback(async () => {
    setLoadingTrades(true);
    try {
      const res = await api.get('/market-making/trades?limit=50');
      setTrades(res.data?.data || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoadingTrades(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStrategies();
    fetchTrades();
  }, [fetchStrategies, fetchTrades]);

  // Poll trades every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchTrades, 5000);
    return () => clearInterval(interval);
  }, [fetchTrades]);

  return {
    strategies,
    trades,
    loadingStrategies,
    loadingTrades,
    error,
    refreshStrategies: fetchStrategies,
    refreshTrades: fetchTrades,
  };
}
