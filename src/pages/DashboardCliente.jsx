import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';

export const API_URL = 'http://192.168.1.65:8000/api';


const DashboardCliente = () => {
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchCompras = async () => {
      try {
        const res = await fetch(`http://192.168.1.65:8000/api/ventas/mis-compras`, {
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
      doc.text(
        `${index + 1}. ${p.descripcion} - Cantidad: ${p.cantidad} - Precio unitario: $${p.price.toFixed(2)}`,
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
        <div style={styles.logo}>MiSistema - Cliente</div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </header>

      <main style={styles.main}>
        <h1 style={styles.title}>Tus Compras</h1>
        {compras.length === 0 ? (
          <p style={styles.noCompras}>No tienes compras registradas.</p>
        ) : (
          compras.map((compra) => {
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
                <ul style={styles.productList}>
                  {compra.productos.map((producto) => (
                    <li key={producto.id_producto} style={styles.productItem}>
                      <span style={styles.productDesc}>{producto.descripcion}</span>
                      <span style={styles.productCantidad}>Cantidad: {producto.cantidad}</span>
                      <span style={styles.productPrecio}>Precio unitario: ${producto.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <p style={styles.totalText}><strong>Total de la compra:</strong> ${totalCompra.toFixed(2)}</p>
                <button
                  style={styles.downloadButton}
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
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f7f9fc',
    minHeight: '100vh',
    paddingBottom: 40,
  },
  navbar: {
    backgroundColor: '#007bff',
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
  },
  logo: {
    userSelect: 'none',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    border: 'none',
    padding: '10px 18px',
    borderRadius: 6,
    color: 'white',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  main: {
    maxWidth: 960,
    margin: '40px auto',
    padding: '0 20px',
  },
  title: {
    color: '#007bff',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '700',
    fontSize: '2rem',
  },
  noCompras: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#555',
  },
  compraCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    marginBottom: 25,
    boxShadow: '0 5px 15px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  compraHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontWeight: '600',
    fontSize: '1.1rem',
    color: '#333',
  },
  productList: {
    listStyleType: 'none',
    paddingLeft: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  productItem: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: 12,
    padding: '8px 12px',
    borderRadius: 6,
    backgroundColor: '#f4f6f8',
    color: '#444',
    fontSize: '1rem',
    alignItems: 'center',
  },
  productDesc: {
    fontWeight: '600',
  },
  productCantidad: {
    textAlign: 'center',
    fontWeight: '500',
  },
  productPrecio: {
    textAlign: 'right',
    fontWeight: '500',
  },
  totalText: {
    fontSize: '1.2rem',
    fontWeight: '700',
    textAlign: 'right',
    marginTop: 10,
    color: '#007bff',
  },
  downloadButton: {
    backgroundColor: '#28a745',
    border: 'none',
    padding: '12px 20px',
    color: 'white',
    fontWeight: '700',
    borderRadius: 8,
    cursor: 'pointer',
    alignSelf: 'flex-start',
    transition: 'background-color 0.3s ease',
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
