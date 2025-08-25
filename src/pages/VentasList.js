import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const VentasList = ({ token }) => {
  const navigate = useNavigate();
  const [ventas, setVentas] = useState([]);
  const [ubicacion, setUbicacion] = useState(null);
  const [loadingUbicacion, setLoadingUbicacion] = useState(true);
  const [errorUbicacion, setErrorUbicacion] = useState(false);

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Fetch ventas
  useEffect(() => {
    fetch('http://10.142.55.114:8000/api/ventas', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setVentas(data);
        else {
          console.error("Respuesta inesperada:", data);
          setVentas([]);
        }
      })
      .catch(err => {
        console.error(err);
        setVentas([]);
      });
  }, [token]);

  // Fetch ubicación
  useEffect(() => {
    fetch('http://localhost:5000/api/ubicacion')
      .then(res => {
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setUbicacion(data);
        setLoadingUbicacion(false);
      })
      .catch(err => {
        console.error('Error cargando ubicación:', err);
        setErrorUbicacion(true);
        setLoadingUbicacion(false);
      });
  }, []);

  return (
    <div style={styles.pageContainer}>
      {/* Navbar */}
      <header style={styles.navbar}>
        <div style={styles.logo}>MiSistema</div>
        <nav style={styles.navLinks}>
           <Link to="/dashboard-admin" style={styles.navLink}>Inicio</Link>  {/* este va al dashboard */}
          <Link to="/admin/users" style={styles.navLink}>Usuarios</Link>
          <Link to="/admin/products" style={styles.navLink}>Productos</Link>
          <Link to="/ventas" style={{ ...styles.navLink, fontWeight: '700', textDecoration: 'underline' }}>Ventas</Link>
       
        </nav>
        <button onClick={handleLogout} style={styles.logoutButton}>Cerrar Sesión</button>
      </header>

      {/* Main Content */}
      <main style={styles.mainContent}>
        <h1 style={styles.title}>Listado de Ventas</h1>

        {loadingUbicacion && <p>Cargando ubicación de la tienda...</p>}
        {errorUbicacion && <p style={{ color: 'red' }}>Error cargando ubicación.</p>}

        {ventas.length === 0 ? (
          <p>No hay ventas registradas.</p>
        ) : (
          ventas.map(v => (
            <div key={v._id} style={styles.ventaCard}>
              <p><b>Fecha:</b> {new Date(v.fecha).toLocaleDateString()}</p>
              <p><b>Vendedor:</b> {v.id_vendedor?.name || 'N/A'}</p>
              <p><b>Cliente:</b> {v.id_cliente?.name || 'N/A'}</p>
              <p><b>Productos:</b></p>
              <ul>
                {Array.isArray(v.productos) && v.productos.map(p => (
                  <li key={p.id_producto}>
                    {p.descripcion} - Cantidad: {p.cantidad} - Precio: ${p.price.toFixed(2)}
                  </li>
                ))}
              </ul>

              <p style={{ fontSize: '0.9em', color: '#555', marginBottom: 4 }}>Ubicación de la tienda:</p>

              {ubicacion && (
                <div style={styles.mapContainer}>
                  <iframe
                    title="Mapa dinámico de la tienda"
                    width="100%"
                    height="300%"
                    style={{ border: 'none' }}
                    loading="lazy"
                    src={`https://www.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}&hl=es&z=15&output=embed`}
                  />
                </div>
              )}
            </div>
          ))
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
    cursor: 'pointer',
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
  mainContent: {
    maxWidth: 960,
    margin: '40px auto',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: 8,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#007bff',
    marginBottom: 30,
  },
  ventaCard: {
    border: '1px solid #ddd',
    padding: 15,
    marginBottom: 20,
    borderRadius: 6,
    backgroundColor: '#fafafa',
  },
  mapContainer: {
    width: 300,
    height: 150,
    border: '1px solid #ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
};

export default VentasList;
