import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({
    employee_code: '',
    full_name: '',
    password_hash: '',
    role: 'guard',
    mobile_number: ''
  });

  const fetchUsers = () => {
    fetch('http://localhost:4000/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formattedUsers = data.map(u => ({
            id: u.employee_code,
            dbId: u.id,
            name: u.full_name,
            role: u.role,
            mobile_number: u.mobile_number || 'N/A',
            lastLogin: u.last_login ? new Date(u.last_login).toLocaleString() : 'Never',
          }));
          setUsers(formattedUsers);
        } else {
          console.error("Expected array from /api/users, got:", data);
        }
      })
      .catch(err => console.error("Error fetching users:", err));
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleEdit = (user) => {
    setEditingUserId(user.dbId);
    setFormData({
      employee_code: user.id,
      full_name: user.name,
      password_hash: '',
      role: user.role || 'guard',
      mobile_number: user.mobile_number || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`http://localhost:4000/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingUserId ? 'PUT' : 'POST';
      const url = editingUserId ? `http://localhost:4000/api/users/${editingUserId}` : `http://localhost:4000/api/users`;
      
      const payload = { ...formData };
      if (editingUserId) delete payload.employee_code;
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      setShowForm(false);
      setEditingUserId(null);
      setFormData({ employee_code: '', full_name: '', password_hash: '', role: 'guard', mobile_number: '' });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="role-grid">
        <div className="role-card">
          <h4>Operator <span className="count">12</span></h4>
          <p>View streams, monitor dashboard, acknowledge alerts, and dispatch guards to low-priority incidents.</p>
        </div>
        <div className="role-card">
          <h4>Supervisor <span className="count">4</span></h4>
          <p>All Operator rights, plus close incidents, view recordings, and dispatch backups for critical alerts.</p>
        </div>
        <div className="role-card">
          <h4>Manager <span className="count">2</span></h4>
          <p>All Supervisor rights, plus view analytics reports, export evidence, and manage guard shifts.</p>
        </div>
        <div className="role-card">
          <h4>IT Admin <span className="count">1</span></h4>
          <p>Manage user accounts, assign roles, configure retention policies, and monitor system health.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="card-title">User Directory</div>
          <div className="card-action" style={{ cursor: 'pointer' }} onClick={() => {
            setEditingUserId(null);
            setFormData({ employee_code: '', full_name: '', password_hash: '', role: 'guard', mobile_number: '' });
            setShowForm(!showForm);
          }}>
            {showForm ? 'Cancel' : 'Add User'}
          </div>
        </div>

        {showForm && (
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
            <h4 style={{ marginBottom: '16px' }}>{editingUserId ? 'Edit User' : 'Create User'}</h4>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {!editingUserId && (
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>Employee Code</label>
                  <input required type="text" style={{ width: '100%', padding: '8px', background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }} value={formData.employee_code} onChange={e => setFormData({...formData, employee_code: e.target.value})} />
                </div>
              )}
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>Full Name</label>
                <input required type="text" style={{ width: '100%', padding: '8px', background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }} value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              {!editingUserId && (
                <div style={{ flex: '1 1 200px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>Password</label>
                  <input required={!editingUserId} type="password" style={{ width: '100%', padding: '8px', background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }} value={formData.password_hash} onChange={e => setFormData({...formData, password_hash: e.target.value})} />
                </div>
              )}
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>Role</label>
                <select style={{ width: '100%', padding: '8px', background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="guard">Guard</option>
                  <option value="operator">Operator</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="manager">Manager</option>
                  <option value="it_admin">IT Admin</option>
                </select>
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-dim)' }}>Mobile</label>
                <input required type="text" style={{ width: '100%', padding: '8px', background: 'var(--panel-2)', border: '1px solid var(--border)', color: 'var(--text)' }} value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} />
              </div>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ width: 'auto' }}>Save User</button>
              </div>
            </form>
          </div>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Role</th>
              <th>Mobile</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="mono">{u.id}</td>
                <td>{u.name}</td>
                <td><span style={{ textTransform: 'capitalize' }}>{u.role}</span></td>
                <td className="mono">{u.mobile_number}</td>
                <td className="mono">{u.lastLogin}</td>
                <td>
                  <button className="btn-sm" onClick={() => handleEdit(u)} style={{ marginRight: '8px' }}>Edit</button>
                  <button className="btn-sm" onClick={() => handleDelete(u.dbId)} style={{ background: 'var(--red)', borderColor: 'var(--red)' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
