import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
export const API_URL = 'http://192.168.1.65:8000/api';



const ReporteVentas = () => {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     fetch(`http://192.168.1.65:8000/api/reportes/ventas`, { // 👈 usamos getApiUrl()

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

  if (loading) return <p>Cargando reporte...</p>;
  if (!reporte) return <p>No se pudo cargar el reporte.</p>;

  const ventasPorDiaArray = reporte.ventasPorDia ? Object.entries(reporte.ventasPorDia) : [];
  const ventasPorUsuarioArray = reporte.ventasPorUsuario ? Object.entries(reporte.ventasPorUsuario) : [];
  const productosMasVendidosArray = reporte.productosMasVendidos || [];

  // Función para generar PDF tipo ticket para una venta (pasa un objeto venta)
  // Como ejemplo, aquí vamos a generar un ticket simple basado en las ventas por día
  // Puedes adaptar a ventas individuales o las que tengas
  const generarTicketPDF = (fecha, datos) => {
    const doc = new jsPDF({
      unit: 'pt',
      format: [280, 500], // tamaño ticket ancho x alto aprox
    });

    const margin = 10;
    let y = margin;

    // Título y encabezado
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Mi Tienda', 140, y, { align: 'center' });
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
    doc.text('Gracias por su compra!', 140, y, { align: 'center' });

    doc.save(`Ticket_${fecha}.pdf`);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Reporte de Ventas</h1>

      {/* Resumen General */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>Resumen General</h2>
        <div style={styles.summaryGrid}>
          <div style={styles.summaryBox}>
            <strong>Total Ventas</strong>
            <p>{reporte.totalVentas}</p>
          </div>
          <div style={styles.summaryBox}>
            <strong>Total Items Vendidos</strong>
            <p>{reporte.totalItems}</p>
          </div>
          <div style={styles.summaryBox}>
            <strong>Ingresos Totales</strong>
            <p>${reporte.ingresos.toFixed(2)}</p>
          </div>
          <div style={styles.summaryBox}>
            <strong>Ganancias Totales</strong>
            <p>${reporte.ganancias.toFixed(2)}</p>
          </div>
        </div>
      </section>

      {/* Ventas por Día */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>Ventas por Día</h2>
        {ventasPorDiaArray.length === 0 ? (
          <p>No hay datos disponibles para ventas por día.</p>
        ) : (
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
                      Descargar Ticket
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Ventas por Usuario */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>Ventas por Usuario</h2>
        {ventasPorUsuarioArray.length === 0 ? (
          <p>No hay datos disponibles para ventas por usuario.</p>
        ) : (
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
        )}
      </section>

      {/* Productos más vendidos */}
      <section style={styles.section}>
        <h2 style={styles.subtitle}>Productos más Vendidos</h2>
        {productosMasVendidosArray.length === 0 ? (
          <p>No hay datos disponibles para productos más vendidos.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad Vendida</th>
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
        )}
      </section>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '960px',
    margin: '20px auto',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
    padding: '0 15px',
  },
  title: {
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '2.5rem',
    marginBottom: '30px',
    color: '#007bff',
  },
  section: {
    marginBottom: '40px',
  },
  subtitle: {
    fontSize: '1.5rem',
    borderBottom: '2px solid #007bff',
    paddingBottom: '8px',
    marginBottom: '20px',
  },
  summaryGrid: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  summaryBox: {
    flex: '1 1 200px',
    backgroundColor: '#e9f2ff',
    margin: '10px',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
    textAlign: 'center',
    fontSize: '1.2rem',
    fontWeight: '600',
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
    borderRadius: '4px',
    cursor: 'pointer',
  },
  btnPDFHover: {
    backgroundColor: '#0056b3',
  },
};

export default ReporteVentas;
