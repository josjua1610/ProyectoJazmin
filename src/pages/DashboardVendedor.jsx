import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';

export const API_URL = 'http://192.168.1.80:8000/api';

const DashboardVendedor = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hover, setHover] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // ✅ función para obtener ventas
  const fetchVentas = useCallback(() => {
    if (!token) return;

    setLoading(true);
    fetch(`${API_URL}/ventas`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setVentas(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchVentas(); // cargar ventas al montar
  }, [fetchVentas]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const generarPDF = (venta) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Ticket de Venta', 14, 22);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date(venta.fecha).toLocaleString()}`, 14, 32);
    doc.text(`Cliente: ${venta.id_cliente?.name || 'Cliente no encontrado'}`, 14, 40);
    doc.text(`Vendedor: ${venta.id_vendedor?.name || 'Tú'}`, 14, 48);
    doc.text('Productos:', 14, 58);

    let y = 66;
    venta.productos.forEach((p, i) => {
      const line = `${i + 1}. ${p.descripcion || p.product_id} - Cantidad: ${p.cantidad} - Precio unitario: $${p.price.toFixed(2)} - Subtotal: $${(p.cantidad * p.price).toFixed(2)}`;
      doc.text(line, 14, y);
      y += 8;
    });

    const total = venta.productos.reduce((sum, p) => sum + p.cantidad * p.price, 0);
    doc.text(`Total de la venta: $${total.toFixed(2)}`, 14, y + 8);
    doc.save(`ticket-venta-${venta._id}.pdf`);
  };

  return (
    <>
      <header style={styles.navbar}>
        <div style={styles.logo}>UrbanStyle</div>
        <nav style={styles.navLinks}>
          <Link
            to="/crear-venta"
            style={{ ...styles.generateButton, ...(hover ? styles.generateButtonHover : {}) }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={() => fetchVentas()} // 🔹 refresca ventas al volver de crear
          >
            Generar venta
          </Link>
        </nav>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </header>

      <div style={{ ...styles.container, marginTop: 100 }}>
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
                <p><strong>Fecha:</strong> {new Date(venta.fecha).toLocaleString()}</p>
                <p><strong>Cliente:</strong> {venta.id_cliente?.name || 'Cliente no encontrado'}</p>
                <p><strong>Vendedor:</strong> {venta.id_vendedor?.name || 'Tú'}</p>
                <p><strong>Productos:</strong></p>
                <ul>
                  {venta.productos.map((p) => (
                    <li key={p.id_producto || p._id}>
                      {p.descripcion || p.product_id} - Cantidad: {p.cantidad} - Precio: ${p.price.toFixed(2)}
                    </li>
                  ))}
                </ul>
                <p style={styles.total}><strong>Total de la venta:</strong> ${totalVenta.toFixed(2)}</p>
                <button style={styles.pdfButton} onClick={() => generarPDF(venta)}>
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
    backgroundColor: '#111111',
    padding: '0 20px',
    height: 70,
    color: 'white',
    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
  },
  logo: { 
    fontWeight: '900', 
    fontSize: '1.8rem', 
    letterSpacing: '2px',
    color: '#ffffff',
    textShadow: '2px 2px 5px rgba(255,255,255,0.2)',
  },
  navLinks: { display: 'flex', gap: '25px', alignItems: 'center' },
  generateButton: {
    background: 'linear-gradient(90deg, #ff8c00, #ff4d00)',
    color: 'white',
    fontWeight: '700',
    padding: '10px 20px',
    borderRadius: 8,
    textDecoration: 'none',
    boxShadow: '0 5px 15px rgba(255, 77, 0, 0.4)',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  generateButtonHover: {
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 10px 25px rgba(255, 77, 0, 0.7)',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    border: 'none',
    padding: '8px 14px',
    borderRadius: 4,
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  container: { 
    maxWidth: 900, 
    margin: '20px auto', 
    fontFamily: "'Poppins', sans-serif",
    padding: '0 15px', 
    color: '#333' 
  },
  title: { 
    textAlign: 'center', 
    color: '#ff8c00', 
    marginBottom: 20, 
    fontWeight: '800', 
    fontSize: '2.2rem',
    textShadow: '1px 1px 5px rgba(0,0,0,0.2)',
  },
  subtitle: { 
    marginTop: 30, 
    marginBottom: 15, 
    fontSize: '1.5rem', 
    borderBottom: '2px solid #ff8c00', 
    paddingBottom: 8 
  },
  ventaCard: { 
    borderRadius: 10, 
    padding: 20, 
    marginBottom: 20, 
    background: 'linear-gradient(145deg, #f5f5f5, #eaeaea)',
    boxShadow: '5px 5px 15px rgba(0,0,0,0.1)',
  },
  total: { 
    fontWeight: '700', 
    fontSize: '1.2rem', 
    color: '#ff4d00', 
    marginTop: 10 
  },
  pdfButton: { 
    marginTop: 10, 
    backgroundColor: '#111111', 
    color: 'white', 
    border: 'none', 
    padding: '8px 14px', 
    borderRadius: 6, 
    cursor: 'pointer', 
    fontWeight: '700',
    transition: 'all 0.3s ease',
  },
  error: { color: 'red', textAlign: 'center' },
};

export default DashboardVendedor;
