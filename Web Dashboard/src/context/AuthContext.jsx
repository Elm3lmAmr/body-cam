import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('edara_token'));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('edara_user') || 'null'));

  const login = (tkn, usr) => {
    localStorage.setItem('edara_token', tkn);
    localStorage.setItem('edara_user', JSON.stringify(usr));
    setToken(tkn);
    setUser(usr);
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
