// src/pages/AdminProducts.js
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminProducts = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ descripcion: '', price: '', stock: '' });
  const [editId, setEditId] = useState(null);
  const [mensaje, setMensaje] = useState('');

  const fetchProducts = useCallback(() => {
    fetch('http://192.168.1.65:8000/api/articles', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setProducts)
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    const url = editId
      ? `http://192.168.1.65:8000/api/articles/${editId}`
      : 'http://192.168.1.65:8000/api/articles';
    const method = editId ? 'PUT' : 'POST';

    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(data.message || 'Operación realizada');
        setForm({ descripcion: '', price: '', stock: '' });
        setEditId(null);
        fetchProducts();
      })
      .catch(() => setMensaje('Error en la operación'));
  };

  const handleEdit = product => {
    setEditId(product.id);
    setForm({ descripcion: product.descripcion, price: product.price, stock: product.stock });
    setMensaje('');
  };

  const handleDelete = id => {
    if (!window.confirm('¿Eliminar producto?')) return;
    fetch(`http://localhost:8000/api/articles/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        setMensaje(data.message);
        fetchProducts();
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
          <Link to="/admin/users" style={styles.navLink}>Usuarios</Link>
          <Link to="/admin/products" style={{ ...styles.navLink, fontWeight: '700', textDecoration: 'underline' }}>Productos</Link>
          <Link to="/ventas" style={styles.navLink}>Ventas</Link>
        
        </nav>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </header>

      {/* Main content */}
      <main style={styles.mainContent}>
        <h1 style={styles.title}>{editId ? 'Editar Producto' : 'Crear Producto'}</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="descripcion"
            placeholder="Descripción"
            value={form.descripcion}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            name="price"
            type="number"
            step="0.01"
            placeholder="Precio"
            value={form.price}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <input
            name="stock"
            type="number"
            placeholder="Stock"
            value={form.stock}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <button type="submit" style={styles.submitButton}>
            {editId ? 'Actualizar' : 'Crear'}
          </button>
        </form>
        {mensaje && <p style={styles.message}>{mensaje}</p>}

        <section style={{ marginTop: 40 }}>
          <h2 style={{ marginBottom: 20 }}>Productos existentes</h2>
          {products.length === 0 ? (
            <p>No hay productos disponibles.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Descripción</th>
                  <th style={styles.th}>Precio ($)</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td style={styles.td}>{p.descripcion}</td>
                    <td style={styles.td}>{Number(p.price).toFixed(2)}</td>
                    <td style={styles.td}>{p.stock}</td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => handleEdit(p)}>Editar</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>Eliminar</button>
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

export default AdminProducts;
