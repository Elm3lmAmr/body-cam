import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import LiveStreamsPage from './LiveStreamsPage';
import GuardsPage from './GuardsPage';
import IncidentsPage from './IncidentsPage';
import RecordingsPage from './RecordingsPage';
import ReportsPage from './ReportsPage';
import AdminPage from './AdminPage';

export default function AppShell() {
  const { user, logout } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  // If no user, show login page
  if (!user) {
    return <LoginPage />;
  }

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <div className={`app shown`}>
      <div className={`backdrop ${menuOpen ? 'on' : ''}`} onClick={() => setMenuOpen(false)}></div>
      
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-head">
          <div className="brand-mark">S</div>
          <div className="brand-name">SSOP</div>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-group-label">Operations</div>
          
          <div className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => { setActivePage('dashboard'); setMenuOpen(false); }}>
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h5v6H2V2zm7 0h5v3H9V2zM2 10h5v4H2v-4zm7-3h5v7H9V7z"/></svg>
            <span>Dashboard</span>
          </div>
          
          <div className={`nav-item ${activePage === 'streams' ? 'active' : ''}`} onClick={() => { setActivePage('streams'); setMenuOpen(false); }}>
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M1 3h10v10H1V3zm11 2l3-2v10l-3-2V5z"/></svg>
            <span>Live streams</span>
          </div>
          
          <div className={`nav-item ${activePage === 'guards' ? 'active' : ''}`} onClick={() => { setActivePage('guards'); setMenuOpen(false); }}>
            <svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3 2.5-5 6-5s6 2 6 5v1H2v-1z"/></svg>
            <span>Guards</span>
          </div>
          
          <div className={`nav-item ${activePage === 'incidents' ? 'active' : ''}`} onClick={() => { setActivePage('incidents'); setMenuOpen(false); }}>
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1L1 14h14L8 1zm0 4v4M8 11v1"/></svg>
            <span>Incidents</span>
          </div>
          
          {['it_admin', 'supervisor'].includes(user.role) && (
            <div className={`nav-item ${activePage === 'recordings' ? 'active' : ''}`} onClick={() => { setActivePage('recordings'); setMenuOpen(false); }}>
              <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="3" width="14" height="10" rx="1"/><circle cx="8" cy="8" r="2" fill="var(--panel)"/></svg>
              <span>Recordings</span>
            </div>
          )}

          {['it_admin', 'manager'].includes(user.role) && (
            <>
              <div className="nav-group-label">Analytics</div>
              <div className={`nav-item ${activePage === 'reports' ? 'active' : ''}`} onClick={() => { setActivePage('reports'); setMenuOpen(false); }}>
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 13h12v1H2v-1zM3 11V6h2v5H3zm4 0V3h2v8H7zm4 0V8h2v3h-2z"/></svg>
                <span>Reports</span>
              </div>
            </>
          )}

          {user.role === 'it_admin' && (
            <>
              <div className="nav-group-label">Administration</div>
              <div className={`nav-item ${activePage === 'users' ? 'active' : ''}`} onClick={() => { setActivePage('users'); setMenuOpen(false); }}>
                <svg viewBox="0 0 16 16" fill="currentColor"><circle cx="6" cy="5" r="3"/><path d="M0 14c0-3 2-5 6-5s6 2 6 5v1H0v-1z"/><circle cx="12" cy="4" r="2"/></svg>
                <span>Users &amp; roles</span>
              </div>
              
              <div className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => { setActivePage('settings'); setMenuOpen(false); }}>
                <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 5a3 3 0 100 6 3 3 0 000-6zm7 3l-2-.5-.5-1.2 1-1.8-1.5-1.5-1.8 1-1.2-.5L8.5 1h-1L7 2.5l-1.2.5-1.8-1L2.5 3.5l1 1.8L3 6.5 1 7v2l2 .5.5 1.2-1 1.8 1.5 1.5 1.8-1 1.2.5.5 1.5h1l.5-1.5 1.2-.5 1.8 1 1.5-1.5-1-1.8.5-1.2L15 9V8z"/></svg>
                <span>Settings</span>
              </div>
            </>
          )}
        </nav>
        
        <div className="sidebar-foot">
          <div className="avatar">
            {user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'SA'}
          </div>
          <div className="user-meta">
            <div className="name">{user?.name || 'Sara Al-Amin'}</div>
            <div className="role" style={{ textTransform: 'capitalize' }}>{user?.role ? user.role.replace('_', ' ') : 'Operator'}</div>
          </div>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <button className="icon-btn menu-toggle" onClick={toggleMenu}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor"><path d="M2 3h12v2H2V3zm0 4h12v2H2V7zm0 4h12v2H2v-2z"/></svg>
          </button>
          <div className="topbar-title">
            {activePage.charAt(0).toUpperCase() + activePage.slice(1)} 
            <span className="crumb">/ Overview</span>
          </div>
          
          <div className="topbar-actions">
            <div className="status-live">SYS ONLINE</div>
            <div className="clock">{new Date().toLocaleTimeString()}</div>
            <button className="icon-btn">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a5 5 0 00-5 5v3l-2 2v1h14v-1l-2-2V6a5 5 0 00-5-5zM6 13a2 2 0 004 0H6z"/></svg>
              <span className="dot"></span>
            </button>
            <button className="icon-btn" onClick={logout}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M6 2h6v12H6v-2h4V4H6V2zM3 8l3-3v2h4v2H6v2L3 8z"/></svg>
            </button>
          </div>
        </div>

        <div className="content">
          {activePage === 'dashboard' && <DashboardPage />}
          {activePage === 'streams' && <LiveStreamsPage />}
          {activePage === 'guards' && <GuardsPage />}
          {activePage === 'incidents' && <IncidentsPage />}
          {activePage === 'recordings' && ['it_admin', 'supervisor'].includes(user.role) ? <RecordingsPage /> : null}
          {activePage === 'reports' && ['it_admin', 'manager'].includes(user.role) ? <ReportsPage /> : null}
          {activePage === 'users' && user.role === 'it_admin' ? <AdminPage /> : null}
          {activePage === 'settings' && user.role === 'it_admin' ? <div>Settings coming soon</div> : null}
        </div>
      </div>
    </div>
  );
}
