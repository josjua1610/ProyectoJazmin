import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:8000/api";

const mxn = (v) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(v || 0));

const AdminProducts = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Listado
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);

  // Catálogos
  const [types, setTypes] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  // Formulario
  const [form, setForm] = useState({
    id: null, // si tiene valor, estamos editando
    name: "",
    type_id: "",
    brand_id: "",
    size_id: "",
    color_id: "",
    gender: "unisex",
    purchase_price: "",
    sale_price: "",
    primary_index: 0,
  });
  const [mensaje, setMensaje] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const filesRef = useRef(null); // para imágenes nuevas en create/update

  // ==== Carga de catálogos ====
  const loadCatalogs = useCallback(async () => {
    try {
      const [t, b, s, c] = await Promise.all([
        fetch(`${API_BASE}/catalog/types`).then((r) => r.json()),
        fetch(`${API_BASE}/catalog/brands`).then((r) => r.json()),
        fetch(`${API_BASE}/catalog/sizes`).then((r) => r.json()),
        fetch(`${API_BASE}/catalog/colors`).then((r) => r.json()),
      ]);
      setTypes(t);
      setBrands(b);
      setSizes(s);
      setColors(c);
    } catch (e) {
      console.error(e);
      setMensaje("No se pudieron cargar catálogos.");
    }
  }, []);

  // ==== Carga de productos (paginado) ====
  const fetchProducts = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/clothes?page=${page}`, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list = Array.isArray(data?.data) ? data.data : [];
        // Mapeo para mostrar todo cómodo
        const mapped = list.map((it) => ({
          id: it.id,
          name: it.name,
          type: it.type?.name || "",
          brand: it.brand?.name || "",
          size: it.size?.name || "",
          color: it.color?.name || "",
          gender: it.gender,
          purchase_price: it.purchase_price,
          sale_price: it.sale_price,
          primary_image_url:
            it.primary_image?.url ||
            it.images?.find((x) => x.is_primary)?.url ||
            it.images?.[0]?.url ||
            null,
        }));
        setProducts(mapped);
        setMeta({ current_page: data.current_page ?? 1, last_page: data.last_page ?? 1 });
      } catch (e) {
        console.error(e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    loadCatalogs();
    fetchProducts(1);
  }, [loadCatalogs, fetchProducts]);

  // ==== Form helpers ====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      type_id: "",
      brand_id: "",
      size_id: "",
      color_id: "",
      gender: "unisex",
      purchase_price: "",
      sale_price: "",
      primary_index: 0,
    });
    if (filesRef.current) filesRef.current.value = "";
    setSubmitting(false);
  };

  // ==== Crear / Editar (multipart) ====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setSubmitting(true);

    try {
      const fd = new FormData();
      // Campos básicos
      fd.append("name", form.name);
      fd.append("type_id", form.type_id);
      fd.append("brand_id", form.brand_id);
      fd.append("size_id", form.size_id);
      fd.append("color_id", form.color_id);
      fd.append("gender", form.gender);
      fd.append("purchase_price", form.purchase_price);
      fd.append("sale_price", form.sale_price);

      // Imágenes (opcionales)
      const files = Array.from(filesRef.current?.files || []);
      files.forEach((f) => fd.append("images[]", f));
      // Índice de principal si subes imágenes múltiples
      if (form.primary_index !== "" && form.primary_index !== null) {
        fd.append("primary_index", String(form.primary_index));
      }

      const isEdit = Boolean(form.id);
      const url = isEdit ? `${API_BASE}/clothes/${form.id}` : `${API_BASE}/clothes`;
      const opts = {
        method: isEdit ? "POST" : "POST",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // NO setear Content-Type manual, para que se adjunte el boundary
        },
        body: fd,
      };
      if (isEdit) fd.append("_method", "PUT");

      const res = await fetch(url, opts);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(err?.errors || err));
      }

      setMensaje(isEdit ? "Producto actualizado." : "Producto creado.");
      resetForm();
      fetchProducts(meta.current_page);
    } catch (err) {
      console.error(err);
      setMensaje("Error: " + (err.message || "No se pudo completar la operación"));
    } finally {
      setSubmitting(false);
    }
  };

  // ==== Cargar datos en el form para editar ====
  const handleEdit = (p) => {
    setMensaje("");
    setForm((prev) => ({
      ...prev,
      id: p.id,
      name: p.name,
      // OJO: para selects, necesitamos el ID real. Si no lo tienes en el listado,
      // puedes cargar el detalle GET /clothes/{id} para obtener los *_id.
      // Aquí lo mantenemos como edición de campos básicos (precios/género) y nuevas imágenes.
      type_id: "", // si quieres editarlo, primero trae el detalle y setea el id real
      brand_id: "",
      size_id: "",
      color_id: "",
      gender: p.gender || "unisex",
      purchase_price: p.purchase_price ?? "",
      sale_price: p.sale_price ?? "",
      primary_index: 0,
    }));
    if (filesRef.current) filesRef.current.value = "";
  };

  // ==== Eliminar ====
  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    try {
      const res = await fetch(`${API_BASE}/clothes/${id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setMensaje("Producto eliminado.");
      fetchProducts(meta.current_page);
    } catch (e) {
      console.error(e);
      setMensaje("No se pudo eliminar.");
    }
  };

  // ==== Navegación / logout ====
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={styles.pageContainer}>
      {/* Navbar */}
      <header style={styles.navbar}>
        <div style={styles.logo}>MiSistema</div>
        <nav style={styles.navLinks}>
          <Link to="/dashboard-admin" style={styles.navLink}>
            Inicio
          </Link>
          <Link to="/admin/users" style={styles.navLink}>
            Usuarios
          </Link>
          <Link
            to="/admin/products"
            style={{ ...styles.navLink, fontWeight: "700", textDecoration: "underline" }}
          >
            Productos
          </Link>
          <Link to="/ventas" style={styles.navLink}>
            Ventas
          </Link>
        </nav>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Cerrar Sesión
        </button>
      </header>

      {/* Main */}
      <main style={styles.mainContent}>
        <h1 style={styles.title}>{form.id ? "Editar Producto" : "Crear Producto"}</h1>

        <form onSubmit={handleSubmit} style={styles.form} encType="multipart/form-data">
          <input
            name="name"
            placeholder="Nombre / Descripción"
            value={form.name}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <div style={styles.row2}>
            <select name="type_id" value={form.type_id} onChange={handleChange} required style={styles.input}>
              <option value="">Tipo de prenda</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select name="brand_id" value={form.brand_id} onChange={handleChange} required style={styles.input}>
              <option value="">Marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.row2}>
            <select name="size_id" value={form.size_id} onChange={handleChange} required style={styles.input}>
              <option value="">Talla</option>
              {sizes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select name="color_id" value={form.color_id} onChange={handleChange} required style={styles.input}>
              <option value="">Color</option>
              {colors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.row2}>
            <select name="gender" value={form.gender} onChange={handleChange} required style={styles.input}>
              <option value="unisex">Unisex</option>
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
            </select>

            <input
              type="number"
              step="0.01"
              min="0"
              name="purchase_price"
              placeholder="Precio de compra"
              value={form.purchase_price}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.row2}>
            <input
              type="number"
              step="0.01"
              min="0"
              name="sale_price"
              placeholder="Precio de venta"
              value={form.sale_price}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              type="number"
              min="0"
              name="primary_index"
              placeholder="Índice imagen principal (0,1,2..)"
              value={form.primary_index}
              onChange={handleChange}
              style={styles.input}
            />
          </div>

          <div style={{ flex: "1 1 100%", marginBottom: 12 }}>
            <label>Imágenes (opcional): </label>
            <input type="file" multiple accept="image/*" ref={filesRef} />
          </div>

          <button type="submit" disabled={submitting} style={styles.submitButton}>
            {form.id ? (submitting ? "Actualizando..." : "Actualizar") : submitting ? "Creando..." : "Crear"}
          </button>
        </form>

        {mensaje && <p style={styles.message}>{mensaje}</p>}

        <section style={{ marginTop: 40 }}>
          <h2 style={{ marginBottom: 20 }}>Productos existentes</h2>
          {loading ? (
            <p>Cargando…</p>
          ) : products.length === 0 ? (
            <p>No hay productos disponibles.</p>
          ) : (
            <>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Imagen</th>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Tipo</th>
                    <th style={styles.th}>Marca</th>
                    <th style={styles.th}>Talla</th>
                    <th style={styles.th}>Color</th>
                    <th style={styles.th}>Género</th>
                    <th style={styles.th}>Compra</th>
                    <th style={styles.th}>Venta</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td style={styles.td}>{p.id}</td>
                      <td style={styles.td}>
                        {p.primary_image_url ? (
                          <img
                            src={p.primary_image_url}
                            alt={p.name}
                            style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 6 }}
                          />
                        ) : (
                          <span style={{ opacity: 0.6 }}>—</span>
                        )}
                      </td>
                      <td style={styles.td}>{p.name}</td>
                      <td style={styles.td}>{p.type}</td>
                      <td style={styles.td}>{p.brand}</td>
                      <td style={styles.td}>{p.size}</td>
                      <td style={styles.td}>{p.color}</td>
                      <td style={styles.td}>{p.gender}</td>
                      <td style={styles.td}>{mxn(p.purchase_price)}</td>
                      <td style={styles.td}>{mxn(p.sale_price)}</td>
                      <td style={styles.td}>
                        <button style={styles.editBtn} onClick={() => handleEdit(p)}>
                          Editar
                        </button>
                        <button style={styles.deleteBtn} onClick={() => handleDelete(p.id)}>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
                <button
                  disabled={meta.current_page <= 1}
                  onClick={() => fetchProducts(meta.current_page - 1)}
                >
                  Anterior
                </button>
                <span>
                  {meta.current_page} / {meta.last_page}
                </span>
                <button
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => fetchProducts(meta.current_page + 1)}
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

