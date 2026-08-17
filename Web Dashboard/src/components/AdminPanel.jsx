import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export default function AdminPanel({ token }) {
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
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

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:4000/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setFormData({
      employee_code: user.employee_code,
      full_name: user.full_name,
      password_hash: '', // Leave blank when editing unless changing
      role: user.role || 'guard',
      mobile_number: user.mobile_number || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`http://${window.location.hostname}:4000/api/users/${id}`, {
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
      const url = editingUserId ? `http://${window.location.hostname}:4000/api/users/${editingUserId}` : `http://${window.location.hostname}:4000/api/users`;
      
      const payload = { ...formData };
      if (editingUserId) delete payload.employee_code; // Usually don't update employee code
      
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
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2>Admin Panel - User Management</h2>
        <button className="btn-primary" onClick={() => {
          setEditingUserId(null);
          setFormData({ employee_code: '', full_name: '', password_hash: '', role: 'guard', mobile_number: '' });
          setShowForm(!showForm);
        }}>
          {showForm ? 'Cancel' : 'Add New User'}
        </button>
      </div>

      {showForm && (
        <div className="edara-card" style={{ padding: '16px', marginBottom: '24px' }}>
          <h3>{editingUserId ? 'Edit User' : 'Create User'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' }}>
            {!editingUserId && (
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Employee Code</label>
                <input required type="text" className="edara-input" value={formData.employee_code} onChange={e => setFormData({...formData, employee_code: e.target.value})} />
              </div>
            )}
            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}>Full Name</label>
              <input required type="text" className="edara-input" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            {!editingUserId && (
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Password</label>
                <input required={!editingUserId} type="password" className="edara-input" value={formData.password_hash} onChange={e => setFormData({...formData, password_hash: e.target.value})} />
              </div>
            )}
            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}>Role</label>
              <select className="edara-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="guard">Guard</option>
                <option value="supervisor">Supervisor</option>
                <option value="security head">Security Head</option>
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}>Mobile Number</label>
              <input required type="number" className="edara-input" value={formData.mobile_number} onChange={e => setFormData({...formData, mobile_number: e.target.value})} />
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary">Save User</button>
            </div>
          </form>
        </div>
      )}

      <div style={tableContainerStyle}>
        {loading ? <p>Loading...</p> : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Employee Code</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Mobile</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={trStyle}>
                  <td>{u.id}</td>
                  <td>{u.employee_code}</td>
                  <td>{u.full_name}</td>
                  <td>{u.role}</td>
                  <td>{u.mobile_number}</td>
                  <td>
                    <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '12px', marginRight: '8px', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }} onClick={() => handleEdit(u)}>Edit</button>
                    <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '12px', background: 'transparent', border: '1px solid var(--red-rec)', color: 'var(--red-rec)' }} onClick={() => handleDelete(u.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const containerStyle = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  color: 'var(--text-light)',
  overflowY: 'auto'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px'
};

const tableContainerStyle = {
  background: 'var(--bg-panel)',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  padding: '16px',
  flex: 1
};

const tableStyle = {
  width: '100%',
  textAlign: 'left',
  borderCollapse: 'collapse'
};

const trStyle = {
  borderBottom: '1px solid var(--border-color)'
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '14px',
  color: 'var(--text-muted)'
};
