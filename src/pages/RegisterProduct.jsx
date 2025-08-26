import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "http://192.168.1.80:8000/api";

const ADD_NEW_VALUE = "__add_new__";

const RegisterProduct = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
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

  const [types, setTypes]   = useState([]);
  const [brands, setBrands] = useState([]);
  const [sizes, setSizes]   = useState([]);
  const [colors, setColors] = useState([]);

  const [mensaje, setMensaje] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const filesRef = useRef(null);

  // Estados para “agregar nuevo” en catálogos
  const [addingType, setAddingType]   = useState(false);
  const [addingBrand, setAddingBrand] = useState(false);
  const [addingColor, setAddingColor] = useState(false);

  const [newType, setNewType]   = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newColor, setNewColor] = useState({ name: "", hex_code: "#000000" });

  useEffect(() => {
    Promise.all([
      fetch(`${API}/catalog/types`).then(r => r.json()),
      fetch(`${API}/catalog/brands`).then(r => r.json()),
      fetch(`${API}/catalog/sizes`).then(r => r.json()),
      fetch(`${API}/catalog/colors`).then(r => r.json()),
    ])
      .then(([t, b, s, c]) => {
        setTypes(t || []);
        setBrands(b || []);
        setSizes(s || []);
        setColors(c || []);
      })
      .catch(() => setMensaje("No se pudieron cargar catálogos"));
  }, []);

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const onChange = (e) => {
    const { name, value } = e.target;

    // intercepta “Agregar nuevo…” para cada select
    if (name === "type_id" && value === ADD_NEW_VALUE) {
      setAddingType(true);
      setForm(prev => ({ ...prev, type_id: "" }));
      return;
    }
    if (name === "brand_id" && value === ADD_NEW_VALUE) {
      setAddingBrand(true);
      setForm(prev => ({ ...prev, brand_id: "" }));
      return;
    }
    if (name === "color_id" && value === ADD_NEW_VALUE) {
      setAddingColor(true);
      setForm(prev => ({ ...prev, color_id: "" }));
      return;
    }

    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Helpers para crear catálogo al vuelo
  const createCatalog = async (resource, body) => {
    const res = await fetch(`${API}/catalog/${resource}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", ...authHeader },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(JSON.stringify(err?.errors || err));
    }
    return res.json();
  };

  const refreshCatalog = async (resource, setter) => {
    const list = await fetch(`${API}/catalog/${resource}`, { headers: { Accept: "application/json", ...authHeader } })
      .then(r => r.json())
      .catch(() => []);
    setter(list || []);
    return list || [];
  };

  const saveNewType = async () => {
    if (!newType.trim()) return;
    try {
      const created = await createCatalog("types", { name: newType.trim() });
      const fresh   = await refreshCatalog("types", setTypes);
      setAddingType(false);
      setNewType("");
      setForm(prev => ({ ...prev, type_id: created.id }));
    } catch (e) {
      alert("No se pudo crear el tipo: " + e.message);
    }
  };

  const saveNewBrand = async () => {
    if (!newBrand.trim()) return;
    try {
      const created = await createCatalog("brands", { name: newBrand.trim() });
      await refreshCatalog("brands", setBrands);
      setAddingBrand(false);
      setNewBrand("");
      setForm(prev => ({ ...prev, brand_id: created.id }));
    } catch (e) {
      alert("No se pudo crear la marca: " + e.message);
    }
  };

  const saveNewColor = async () => {
    if (!newColor.name.trim()) return;
    try {
      const created = await createCatalog("colors", { name: newColor.name.trim(), hex_code: newColor.hex_code || null });
      await refreshCatalog("colors", setColors);
      setAddingColor(false);
      setNewColor({ name: "", hex_code: "#000000" });
      setForm(prev => ({ ...prev, color_id: created.id }));
    } catch (e) {
      alert("No se pudo crear el color: " + e.message);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setSubmitting(true);
    try {
      const fd = new FormData();
      // Campos obligatorios
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
      // Imágenes (opcionales)
      const files = Array.from(filesRef.current?.files || []);
      files.forEach(f => fd.append("images[]", f));

      const res = await fetch(`${API}/clothes`, {
        method: "POST",
        headers: { Accept: "application/json", ...authHeader }, // NO setear Content-Type manual
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(JSON.stringify(err?.errors || err));
      }

      setMensaje("Producto registrado con éxito");
      setForm({
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
    } catch (err) {
      setMensaje("Error: " + (err.message || "No se pudo registrar"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: 720, margin: "20px auto" }}>
      <h2>Registrar producto</h2>
      {mensaje && <p>{mensaje}</p>}

      <form onSubmit={onSubmit}>
        <input
          name="name"
          placeholder="Nombre / Descripción"
          value={form.name}
          onChange={onChange}
          required
          style={styles.input}
        />

        {/* Tipo y Marca */}
        <div style={styles.grid}>
          {/* Tipo */}
          {!addingType ? (
            <div>
              <select name="type_id" value={form.type_id} onChange={onChange} required style={styles.input}>
                <option value="">Tipo de prenda</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                <option value={ADD_NEW_VALUE}>➕ Agregar nuevo…</option>
              </select>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              <input
                placeholder="Nuevo tipo"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                style={styles.input}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={saveNewType} style={styles.btnPrimary}>Guardar</button>
                <button type="button" onClick={() => { setAddingType(false); setNewType(""); }} style={styles.btnGhost}>Cancelar</button>
              </div>
            </div>
          )}

          {/* Marca */}
          {!addingBrand ? (
            <div>
              <select name="brand_id" value={form.brand_id} onChange={onChange} required style={styles.input}>
                <option value="">Marca</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                <option value={ADD_NEW_VALUE}>➕ Agregar nuevo…</option>
              </select>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              <input
                placeholder="Nueva marca"
                value={newBrand}
                onChange={(e) => setNewBrand(e.target.value)}
                style={styles.input}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={saveNewBrand} style={styles.btnPrimary}>Guardar</button>
                <button type="button" onClick={() => { setAddingBrand(false); setNewBrand(""); }} style={styles.btnGhost}>Cancelar</button>
              </div>
            </div>
          )}
        </div>

        {/* Talla y Color */}
        <div style={styles.grid}>
          {/* Talla (sin agregar) */}
          <select name="size_id" value={form.size_id} onChange={onChange} required style={styles.input}>
            <option value="">Talla</option>
            {sizes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          {/* Color (con hex opcional) */}
          {!addingColor ? (
            <div>
              <select name="color_id" value={form.color_id} onChange={onChange} required style={styles.input}>
                <option value="">Color</option>
                {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                <option value={ADD_NEW_VALUE}>➕ Agregar nuevo…</option>
              </select>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              <input
                placeholder="Nombre del color"
                value={newColor.name}
                onChange={(e) => setNewColor(prev => ({ ...prev, name: e.target.value }))}
                style={styles.input}
              />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="color"
                  value={newColor.hex_code}
                  onChange={(e) => setNewColor(prev => ({ ...prev, hex_code: e.target.value }))}
                  title="Código HEX"
                />
                <input
                  placeholder="#000000"
                  value={newColor.hex_code}
                  onChange={(e) => setNewColor(prev => ({ ...prev, hex_code: e.target.value }))}
                  style={{ ...styles.input, width: 140 }}
                />
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={saveNewColor} style={styles.btnPrimary}>Guardar</button>
                <button type="button" onClick={() => { setAddingColor(false); setNewColor({ name: "", hex_code: "#000000" }); }} style={styles.btnGhost}>Cancelar</button>
              </div>
            </div>
          )}
        </div>

        {/* Género + Precios */}
        <div style={styles.grid}>
          <select name="gender" value={form.gender} onChange={onChange} required style={styles.input}>
            <option value="unisex">Unisex</option>
            <option value="male">Hombre</option>
            <option value="female">Mujer</option>
          </select>

          <input
            type="number" step="0.01" min="0"
            name="purchase_price" placeholder="Precio de compra"
            value={form.purchase_price} onChange={onChange} required style={styles.input}
          />
        </div>

        <div style={styles.grid}>
          <input
            type="number" step="0.01" min="0"
            name="sale_price" placeholder="Precio de venta"
            value={form.sale_price} onChange={onChange} required style={styles.input}
          />
        </div>

        <button type="submit" disabled={submitting} style={styles.btnPrimary}>
          {submitting ? "Guardando..." : "Registrar"}
        </button>
      </form>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => navigate("/articles")} // cambia si tu ruta es otra
          style={{ padding: "8px 12px", background: "#9638e3", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
        >
          Ver productos
        </button>
      </div>
    </div>
  );
};

const styles = {
  input: { width: "100%", padding: 8, marginBottom: 12, borderRadius: 4, border: "1px solid #ccc" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  btnPrimary: { padding: "10px 16px", background: "#9638e3", border: "none", color: "#fff", borderRadius: 4, cursor: "pointer" },
  btnGhost: { padding: "10px 16px", background: "#f1f3f5", border: "1px solid #ced4da", color: "#222", borderRadius: 4, cursor: "pointer" },
};

export default RegisterProduct;
