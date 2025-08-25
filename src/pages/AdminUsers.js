// src/pages/AdminUsers.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminUsers = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'cliente' });
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const fetchUsers = useCallback(() => {
    fetch('http://localhost:8000/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
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
      ? `http://localhost:8000/api/users/${editId}`
      : 'http://localhost:8000/api/users';
    const method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(data.message || 'Operación realizada');
        setForm({ name: '', email: '', password: '', role: 'cliente' });
        setEditId(null);
        fetchUsers();
      })
      .catch(() => setMensaje('Error en la operación'));
  };

  const handleEdit = user => {
    setEditId(user._id);
    setForm({ name: user.name, email: user.email, password: '', role: user.role });
    setMensaje('');
  };

  const handleDelete = id => {
    if (!window.confirm('¿Eliminar usuario?')) return;
    fetch(`http://localhost:8000/api/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(data.message);
        fetchUsers();
      })
      .catch(() => setMensaje('Error al eliminar'));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={styles.pageContainer}>
      {/* Navbar */}
      <header style={styles.navbar}>
        <div style={styles.logo}>MiSistema</div>
        <nav style={styles.navLinks}>
           <Link to="/dashboard-admin" style={styles.navLink}>Inicio</Link>  {/* este va al dashboard */}
          <Link to="/admin/users" style={{ ...styles.navLink, fontWeight: '700', textDecoration: 'underline' }}>Usuarios</Link>
          <Link to="/admin/products" style={styles.navLink}>Productos</Link>
          <Link to="/ventas" style={styles.navLink}>Ventas</Link>
          
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
            style={{ ...styles.input, paddingRight: 10 }}
          >
            <option value="cliente">Cliente</option>
            <option value="vendedor">Vendedor</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" style={styles.submitButton}>
            {editId ? 'Actualizar' : 'Crear'}
          </button>
        </form>
        {mensaje && <p style={styles.message}>{mensaje}</p>}

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
                {users.map(u => (
                  <tr key={u._id}>
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
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
    paddingBottom: 40,
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007bff',
    padding: '0 20px',
    height: 60,
    color: 'white',
  },
  logo: {
    fontWeight: '700',
    fontSize: '1.5rem',
  },
  navLinks: {
    display: 'flex',
    gap: '25px',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'color 0.3s ease',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '4px',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  mainContent: {
    maxWidth: 960,
    margin: '40px auto',
    padding: '0 20px',
    backgroundColor: 'white',
    borderRadius: 8,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    color: '#007bff',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  input: {
    flex: '1 1 250px',
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  submitButton: {
    backgroundColor: '#007bff',
    color: 'white',
    fontWeight: '600',
    border: 'none',
    borderRadius: 4,
    padding: '10px 30px',
    cursor: 'pointer',
    alignSelf: 'center',
  },
  message: {
    textAlign: 'center',
    marginTop: 15,
    color: '#28a745',
    fontWeight: '600',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    borderBottom: '2px solid #ddd',
    textAlign: 'left',
    padding: '12px 10px',
  },
  td: {
    borderBottom: '1px solid #eee',
    padding: '10px',
  },
  editBtn: {
    marginRight: 8,
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    padding: '6px 14px',
    cursor: 'pointer',
  },
  deleteBtn: {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    padding: '6px 14px',
    cursor: 'pointer',
  },
};

export default AdminUsers;
