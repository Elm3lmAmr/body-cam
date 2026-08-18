import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('edara_token'));
  const [user, setUser] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem('edara_user') || 'null');
    if (storedUser && storedUser.role) {
      let norm = storedUser.role.toLowerCase().replace(' ', '_');
      if (norm === 'admin') norm = 'it_admin';
      storedUser.role = norm;
    }
    return storedUser;
  });

  const login = async (employeeId, password) => {
    try {
      const response = await fetch('http://localhost:4000/api/auth/device-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_code: employeeId, password }),
      });
      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }
      const data = await response.json();
      if (data.user && data.user.role) {
        let norm = data.user.role.toLowerCase().replace(' ', '_');
        if (norm === 'admin') norm = 'it_admin';
        data.user.role = norm;
      }
      setToken(data.token);
      localStorage.setItem('edara_token', data.token);
      localStorage.setItem('edara_user', JSON.stringify(data.user));
      // The backend should return the user details including role
      setUser(data.user);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('edara_token');
    localStorage.removeItem('edara_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