const styles = {
  pageContainer: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    paddingBottom: 40,
  },
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#007bff",
    padding: "0 20px",
    height: 60,
    color: "white",
  },
  logo: {
    fontWeight: "700",
    fontSize: "1.5rem",
  },
  navLinks: {
    display: "flex",
    gap: "25px",
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "1rem",
    transition: "color 0.3s ease",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    border: "none",
    padding: "8px 14px",
    borderRadius: "4px",
    color: "white",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  mainContent: {
    maxWidth: 1100,
    margin: "40px auto",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: 8,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#007bff",
    marginBottom: 20,
    textAlign: "center",
  },
  form: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    flex: "1 1 100%",
  },
  input: {
    flex: "1 1 250px",
    padding: 10,
    fontSize: 16,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  submitButton: {
    backgroundColor: "#007bff",
    color: "white",
    fontWeight: "600",
    border: "none",
    borderRadius: 4,
    padding: "10px 30px",
    cursor: "pointer",
    alignSelf: "center",
  },
  message: {
    textAlign: "center",
    marginTop: 15,
    color: "#28a745",
    fontWeight: "600",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    borderBottom: "2px solid #ddd",
    textAlign: "left",
    padding: "12px 10px",
  },
  td: {
    borderBottom: "1px solid #eee",
    padding: "10px",
  },
  editBtn: {
    marginRight: 8,
    backgroundColor: "#17a2b8",
    color: "white",
    border: "none",
    borderRadius: 4,
    padding: "6px 14px",
    cursor: "pointer",
  },
  deleteBtn: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: 4,
    padding: "6px 14px",
    cursor: "pointer",
  },
};

export default AdminProducts;
