import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ReporteVentas from './ReporteVentas';

const DashboardAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    paddingBottom: 40,
  },
  navbar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111111',
    padding: '15px 30px',
    color: 'white',
    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
    position: 'sticky',
    top: 0,
    zIndex: 999,
  },
  logo: {
    fontWeight: '900',
    fontSize: '1.6rem',
    letterSpacing: '2px',
    textShadow: '1px 1px 6px rgba(255,255,255,0.2)',
    flex: '1 1 auto',
  },
  navLinks: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '18px',
    justifyContent: 'center',
    flex: '2 1 auto',
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '1rem',
    padding: '10px 16px',
    borderRadius: 8,
    transition: 'all 0.3s ease',
  },
  activeLink: {
    backgroundColor: '#ff8c00',
    color: '#fff',
    boxShadow: '0 3px 8px rgba(255,140,0,0.4)',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    border: 'none',
    padding: '10px 18px',
    borderRadius: 6,
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flex: '1 1 auto',
    maxWidth: '140px',
    marginTop: '5px',
  },
  mainContent: {
    maxWidth: 960,
    margin: '30px auto',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: 12,
    boxShadow: '0 5px 20px rgba(0,0,0,0.07)',
  },
  title: {
    textAlign: 'center',
    color: '#ff8c00',
    marginBottom: 25,
    fontSize: '2rem',
    fontWeight: '800',
    textShadow: '1px 1px 5px rgba(0,0,0,0.2)',
  },
  welcomeSection: {
    fontSize: '1rem',
    color: '#555',
    lineHeight: 1.6,
    marginBottom: 25,
    padding: '10px 0',
  },
};

// Media Queries con CSS dinámico
const styleSheet = document.styleSheets[0];
styleSheet.insertRule(`
  @media (max-width: 768px) {
    header {
      flex-direction: column !important;
      align-items: center !important;
      text-align: center;
    }
    nav {
      margin-top: 12px;
      flex-direction: column !important;
      gap: 10px !important;
    }
    button {
      margin-top: 15px !important;
    }
  }
`, styleSheet.cssRules.length);

export default DashboardAdmin;
