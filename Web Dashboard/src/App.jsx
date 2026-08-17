import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
