import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CreateSale = ({ token }) => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [productosVenta, setProductosVenta] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener productos
    fetch('http://127.0.0.1:8001/api/clothes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setProductos(Array.isArray(data.data) ? data.data : []))
      .catch(console.error);

    // Obtener clientes (corregido)
   fetch('http://localhost:8000/api/users/clientes', {
  headers: { Authorization: `Bearer ${token}` },
})
  .then(res => res.json())
  .then(data => setClientes(Array.isArray(data) ? data : []))
  .catch(console.error);

  }, [token]);

  const agregarProducto = (id_producto) => {
    if (!id_producto || productosVenta.find(p => p.id_producto === id_producto)) return;
    setProductosVenta([...productosVenta, { id_producto, cantidad: 1 }]);
  };

  const cambiarCantidad = (id_producto, delta) => {
    setProductosVenta(
      productosVenta.map(p => {
        if (p.id_producto === id_producto) {
          const newCantidad = p.cantidad + delta;
          return { ...p, cantidad: newCantidad > 0 ? newCantidad : 1 };
        }
        return p;
      })
    );
  };

  const quitarProducto = (id_producto) => {
    setProductosVenta(productosVenta.filter(p => p.id_producto !== id_producto));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!selectedCliente) return setMensaje('Selecciona un cliente');
    if (productosVenta.length === 0) return setMensaje('Agrega al menos un producto');

    const items = productosVenta.map(pv => {
      const prod = productos.find(p => p.id === pv.id_producto);
      return { product_id: pv.id_producto, quantity: pv.cantidad, price: prod.sale_price };
    });

    try {
      const res = await fetch('http://127.0.0.1:8000/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_cliente: selectedCliente,
          items,
          total: items.reduce((acc, i) => acc + i.price * i.quantity, 0),
        }),
      });

      if (res.ok) {
        setMensaje('Venta creada con éxito');
        setSelectedCliente('');
        setProductosVenta([]);
      } else {
        const errorData = await res.json();
        setMensaje('Error: ' + (errorData.error || 'No se pudo crear la venta'));
      }
    } catch {
      setMensaje('Error al conectar con el servidor');
    }
  };

  const totalVenta = productosVenta.reduce((acc, pv) => {
    const prod = productos.find(p => p.id === pv.id_producto);
    return acc + (prod?.sale_price || 0) * pv.cantidad;
  }, 0);

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.logo}>UrbanStyle</div>
        <div style={styles.navLinks}>
          <Link to="/dashboard-vendedor" style={styles.navLink}>← Volver al Dashboard</Link>
          <button onClick={() => { localStorage.removeItem('token'); navigate('/login'); }} style={styles.logoutButton}>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <h2 style={styles.title}>Crear Venta</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.section}>
            <label style={styles.label}>Cliente:</label>
            <select
              value={selectedCliente}
              onChange={e => setSelectedCliente(e.target.value)}
              required
              style={styles.select}
            >
              <option value="">-- Selecciona un cliente --</option>
              {clientes.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Agregar Producto:</label>
            <select
              onChange={e => { agregarProducto(Number(e.target.value)); e.target.value = ''; }}
              defaultValue=""
              style={{ ...styles.select, maxHeight: 200, overflowY: 'auto' }}
            >
              <option value="" disabled>-- Seleccionar producto --</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} | {p.type?.name || ''} | {p.brand?.name || ''} | {p.size?.name || ''} | {p.color?.name || ''} (${p.sale_price})
                </option>
              ))}
            </select>
          </div>

          <div style={styles.cardsContainer}>
            {productosVenta.map(pv => {
              const prod = productos.find(p => p.id === pv.id_producto);
              if (!prod) return null;
              return (
                <div key={pv.id_producto} style={styles.card}>
                  <div>
                    <p style={styles.productName}>{prod.name}</p>
                    <p style={styles.productDetails}>
                      {prod.type?.name || ''} | {prod.brand?.name || ''} | {prod.size?.name || ''} | {prod.color?.name || ''}
                    </p>
                  </div>
                  <div style={styles.cardActions}>
                    <div style={styles.quantityControl}>
                      <button type="button" onClick={() => cambiarCantidad(pv.id_producto, -1)} style={styles.qtyBtn}>-</button>
                      <span style={styles.qty}>{pv.cantidad}</span>
                      <button type="button" onClick={() => cambiarCantidad(pv.id_producto, 1)} style={styles.qtyBtn}>+</button>
                    </div>
                    <p style={styles.price}>${(prod.sale_price * pv.cantidad).toFixed(2)}</p>
                    <button type="button" onClick={() => quitarProducto(pv.id_producto)} style={styles.removeButton}>Quitar</button>
                  </div>
                </div>
              );
            })}
          </div>

          {productosVenta.length > 0 && (
            <p style={styles.total}>Total de la venta: <strong>${totalVenta.toFixed(2)}</strong></p>
          )}

          {mensaje && <p style={styles.message}>{mensaje}</p>}
          <button
            type="submit"
            style={{ 
              ...styles.submitButton, 
              ...(hover ? styles.submitButtonHover : {}) 
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            Crear Venta
          </button>
        </form>
      </div>
    </>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#111111',
    color: 'white',
    padding: '10px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
  },
  logo: { fontWeight: '900', fontSize: '1.8rem', letterSpacing: '2px', color: '#ffffff', textShadow: '2px 2px 5px rgba(255,255,255,0.2)' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '15px' },
  navLink: { color: 'white', textDecoration: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' },
  logoutButton: { backgroundColor: '#dc3545', border: 'none', padding: '8px 14px', borderRadius: '4px', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s ease' },
  container: { maxWidth: 900, margin: '30px auto', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: 10, boxShadow: '0 5px 15px rgba(0,0,0,0.1)', fontFamily: "'Poppins', sans-serif" },
  title: { textAlign: 'center', color: '#ff8c00', marginBottom: 25, fontWeight: '800', textShadow: '1px 1px 5px rgba(0,0,0,0.2)' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  section: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontWeight: '600' },
  select: { padding: '8px', fontSize: '1rem', borderRadius: 6, border: '1px solid #ccc' },
  cardsContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginTop: 15 },
  card: { backgroundColor: 'white', padding: '12px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  productName: { fontWeight: '700', marginBottom: 4 },
  productDetails: { fontSize: 12, color: '#555', marginBottom: 10 },
  cardActions: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  quantityControl: { display: 'flex', alignItems: 'center', gap: 5 },
  qtyBtn: { width: 28, height: 28, borderRadius: 4, border: '1px solid #ccc', backgroundColor: '#f0f0f0', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s ease' },
  qty: { width: 24, textAlign: 'center', fontWeight: '600' },
  price: { fontWeight: '600', color: '#ff4d00' },
  removeButton: { backgroundColor: '#dc3545', border: 'none', padding: '6px 10px', color: 'white', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s ease' },
  total: { marginTop: 15, textAlign: 'right', fontWeight: '700', fontSize: '1.2rem', color: '#ff4d00' },
  message: { color: '#dc3545', fontWeight: '600', textAlign: 'center', marginTop: 10 },
  submitButton: { backgroundColor: '#ff8c00', color: 'white', padding: '12px', fontSize: '1.1rem', fontWeight: '700', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 5px 15px rgba(255,140,0,0.4)' },
  submitButtonHover: { transform: 'translateY(-3px) scale(1.05)', boxShadow: '0 10px 25px rgba(255,140,0,0.7)' },
};

export default CreateSale;
