import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
export const API_URL = 'http://172.20.10.7:8000/api';

const ReporteVentas = () => {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/reportes/ventas`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setReporte(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={styles.loading}>Cargando reporte...</p>;
  if (!reporte) return <p style={styles.error}>No se pudo cargar el reporte.</p>;

  const ventasPorDiaArray = reporte.ventasPorDia ? Object.entries(reporte.ventasPorDia) : [];
  const ventasPorUsuarioArray = reporte.ventasPorUsuario ? Object.entries(reporte.ventasPorUsuario) : [];
  const productosMasVendidosArray = reporte.productosMasVendidos || [];

  const generarTicketPDF = (fecha, datos) => {
    const doc = new jsPDF({
      unit: 'pt',
      format: [280, 500],
    });

    const margin = 10;
    let y = margin;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('UrbanStyle', 140, y, { align: 'center' });
    y += 20;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${fecha}`, margin, y);
    y += 15;
    doc.text(`Ventas: ${datos.ventas}`, margin, y);
    y += 15;
    doc.text(`Items: ${datos.items}`, margin, y);
    y += 15;
    doc.text(`Ingresos: $${datos.ingresos.toFixed(2)}`, margin, y);
    y += 15;
    doc.text(`Ganancias: $${datos.ganancias.toFixed(2)}`, margin, y);
    y += 30;

    doc.setFont('helvetica', 'bold');
    doc.text('¡Gracias por su compra!', 140, y, { align: 'center' });

    doc.save(`Ticket_${fecha}.pdf`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📊 Reporte de Ventas</h1>

      {/* Resumen General */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>Resumen General</h2>
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.summaryBox, background: '#007bff20' }}>
            <strong>Total Ventas</strong>
            <p>{reporte.totalVentas}</p>
          </div>
          <div style={{ ...styles.summaryBox, background: '#28a74520' }}>
            <strong>Total Items</strong>
            <p>{reporte.totalItems}</p>
          </div>
          <div style={{ ...styles.summaryBox, background: '#ffc10720' }}>
            <strong>Ingresos</strong>
            <p>${reporte.ingresos.toFixed(2)}</p>
          </div>
          <div style={{ ...styles.summaryBox, background: '#dc354520' }}>
            <strong>Ganancias</strong>
            <p>${reporte.ganancias.toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* Ventas por Día */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>Ventas por Día</h2>
        {ventasPorDiaArray.length === 0 ? (
          <p>No hay datos.</p>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Ventas</th>
                  <th>Items</th>
                  <th>Ingresos</th>
                  <th>Ganancias</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ventasPorDiaArray.map(([fecha, datos]) => (
                  <tr key={fecha}>
                    <td>{fecha}</td>
                    <td>{datos.ventas}</td>
                    <td>{datos.items}</td>
                    <td>${datos.ingresos.toFixed(2)}</td>
                    <td>${datos.ganancias.toFixed(2)}</td>
                    <td>
                      <button
                        style={styles.btnPDF}
                        onClick={() => generarTicketPDF(fecha, datos)}
                      >
                        🧾 PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Ventas por Usuario */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>Ventas por Usuario</h2>
        {ventasPorUsuarioArray.length === 0 ? (
          <p>No hay datos.</p>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Ventas</th>
                  <th>Items</th>
                  <th>Ingresos</th>
                  <th>Ganancias</th>
                </tr>
              </thead>
              <tbody>
                {ventasPorUsuarioArray.map(([usuario, datos]) => (
                  <tr key={usuario}>
                    <td>{usuario}</td>
                    <td>{datos.ventas}</td>
                    <td>{datos.items}</td>
                    <td>${datos.ingresos.toFixed(2)}</td>
                    <td>${datos.ganancias.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Productos más vendidos */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>🔥 Productos más Vendidos</h2>
        {productosMasVendidosArray.length === 0 ? (
          <p>No hay datos.</p>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Ingresos</th>
                  <th>Ganancias</th>
                </tr>
              </thead>
              <tbody>
                {productosMasVendidosArray.map((prod) => (
                  <tr key={prod.id_producto}>
                    <td>{prod.descripcion}</td>
                    <td>{prod.cantidad}</td>
                    <td>${prod.ingresos.toFixed(2)}</td>
                    <td>${prod.ganancias.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '30px auto',
    fontFamily: "'Poppins', sans-serif",
    color: '#333',
    padding: '0 15px',
  },
  title: {
    textAlign: 'center',
    fontWeight: '800',
    fontSize: '2.2rem',
    marginBottom: '30px',
    color: '#111',
  },
  section: {
    marginBottom: '40px',
  },
  subtitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    borderBottom: '3px solid #007bff',
    paddingBottom: '8px',
    marginBottom: '20px',
    color: '#007bff',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '15px',
  },
  summaryBox: {
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
    textAlign: 'center',
    fontSize: '1.2rem',
    fontWeight: '600',
    transition: 'transform 0.2s ease',
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  btnPDF: {
    padding: '6px 12px',
    backgroundColor: '#007bff',
    border: 'none',
    color: 'white',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2rem',
    marginTop: '20px',
  },
  error: {
    textAlign: 'center',
    color: 'red',
    fontWeight: '600',
    marginTop: '20px',
  },
};

export default ReporteVentas;
