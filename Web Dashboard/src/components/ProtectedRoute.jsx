import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';

/**
 * Renders children only when a valid auth token is present.
 * Falls back to LoginPage otherwise.
 */
export default function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <LoginPage />;
}
