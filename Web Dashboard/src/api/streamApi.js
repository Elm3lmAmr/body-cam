const BASE = `http://${window.location.hostname}:4000`;

/**
 * Returns the list of currently active guard streams.
 * @param {string} token - JWT bearer token from AuthContext
 * @returns {Promise<Array>} active_streams array
 */
export async function fetchActiveStreams(token) {
  const res = await fetch(`${BASE}/api/stream/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch streams');

  const data = await res.json();
  return data.active_streams || [];
}
