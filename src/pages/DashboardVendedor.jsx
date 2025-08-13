import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
export const API_URL = 'http://192.168.1.65:8000/api';

const DashboardVendedor = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    
 fetch(`http://192.168.1.65:8000/api/ventas`, { // 👈 usamos getApiUrl()
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const idVendedor = payload.id;

        const ventasVendedor = data.filter(v => {
          const vendedorId = v.id_vendedor?._id || v.id_vendedor;
          return String(vendedorId) === String(idVendedor);
        });

        setVentas(ventasVendedor);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Función para generar PDF ticket
  const generarPDF = (venta) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Ticket de Venta', 14, 22);

    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleDateString()}`, 14, 32);
    doc.text(`Cliente: ${venta.id_cliente?.name || 'Cliente no encontrado'}`, 14, 40);
    doc.text(`Vendedor: ${venta.id_vendedor?.name || 'No encontrado'}`, 14, 48);

    doc.text('Productos:', 14, 58);

    let y = 66;
    venta.productos.forEach((p, i) => {
      const line = `${i + 1}. ${p.descripcion} - Cantidad: ${p.cantidad} - Precio unitario: $${p.price.toFixed(2)} - Subtotal: $${(p.cantidad * p.price).toFixed(2)}`;
      doc.text(line, 14, y);
      y += 8;
    });

    const total = venta.productos.reduce((sum, p) => sum + p.cantidad * p.price, 0);
    doc.text(`Total de la venta: $${total.toFixed(2)}`, 14, y + 8);

    doc.save(`ticket-venta-${venta._id}.pdf`);
  };

  if (!token) {
    return (
      <div style={styles.container}>
        <h1>Panel Vendedor</h1>
        <p style={styles.error}>No has iniciado sesión.</p>
      </div>
    );
  }

  return (
    <>
      {/* Navbar */}
      <header style={styles.navbar}>
        <div style={styles.logo}>MiSistema</div>
        <nav style={styles.navLinks}>
          <Link to="/crear-venta" style={styles.navLink}>Generar venta</Link>
          {/* Agrega más links si quieres */}
        </nav>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </header>

      {/* Contenido principal */}
      <div style={{ ...styles.container, marginTop: 80 }}>
        <h1 style={styles.title}>Panel Vendedor</h1>
        <h2 style={styles.subtitle}>Ventas realizadas</h2>

        {loading ? (
          <p>Cargando ventas...</p>
        ) : ventas.length === 0 ? (
          <p>No tienes ventas registradas.</p>
        ) : (
          ventas.map((venta) => {
            const totalVenta = venta.productos.reduce((sum, p) => sum + (p.price * p.cantidad), 0);
            return (
              <div key={venta._id} style={styles.ventaCard}>
                <p><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleDateString()}</p>
                <p><strong>Cliente:</strong> {venta.id_cliente?.name || 'Cliente no encontrado'}</p>
                <p><strong>Productos:</strong></p>
                <ul>
                  {venta.productos.map((p) => (
                    <li key={p.id_producto}>
                      {p.descripcion} - Cantidad: {p.cantidad} - Precio: ${p.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p style={styles.total}><strong>Total de la venta:</strong> ${totalVenta.toFixed(2)}</p>
                <button
                  style={styles.pdfButton}
                  onClick={() => generarPDF(venta)}
                >
                  Descargar ticket PDF
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

const styles = {
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
  container: {
    maxWidth: 900,
    margin: '20px auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '0 15px',
    color: '#333',
  },
  title: {
    textAlign: 'center',
    color: '#007bff',
    marginBottom: 20,
    fontWeight: '700',
    fontSize: '2rem',
  },
  subtitle: {
    marginTop: 30,
    marginBottom: 15,
    fontSize: '1.5rem',
    borderBottom: '2px solid #007bff',
    paddingBottom: 8,
  },
  ventaCard: {
    border: '1px solid #ddd',
    borderRadius: 6,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fafafa',
  },
  total: {
    fontWeight: '700',
    fontSize: '1.1rem',
    color: '#007bff',
    marginTop: 10,
  },
  pdfButton: {
    marginTop: 10,
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '8px 14px',
    borderRadius: 5,
    cursor: 'pointer',
    fontWeight: '600',
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
};

export default DashboardVendedor;
