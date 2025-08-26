// src/pages/AdminUsers.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const AdminUsers = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'cliente' });
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState(false);

  const fetchUsers = useCallback(() => {
    fetch('http://192.168.1.80:8000/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setUsers)
      .catch(() => setError(true));
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const url = editId
      ? `http://192.168.1.80:8000/api/users/${editId}`
      : 'http://192.168.1.80:8000/api/users';
    const method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(data.message || 'Operación realizada');
        setError(false);
        setForm({ name: '', email: '', password: '', role: 'cliente' });
        setEditId(null);
        fetchUsers();
      })
      .catch(() => {
        setMensaje('Error en la operación');
        setError(true);
      });
  };

  const handleEdit = user => {
    setEditId(user._id);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setMensaje('');
  };

  const handleDelete = id => {
    if (!window.confirm('¿Eliminar usuario?')) return;
    fetch(`http://192.168.1.80:8000/api/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(data.message);
        setError(false);
        fetchUsers();
      })
      .catch(() => {
        setMensaje('Error al eliminar');
        setError(true);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={styles.pageContainer}>
      {/* Navbar */}
      <header style={styles.navbar}>
        <div style={styles.logo}>UrbanStyle - Admin</div>
        <nav style={styles.navLinks}>
          <Link
            to="/dashboard-admin"
            style={{
              ...styles.navLink,
              ...(location.pathname === '/dashboard-admin' ? styles.activeLink : {}),
            }}
          >
            Inicio
          </Link>
          <Link
            to="/admin/users"
            style={{
              ...styles.navLink,
              ...(location.pathname === '/admin/users' ? styles.activeLink : {}),
            }}
          >
            Usuarios
          </Link>
          <Link
            to="/admin/products"
            style={{
              ...styles.navLink,
              ...(location.pathname === '/admin/products' ? styles.activeLink : {}),
            }}
          >
            Productos
          </Link>
          <Link
            to="/ventas"
            style={{
              ...styles.navLink,
              ...(location.pathname === '/ventas' ? styles.activeLink : {}),
            }}
          >
            Ventas
          </Link>
        </nav>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </header>

      {/* Main content */}
      <main style={styles.mainContent}>
        <h1 style={styles.title}>{editId ? 'Editar Usuario' : 'Crear Usuario'}</h1>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="name"
            placeholder="Nombre"
            value={form.name}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            name="email"
            type="email"
            placeholder="Correo"
            value={form.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            style={styles.input}
          >
            <option value="cliente">Cliente</option>
            <option value="vendedor">Vendedor</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" style={styles.submitButton}>
            {editId ? 'Actualizar' : 'Crear'}
          </button>
        </form>

        {mensaje && (
          <p style={{ ...styles.message, color: error ? '#dc3545' : '#28a745' }}>
            {mensaje}
          </p>
        )}

        <section style={{ marginTop: 40 }}>
          <h2 style={{ marginBottom: 20 }}>Usuarios existentes</h2>
          {users.length === 0 ? (
            <p>No hay usuarios disponibles.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Correo</th>
                  <th style={styles.th}>Rol</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u._id}
                    style={{ backgroundColor: i % 2 === 0 ? '#fafafa' : 'white' }}
                  >
                    <td style={styles.td}>{u.name}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>{u.role}</td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => handleEdit(u)}>Editar</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(u._id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
};

const styles = {
  pageContainer: {
    fontFamily: "'Poppins', sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    paddingBottom: 40,
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111',
    padding: '15px 30px',
    color: 'white',
    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
    position: 'sticky',
    top: 0,
    zIndex: 999,
  },
  logo: {
    fontWeight: '900',
    fontSize: '1.4rem',
    letterSpacing: '1px',
  },
  navLinks: {
    display: 'flex',
    gap: '18px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    padding: '8px 14px',
    borderRadius: 6,
    transition: 'all 0.3s ease',
  },
  activeLink: {
    backgroundColor: '#ff8c00',
    color: 'white',
    boxShadow: '0 3px 8px rgba(255,140,0,0.3)',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    border: 'none',
    padding: '10px 16px',
    borderRadius: 6,
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  mainContent: {
    maxWidth: 960,
    margin: '30px auto',
    padding: '25px',
    backgroundColor: 'white',
    borderRadius: 10,
    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#ff8c00',
    marginBottom: 25,
    fontSize: '1.8rem',
    fontWeight: '700',
  },
  form: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  input: {
    flex: '1 1 220px',
    padding: '10px',
    fontSize: 15,
    borderRadius: 6,
    border: '1px solid #ccc',
  },
  submitButton: {
    backgroundColor: '#ff8c00',
    color: 'white',
    fontWeight: '600',
    border: 'none',
    borderRadius: 6,
    padding: '10px 24px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  message: {
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '600',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    borderRadius: 8,
    overflow: 'hidden',
  },
  th: {
    borderBottom: '2px solid #ddd',
    textAlign: 'left',
    padding: '12px 10px',
    backgroundColor: '#f2f2f2',
  },
  td: {
    padding: '10px',
  },
  editBtn: {
    marginRight: 8,
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    padding: '6px 12px',
    cursor: 'pointer',
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    padding: '6px 12px',
    cursor: 'pointer',
  },
};

export default AdminUsers;
