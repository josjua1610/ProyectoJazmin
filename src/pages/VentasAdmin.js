import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const VentasAdmin = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/ventas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Error al cargar ventas');
        const data = await res.json();
        setVentas(data);
        setError('');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVentas();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <p style={styles.loading}>Cargando ventas...</p>;
  if (error) return <p style={{ ...styles.loading, color: 'red' }}>{error}</p>;

  return (
    <div style={styles.pageContainer}>
      {/* Navbar */}
      <header style={styles.navbar}>
        <div style={styles.logo}>MiSistema</div>
        <nav style={styles.navLinks}>
          <Link to="/dashboard-admin" style={styles.navLink}>Inicio</Link>
          <Link to="/admin/users" style={styles.navLink}>Usuarios</Link>
          <Link to="/admin/products" style={styles.navLink}>Productos</Link>
          <Link to="/ventas" style={styles.navLink}>Ventas</Link>
        </nav>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </header>

      {/* Main Content */}
      <main style={styles.container}>
        <h1 style={styles.title}>Ventas registradas</h1>
        {ventas.length === 0 ? (
          <p>No hay ventas registradas.</p>
        ) : (
          ventas.map(venta => {
            const totalVenta = venta.productos.reduce(
              (sum, p) => sum + (p.price * p.cantidad),
              0
            );
            return (
              <div key={venta._id} style={styles.card}>
                <p><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleDateString()}</p>
                <p><strong>Cliente:</strong> {venta.id_cliente?.name || 'No encontrado'}</p>
                <p><strong>Vendedor:</strong> {venta.id_vendedor?.name || 'No encontrado'}</p>
                <p><strong>Productos:</strong></p>
                <ul>
                  {venta.productos.map(p => (
                    <li key={p.id_producto}>
                      {p.descripcion} - Cantidad: {p.cantidad} - Precio: ${p.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p style={styles.total}><strong>Total venta:</strong> ${totalVenta.toFixed(2)}</p>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

const styles = {
  pageContainer: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007bff',
    padding: '0 20px',
    height: 60,
    color: 'white',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  logo: {
    fontWeight: '700',
    fontSize: '1.5rem',
  },
  navLinks: {
    display: 'flex',
    gap: 25,
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
    borderRadius: 4,
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  container: {
    maxWidth: 900,
    margin: '100px auto 40px', // margin-top para que no quede detrás del navbar fijo
    padding: 20,
    color: '#333',
    backgroundColor: 'white',
    borderRadius: 8,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    color: '#007bff',
    fontWeight: '700',
    fontSize: '2rem',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  total: {
    marginTop: 10,
    fontWeight: '700',
    fontSize: '1.1rem',
    color: '#007bff',
  },
  loading: {
    marginTop: 100,
    textAlign: 'center',
    fontSize: '1.2rem',
  }
};

export default VentasAdmin;
