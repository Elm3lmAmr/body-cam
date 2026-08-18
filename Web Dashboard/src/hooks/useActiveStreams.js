import { useState, useEffect, useCallback } from 'react';
import { fetchActiveStreams } from '../api/streamApi';

/**
 * Polls active streams every 4 seconds and exposes refresh / error state.
 * @param {string|null} token - JWT token from AuthContext
 */
export function useActiveStreams(token) {
  const [streams, setStreams] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchActiveStreams(token);
      setStreams(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    refresh();
    const id = setInterval(refresh, 1000);
    return () => clearInterval(id);
  }, [token, refresh]);

  return { streams, lastUpdate, error, refresh };
}
