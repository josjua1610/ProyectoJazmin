import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://192.168.1.80:8000/api";
const mxn = (v) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(Number(v||0));

const ArticleList = () => {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/clothes?page=${page}`, {
        headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : [];
      // El controlador ya devuelve relaciones: type, brand, size, color, images
      const mapped = list.map(it => ({
        id: it.id,
        name: it.name,
        type: it.type?.name || "",
        brand: it.brand?.name || "",
        size: it.size?.name || "",
        color: it.color?.name || "",
        gender: it.gender,
        purchase_price: it.purchase_price,
        sale_price: it.sale_price,
        primary_image_url: it.primary_image?.url || it.images?.find(x => x.is_primary)?.url || it.images?.[0]?.url || null
      }));
      setRows(mapped);
      setMeta({ current_page: data.current_page ?? 1, last_page: data.last_page ?? 1 });
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(1); }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto?")) return;
    const res = await fetch(`${API}/clothes/${id}`, {
      method: "DELETE",
      headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (res.ok) load(meta.current_page);
    else alert("No se pudo eliminar");
  };

  const handleEdit = (id) => navigate(`/admin/products/edit/${id}`);

  return (
    <div className="auth-container" style={{ maxWidth: 1100, margin: "20px auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>Productos</h2>
      {loading ? <p>Cargando…</p> :
        rows.length === 0 ? <p style={{ textAlign: "center", fontStyle: "italic" }}>No hay productos.</p> : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>ID</th>
                <th style={th}>Nombre</th>
                <th style={th}>Tipo</th>
                <th style={th}>Marca</th>
                <th style={th}>Talla</th>
                <th style={th}>Color</th>
                <th style={th}>Género</th>
                <th style={th}>Compra</th>
                <th style={th}>Venta</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={td}>{r.id}</td>
                  <td style={td}>{r.name}</td>
                  <td style={td}>{r.type}</td>
                  <td style={td}>{r.brand}</td>
                  <td style={td}>{r.size}</td>
                  <td style={td}>{r.color}</td>
                  <td style={td}>{r.gender}</td>
                  <td style={td}>{mxn(r.purchase_price)}</td>
                  <td style={td}>{mxn(r.sale_price)}</td>
                  <td style={td}>
                    <button onClick={() => handleEdit(r.id)} style={btnInfo}>Editar</button>
                    <button onClick={() => handleDelete(r.id)} style={btnDanger}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 12 }}>
            <button disabled={meta.current_page <= 1} onClick={() => load(meta.current_page - 1)}>Anterior</button>
            <span>{meta.current_page} / {meta.last_page}</span>
            <button disabled={meta.current_page >= meta.last_page} onClick={() => load(meta.current_page + 1)}>Siguiente</button>
          </div>
        </>
      )}
    </div>
  );
};

const th = { borderBottom: "2px solid #ddd", padding: 8, textAlign: "left", whiteSpace: "nowrap" };
const td = { borderBottom: "1px solid #eee", padding: 8, verticalAlign: "middle" };
const btnInfo = { marginRight: 6, padding: "6px 10px", background: "#17b817ff", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };
const btnDanger = { padding: "6px 10px", background: "#dc3545", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };

export default ArticleList;
