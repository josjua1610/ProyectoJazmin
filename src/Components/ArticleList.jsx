import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const toNumber = (v) => (v === null || v === undefined || v === '' ? 0 : Number(v));
const formatPrice = (v) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2 }).format(toNumber(v));

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const fetchArticles = useCallback(() => {
    fetch('http://localhost:8000/api/articles', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(async (res) => {
        // Maneja respuestas no-JSON o errores HTTP
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const raw = await res.json().catch(() => []);
        const list = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];

        // Normaliza campos y fuerza tipos
        const normalized = list.map((it) => ({
          id: it.id ?? it._id ?? it.uuid,
          descripcion: it.descripcion ?? it.description ?? '',
          price: toNumber(it.price ?? it.precio),
          stock: toNumber(it.stock ?? it.cantidad),
        }));

        setArticles(normalized);
      })
      .catch((err) => {
        console.error(err);
        setArticles([]); // evita que quede en estado inconsistente
      });
  }, [token]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Quieres eliminar este producto?')) return;

    try {
      // Sugerencia: usa el mismo host que en GET para evitar problemas de CORS/Cookies
      const res = await fetch(`http://localhost:8000/api/articles/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        fetchArticles();
      } else {
        alert('Error al eliminar producto');
      }
    } catch {
      alert('Error de conexión');
    }
  };

  const handleEdit = (id) => navigate(`/admin/products/edit/${id}`);

  return (
    <div className='auth-container'>
      <h2 style={styles.title}>Lista de Productos</h2>
      {articles.length === 0 ? (
        <p style={styles.noData}>No hay productos disponibles.</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Descripción</th>
              <th style={styles.th}>Precio ($)</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id}>
                <td style={styles.td}>{a.descripcion}</td>
                <td style={styles.td}>{formatPrice(a.price)}</td>
                <td style={styles.td}>{a.stock}</td>
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => handleEdit(a.id)}>Editar</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(a.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: 900, margin: '20px auto', fontFamily: 'Arial, sans-serif', padding: '10px' },
  title: { textAlign: 'center', marginBottom: '30px' },
  noData: { textAlign: 'center', fontStyle: 'italic' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left' },
  td: { borderBottom: '1px solid #eee', padding: '10px' },
  editBtn: { marginRight: 8, padding: '6px 12px', backgroundColor: '#17a2b8', border: 'none', color: 'white', borderRadius: 4, cursor: 'pointer' },
  deleteBtn: { padding: '6px 12px', backgroundColor: '#dc3545', border: 'none', color: 'white', borderRadius: 4, cursor: 'pointer' },
};

export default ArticleList;
