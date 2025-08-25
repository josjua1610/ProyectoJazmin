import React, { useEffect, useState } from 'react';

const MisVentas = ({ token }) => {
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/ventas/mis-ventas', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setVentas(data))
      .catch(console.error);
  }, [token]);

  return (
    <div>
      <h2>Tus Ventas</h2>
      {ventas.length === 0 && <p>No tienes ventas registradas.</p>}
      {ventas.map(venta => (
        <div key={venta._id} style={{ marginBottom: '20px' }}>
          <p><b>Fecha:</b> {new Date(venta.fecha).toLocaleDateString()}</p>
          <p><b>Vendedor:</b> {venta.id_vendedor?.name || 'Sin vendedor'}</p>
          <p><b>Productos:</b></p>
          <ul>
            {venta.productos.map(p => (
              <li key={p.id_producto}>
                {p.descripcion} (ID: {p.id_producto}) - Cantidad: {p.cantidad} - Precio unitario: ${p.price}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default MisVentas;
