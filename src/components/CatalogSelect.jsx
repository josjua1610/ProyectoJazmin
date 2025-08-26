// src/components/CatalogSelect.jsx
import React, { useEffect, useState } from "react";

const API_BASE = "http://192.168.1.80:8000/api";

export default function CatalogSelect({
  label, name, value, onChange, resource, extraFields = {}, token
}) {
  const [options, setOptions] = useState([]);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newHex, setNewHex]   = useState("#000000");
  const [loading, setLoading] = useState(true);
  const headers = { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };

  // Carga inicial
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/catalog/${resource}`, { headers })
      .then(r => r.json())
      .then(setOptions)
      .catch(() => setOptions([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const startAdd = () => { setAdding(true); setNewName(""); setNewHex("#000000"); };
  const cancelAdd = () => { setAdding(false); setNewName(""); };

  const createItem = async () => {
    if (!newName.trim()) return;
    const body = extraFields.hex ? { name: newName.trim(), hex_code: newHex } : { name: newName.trim() };

    const res = await fetch(`${API_BASE}/catalog/${resource}`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert("No se pudo crear. " + JSON.stringify(err?.errors || err));
      return;
    }

    const created = await res.json();
    // refrescar y seleccionar el nuevo
    const fresh = await fetch(`${API_BASE}/catalog/${resource}`, { headers }).then(r => r.json());
    setOptions(fresh);
    setAdding(false);
    // dispara onChange con el id recién creado
    onChange({ target: { name, value: created.id } });
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <label style={{ fontWeight: 600 }}>{label}</label>

      {!adding ? (
        <div style={{ display: "flex", gap: 8 }}>
          <select
            name={name}
            value={value || ""}
            onChange={onChange}
            required
            style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
            disabled={loading}
          >
            <option value="">{loading ? "Cargando…" : `Selecciona ${label.toLowerCase()}`}</option>
            {options.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
          <button type="button" onClick={startAdd} style={btnGhost}>➕ Agregar</button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          <input
            placeholder={`Nuevo ${label.toLowerCase()}`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
          />
          {extraFields.hex && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="color"
                value={newHex}
                onChange={(e) => setNewHex(e.target.value)}
                title="Color"
              />
              <input
                placeholder="#000000"
                value={newHex}
                onChange={(e) => setNewHex(e.target.value)}
                style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", width: 120 }}
              />
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={createItem} style={btnPrimary}>Guardar</button>
            <button type="button" onClick={cancelAdd} style={btnGhost}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

const btnPrimary = { padding: "8px 12px", background: "#007bff", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };
const btnGhost   = { padding: "8px 12px", background: "#f1f3f5", color: "#222", border: "1px solid #ced4da", borderRadius: 4, cursor: "pointer" };
