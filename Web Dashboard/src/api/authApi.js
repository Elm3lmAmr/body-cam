const BASE = `http://${window.location.hostname}:4000`;

/**
 * Authenticates a supervisor against the Edara backend.
 * Throws if the credentials are wrong or if the role is not 'supervisor'.
 */
export async function loginSupervisor(employeeCode, password) {
  const res = await fetch(`${BASE}/api/auth/device-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employee_code: employeeCode, password }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  if (data.user?.role !== 'supervisor')
    throw new Error('Access denied. Supervisor accounts only.');

  return data; // { token, user: { employeeCode, fullName, role } }
}
