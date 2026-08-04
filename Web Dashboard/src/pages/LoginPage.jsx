import { useState } from 'react';
import { ShieldCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginSupervisor } from '../api/authApi';

export default function LoginPage() {
  const { login } = useAuth();
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!employeeCode.trim() || !password.trim()) {
      setError('Please enter your employee code and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { token, user } = await loginSupervisor(employeeCode.trim(), password);
      login(token, user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Subtle background grid */}
      <div style={styles.bgGrid} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <img
            src="/edara_logo.png"
            alt="Edara"
            style={styles.logo}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <span style={styles.logoFallback}>EDARA</span>
        </div>

        {/* Shield icon + title */}
        <div style={styles.headerRow}>
          <ShieldCheck size={32} color="#4BB8FA" strokeWidth={1.8} />
          <div style={styles.titleBlock}>
            <h1 style={styles.title}>Supervisor Command Center</h1>
            <p style={styles.subtitle}>Sodic Guard Connect — Live Intelligence</p>
          </div>
        </div>

        <div style={styles.divider} />

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form} autoComplete="off">
          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="emp-code">Employee Code</label>
            <input
              id="emp-code"
              className="edara-input"
              type="text"
              placeholder="e.g. SP001"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label} htmlFor="password">Password</label>
            <div style={styles.pwWrap}>
              <input
                id="password"
                className="edara-input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                style={styles.eyeBtn}
                onClick={() => setShowPw((v) => !v)}
                tabIndex={-1}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff size={16} color="#7A9BB5" /> : <Eye size={16} color="#7A9BB5" />}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={15} color="#FF3B3B" />
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: 4, height: 46, fontSize: 16 }}
          >
            {loading ? (
              <span style={styles.loadingRow}>
                <span style={styles.spinner} />
                Authenticating…
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p style={styles.footer}>
          Edara Security Platform · Supervisors Only
        </p>
      </div>
    </div>
  );
}

/* ---- Inline styles ---- */
const styles = {
  page: {
    minHeight: '100vh',
    background: '#0D1B2A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bgGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(44,94,173,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(44,94,173,0.07) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    background: '#111D2E',
    border: '1px solid #2C5EAD',
    borderRadius: 16,
    boxShadow: '0 0 40px rgba(21,145,220,0.2), 0 0 80px rgba(21,145,220,0.08)',
    padding: '40px 36px 32px',
    width: '100%',
    maxWidth: 440,
    animation: 'fade-in 0.4s ease',
  },
  logoWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  logo: {
    height: 52,
    objectFit: 'contain',
  },
  logoFallback: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: '0.15em',
    color: '#4BB8FA',
    textShadow: '0 0 20px rgba(75,184,250,0.5)',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#E8F4FD',
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#7A9BB5',
    marginTop: 2,
    letterSpacing: '0.03em',
  },
  divider: {
    height: 1,
    background: 'linear-gradient(90deg, transparent, #2C5EAD, transparent)',
    margin: '20px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: '#7A9BB5',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  pwWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
    display: 'flex',
    alignItems: 'center',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'rgba(255,59,59,0.08)',
    border: '1px solid rgba(255,59,59,0.3)',
    borderRadius: 8,
    padding: '10px 12px',
  },
  errorText: {
    color: '#FF3B3B',
    fontSize: 13,
  },
  loadingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  spinner: {
    display: 'inline-block',
    width: 16,
    height: 16,
    border: '2px solid rgba(232,244,253,0.3)',
    borderTop: '2px solid #E8F4FD',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 11,
    color: '#3d5a73',
    letterSpacing: '0.04em',
  },
};
