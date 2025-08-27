import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CreateSale = ({ token }) => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [productosVenta, setProductosVenta] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [hover, setHover] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener productos
    fetch('http://127.0.0.1:8001/api/clothes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setProductos(Array.isArray(data.data) ? data.data : []))
      .catch(console.error);

    // Obtener clientes
    fetch('http://172.20.10.7:8000/api/users/clientes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setClientes(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [token]);

  const agregarProducto = (id_producto) => {
    if (!id_producto) return;
    setProductosVenta(prev => {
      const existente = prev.find(p => p.id_producto === id_producto);
      if (existente) {
        return prev.map(p =>
          p.id_producto === id_producto
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }
      return [...prev, { id_producto, cantidad: 1 }];
    });
  };

  const buscarPorId = async () => {
    if (!searchId) return;
    try {
      const res = await fetch(`http://127.0.0.1:8001/api/clothes/by-id/${searchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Producto no encontrado");
      const data = await res.json();
      if (data?.id) {
        agregarProducto(data.id);
        setMensaje(`Producto ${data.name} agregado ✅`);
      } else {
        setMensaje("Producto no encontrado");
      }
    } catch (err) {
      setMensaje("Error al buscar producto por ID");
    }
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
        setProductoSeleccionado('');
      } else {
        const errorData = await res.json();
        setMensaje('Error: ' + (errorData.message || 'No se pudo crear la venta'));
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
          {/* Seleccionar Cliente */}
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

          {/* Seleccionar producto desde menú desplegable */}
          <div style={styles.section}>
            <label style={styles.label}>Agregar producto:</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <select
                value={productoSeleccionado}
                onChange={e => setProductoSeleccionado(e.target.value)}
                style={{ flex: 1, padding: "8px", borderRadius: 6, border: "1px solid #ccc" }}
              >
                <option value="">-- Selecciona un producto --</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} | {p.brand?.name || ''} | ${p.sale_price}
                  </option>
                ))}
              </select>
            <button
  type="button"
  onClick={() => {
    if (productoSeleccionado) {
      agregarProducto(Number(productoSeleccionado));
      setProductoSeleccionado('');
    }
  }}
  style={styles.submitButton}
>
  Agregar
</button>

            </div>
          </div>

          {/* Buscar producto por ID */}
          <div style={styles.section}>
            <label style={styles.label}>Buscar producto por ID:</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="number"
                value={searchId}
                onChange={e => setSearchId(e.target.value)}
                placeholder="ID del producto"
                style={{ flex: 1, padding: "8px", borderRadius: 6, border: "1px solid #ccc" }}
              />
              <button type="button" onClick={buscarPorId} style={styles.submitButton}>
                Buscar y Agregar
              </button>
            </div>
          </div>

          {/* Carrito de productos agregados */}
          {productosVenta.length > 0 && (
            <div style={styles.section}>
              <h3>Carrito de Venta</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#eee" }}>
                    <th>ID</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {productosVenta.map(pv => {
                    const prod = productos.find(p => p.id === pv.id_producto);
                    if (!prod) return null;
                    return (
                      <tr key={pv.id_producto}>
                        <td>{prod.id}</td>
                        <td>{prod.name}</td>
                        <td>
                          <button type="button" onClick={() => cambiarCantidad(pv.id_producto, -1)} style={styles.qtyBtn}>-</button>
                          <span style={styles.qty}>{pv.cantidad}</span>
                          <button type="button" onClick={() => cambiarCantidad(pv.id_producto, 1)} style={styles.qtyBtn}>+</button>
                        </td>
                        <td>${prod.sale_price}</td>
                        <td>${(prod.sale_price * pv.cantidad).toFixed(2)}</td>
                        <td>
                          <button type="button" onClick={() => quitarProducto(pv.id_producto)} style={styles.removeButton}>❌</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p style={styles.total}>Total de la venta: <strong>${totalVenta.toFixed(2)}</strong></p>
            </div>
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
  qtyBtn: { width: 28, height: 28, borderRadius: 4, border: '1px solid #ccc', backgroundColor: '#f0f0f0', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s ease', margin: '0 3px' },
  qty: { width: 24, textAlign: 'center', fontWeight: '600' },
  removeButton: { backgroundColor: '#dc3545', border: 'none', padding: '6px 10px', color: 'white', borderRadius: 6, cursor: 'pointer', transition: 'all 0.2s ease' },
  total: { marginTop: 15, textAlign: 'right', fontWeight: '700', fontSize: '1.2rem', color: '#ff4d00' },
  message: { color: '#dc3545', fontWeight: '600', textAlign: 'center', marginTop: 10 },
  submitButton: { backgroundColor: '#ff8c00', color: 'white', padding: '12px', fontSize: '1.1rem', fontWeight: '700', border: 'none', borderRadius: 8, cursor: 'pointer', transition: 'all 0.3s ease', boxShadow: '0 5px 15px rgba(255,140,0,0.4)' },
  submitButtonHover: { transform: 'translateY(-3px) scale(1.05)', boxShadow: '0 10px 25px rgba(255,140,0,0.7)' },
};

export default CreateSale;
