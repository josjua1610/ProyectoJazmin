import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';

export const API_URL = 'http://10.142.55.114:8000/api';

const DashboardCliente = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoverDownload, setHoverDownload] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const res = await fetch(`${API_URL}/ventas/mis-compras`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setCompras(data);
          setError('');
        } else {
          setError('Error al cargar compras');
        }
      } catch (error) {
        setError('Error en fetch: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCompras();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const downloadPDF = (compra) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Ticket de Compra', 14, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date(compra.fecha).toLocaleDateString()}`, 14, 30);
    doc.text(`Vendedor: ${compra.id_vendedor?.name || 'Desconocido'}`, 14, 40);

    let yPos = 50;
    doc.text('Productos:', 14, yPos);
    yPos += 10;

    compra.productos.forEach((p, index) => {
      const nombre = p.descripcion || p.id_producto || 'Producto';
      doc.text(
        `${index + 1}. ${nombre} - Cantidad: ${p.cantidad} - Precio unitario: $${p.price.toFixed(2)}`,
        14,
        yPos
      );
      yPos += 10;
    });

    const total = compra.productos.reduce((acc, p) => acc + p.price * p.cantidad, 0);
    yPos += 10;
    doc.text(`Total: $${total.toFixed(2)}`, 14, yPos);

    doc.save(`ticket_compra_${compra._id}.pdf`);
  };

  if (loading) return <p style={styles.loading}>Cargando compras...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  return (
    <div style={styles.pageContainer}>
      <header style={styles.navbar}>
        <div style={styles.logo}>UrbanStyle - Cliente</div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </header>

      <main style={styles.main}>
        <h1 style={styles.title}>Tus Compras</h1>
        {compras.length === 0 ? (
          <p style={styles.noCompras}>No tienes compras registradas.</p>
        ) : (
          compras.map((compra, index) => {
            const totalCompra = compra.productos.reduce(
              (acc, p) => acc + p.price * p.cantidad,
              0
            );

            return (
              <div key={compra._id} style={styles.compraCard}>
                <div style={styles.compraHeader}>
                  <p><strong>Fecha:</strong> {new Date(compra.fecha).toLocaleDateString()}</p>
                  <p><strong>Vendedor:</strong> {compra.id_vendedor?.name || 'Desconocido'}</p>
                </div>

                {/* Productos comprados */}
                <div style={styles.productGrid}>
                  {compra.productos.map((producto, i) => (
                    <div key={i} style={styles.productMiniCard}>
                      <p style={styles.productDesc}>
                        {producto.descripcion || producto.id_producto || 'Producto '}
                      </p>
                      <p style={styles.productCantidad}>x{producto.cantidad}</p>
                      <p style={styles.productPrecio}>${producto.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <p style={styles.totalText}><strong>Total de la compra:</strong> ${totalCompra.toFixed(2)}</p>
                <button
                  style={{
                    ...styles.downloadButton,
                    ...(hoverDownload === index ? styles.downloadButtonHover : {}),
                  }}
                  onMouseEnter={() => setHoverDownload(index)}
                  onMouseLeave={() => setHoverDownload(null)}
                  onClick={() => downloadPDF(compra)}
                >
                  Descargar Ticket PDF
                </button>
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
    fontFamily: "'Poppins', sans-serif",
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    paddingBottom: 40,
  },
  navbar: {
    backgroundColor: '#111111',
    padding: '15px 30px',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '700',
    fontSize: '1.3rem',
    position: 'sticky',
    top: 0,
    zIndex: 999,
    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
  },
  logo: {
    userSelect: 'none',
    fontWeight: '900',
    letterSpacing: '2px',
    textShadow: '2px 2px 5px rgba(255,255,255,0.2)',
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
  },
  main: {
    maxWidth: 960,
    margin: '40px auto',
    padding: '0 20px',
  },
  title: {
    color: '#ff8c00',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '800',
    fontSize: '2rem',
    textShadow: '1px 1px 5px rgba(0,0,0,0.2)',
  },
  noCompras: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#555',
  },
  compraCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    marginBottom: 25,
    boxShadow: '0 5px 15px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
  },
  compraHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: '600',
    fontSize: '1.1rem',
    color: '#333',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 10,
    marginTop: 10,
  },
  productMiniCard: {
    backgroundColor: '#f4f6f8',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
  },
  productDesc: {
    fontWeight: '600',
    fontSize: '0.9rem',
  },
  productCantidad: {
    fontSize: '0.85rem',
    color: '#555',
  },
  productPrecio: {
    fontWeight: '600',
    fontSize: '0.85rem',
    color: '#007bff',
  },
  totalText: {
    fontSize: '1.2rem',
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 10,
    color: '#ff4d00',
  },
  downloadButton: {
    backgroundColor: '#28a745',
    border: 'none',
    padding: '10px 16px',
    color: 'white',
    fontWeight: '700',
    borderRadius: 8,
    cursor: 'pointer',
    alignSelf: 'flex-start',
    transition: 'all 0.3s ease',
    boxShadow: '0 5px 15px rgba(40,167,69,0.4)',
    marginTop: 10,
  },
  downloadButtonHover: {
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 10px 25px rgba(40,167,69,0.7)',
  },
  loading: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: '1.2rem',
  },
  error: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: '1.2rem',
    color: 'red',
  },
};

export default DashboardCliente;
