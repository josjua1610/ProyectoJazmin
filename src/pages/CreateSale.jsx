import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CreateSale = ({ token }) => {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [productosVenta, setProductosVenta] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  // Cargar productos (Laravel) y clientes (Flask)
  useEffect(() => {
    // Productos desde Laravel
    fetch('http://127.0.0.1:8001/api/clothes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const lista = Array.isArray(data.data) ? data.data : [];
        setProductos(lista);
      })
      .catch(console.error);

    // Clientes desde Flask
    fetch('http://localhost:8000/api/users/clientes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setClientes(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [token]);

  const agregarProducto = (id_producto) => {
    if (!id_producto) return;
    if (productosVenta.find(p => p.id_producto === id_producto)) return;
    setProductosVenta([...productosVenta, { id_producto, cantidad: 1 }]);
  };

  const cambiarCantidad = (id_producto, cantidad) => {
    if (cantidad < 1) return;
    setProductosVenta(
      productosVenta.map(p =>
        p.id_producto === id_producto ? { ...p, cantidad } : p
      )
    );
  };

  const quitarProducto = (id_producto) => {
    setProductosVenta(productosVenta.filter(p => p.id_producto !== id_producto));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');

    if (!selectedCliente) {
      setMensaje('Selecciona un cliente');
      return;
    }
    if (productosVenta.length === 0) {
      setMensaje('Agrega al menos un producto');
      return;
    }

    // Preparar items con precio de venta desde Laravel
    const items = productosVenta.map(pv => {
      const prod = productos.find(p => p.id === pv.id_producto);
      return {
        product_id: pv.id_producto,
        quantity: pv.cantidad,
        price: prod.sale_price
      };
    });

    try {
      const res = await fetch('http://127.0.0.1:8000/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id_cliente: selectedCliente,
          items,
          total: items.reduce((acc, i) => acc + i.price * i.quantity, 0)
        })
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

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.logo}>MiSistema</div>
        <div style={styles.navLinks}>
          <Link to="/dashboard-vendedor" style={styles.navLink}>← Volver al Dashboard</Link>
          <button
            onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
            style={styles.logoutButton}
          >
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div style={styles.container}>
        <h2 style={styles.title}>Crear Venta</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
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

          <label style={styles.label}>Agregar Producto:</label>
          <select
            onChange={e => { agregarProducto(Number(e.target.value)); e.target.value = ''; }}
            defaultValue=""
            style={styles.select}
          >
            <option value="" disabled>-- Seleccionar producto --</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} | {p.type?.name} | {p.brand?.name} | {p.size?.name} | {p.color?.name} (${p.sale_price})
              </option>
            ))}
          </select>

          {productosVenta.length > 0 && (
            <>
              <h3 style={{ marginTop: '20px' }}>Productos en la venta</h3>
              <ul style={styles.productList}>
                {productosVenta.map(pv => {
                  const prod = productos.find(p => p.id === pv.id_producto);
                  return (
                    <li key={pv.id_producto} style={styles.productItem}>
                      <span>
                        {prod ? `${prod.name} | ${prod.type?.name} | ${prod.brand?.name} | ${prod.size?.name} | ${prod.color?.name}` : 'Producto no encontrado'}
                      </span>
                      <input
                        type="number"
                        min="1"
                        value={pv.cantidad}
                        onChange={e => cambiarCantidad(pv.id_producto, Number(e.target.value))}
                        style={styles.quantityInput}
                      />
                      <button type="button" onClick={() => quitarProducto(pv.id_producto)} style={styles.removeButton}>
                        Quitar
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          {mensaje && <p style={styles.message}>{mensaje}</p>}

          <button type="submit" style={styles.submitButton}>Crear Venta</button>
        </form>
      </div>
    </>
  );
};

const styles = {
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#007bff', color: 'white', padding: '10px 20px', position: 'sticky', top: 0, zIndex: 1000 },
  logo: { fontWeight: '700', fontSize: '1.5rem' },
  navLinks: { display: 'flex', alignItems: 'center', gap: '15px' },
  navLink: { color: 'white', textDecoration: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '1rem' },
  logoutButton: { backgroundColor: '#dc3545', border: 'none', padding: '8px 14px', borderRadius: '4px', color: 'white', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.3s ease' },
  container: { maxWidth: 700, margin: '30px auto', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  title: { textAlign: 'center', color: '#007bff', marginBottom: 25 },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { fontWeight: '600' },
  select: { padding: '8px', fontSize: '1rem', borderRadius: 4, border: '1px solid #ccc' },
  productList: { listStyle: 'none', padding: 0, marginTop: 0 },
  productItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: '8px 12px', borderRadius: 4, marginBottom: 8, border: '1px solid #ddd' },
  quantityInput: { width: 60, marginLeft: 10, marginRight: 10, padding: '4px 6px', fontSize: '1rem', borderRadius: 4, border: '1px solid #ccc' },
  removeButton: { backgroundColor: '#dc3545', border: 'none', padding: '6px 12px', color: 'white', borderRadius: 4, cursor: 'pointer' },
  message: { color: '#dc3545', fontWeight: '600', textAlign: 'center', marginTop: 10 },
  submitButton: { backgroundColor: '#007bff', color: 'white', padding: '12px', fontSize: '1.1rem', fontWeight: '700', border: 'none', borderRadius: 6, cursor: 'pointer', marginTop: 10 },
};

export default CreateSale;
