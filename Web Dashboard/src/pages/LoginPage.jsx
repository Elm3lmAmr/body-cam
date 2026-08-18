import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [role, setRole] = useState('operator');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!employeeId || !password) return;
    
    // Call the actual auth context login (requires backend update)
    try {
      await login(employeeId, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div className="brand-name">SSOP <span>Command Center</span></div>
        </div>
        
        <h1 className="login-title">Control Room Access</h1>
        <p className="login-sub">Authenticate to connect to the unified security grid.</p>
        
        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Select Role</label>
            <div className="login-role">
              <div 
                className={`role-chip ${role === 'operator' ? 'active' : ''}`}
                onClick={() => setRole('operator')}
              >Operator</div>
              <div 
                className={`role-chip ${role === 'supervisor' ? 'active' : ''}`}
                onClick={() => setRole('supervisor')}
              >Supervisor</div>
              <div 
                className={`role-chip ${role === 'manager' ? 'active' : ''}`}
                onClick={() => setRole('manager')}
              >Manager</div>
              <div 
                className={`role-chip ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >IT Admin</div>
            </div>
          </div>
          
          <div className="field">
            <label>Employee ID</label>
            <input 
              type="text" 
              placeholder="e.g. OP-1042" 
              value={employeeId} 
              onChange={e => setEmployeeId(e.target.value)} 
            />
          </div>
          
          <div className="field">
            <label>Access Key</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          {error && <div style={{ color: 'var(--red)', fontSize: '12px', marginBottom: '10px' }}>{error}</div>}
          
          <button type="submit" className="btn-primary">Initialize Link</button>
        </form>
      </div>
    </div>
  );
}
