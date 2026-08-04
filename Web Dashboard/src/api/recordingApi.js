const BASE = `http://${window.location.hostname}:4000`;

/**
 * Returns the list of recorded body-cam sessions from MySQL.
 * @param {string} token - JWT bearer token from AuthContext
 * @param {string} [employeeCode] - Optional filter by guard code
 * @returns {Promise<Array>} recordings array
 */
export async function fetchRecordings(token, employeeCode) {
  const url = employeeCode
    ? `${BASE}/api/recordings?employee_code=${encodeURIComponent(employeeCode)}`
    : `${BASE}/api/recordings`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to fetch recordings');

  const data = await res.json();
  return data.recordings || [];
}
