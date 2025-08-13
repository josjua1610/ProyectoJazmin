import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReporteVentas from './ReporteVentas';

const DashboardAdmin = () => {
  const navigate = useNavigate();

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
          <Link to="/dashboard-admin" style={styles.navLink}>Inicio</Link>
          <Link to="/admin/users" style={styles.navLink}>Usuarios</Link>
          <Link to="/admin/products" style={styles.navLink}>Productos</Link>
          <Link to="/ventas" style={styles.navLink}>Ventas</Link>
        </nav>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </header>

      {/* Main content */}
      <main style={styles.mainContent}>
        <h1 style={styles.title}>Panel de Administración</h1>
        <section style={styles.welcomeSection}>
          <h2>Bienvenido al panel de administración</h2>
          <p>
            Desde aquí puedes gestionar usuarios, productos, consultar ventas y reportes.
          </p>
        </section>
        <ReporteVentas />
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
    flexWrap: 'wrap', // Permite que los elementos bajen en móviles
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007bff',
    padding: '10px 15px',
    color: 'white',
  },
  logo: {
    fontWeight: '700',
    fontSize: '1.3rem',
    flex: '1 1 auto',
  },
  navLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '15px',
    justifyContent: 'center',
    flex: '2 1 auto',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    flex: '1 1 auto',
    maxWidth: '120px',
    marginTop: '5px',
  },
  mainContent: {
    maxWidth: '95%',
    margin: '20px auto',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: 8,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#007bff',
    marginBottom: 20,
    fontSize: '1.5rem',
  },
  welcomeSection: {
    fontSize: '1rem',
    color: '#333',
    lineHeight: 1.6,
  },
};

// Media Queries
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @media (max-width: 768px) {
    header {
      flex-direction: column !important;
      align-items: center !important;
      text-align: center;
    }
    nav {
      margin-top: 10px;
    }
  }
`, styleSheet.cssRules.length);

export default DashboardAdmin;
