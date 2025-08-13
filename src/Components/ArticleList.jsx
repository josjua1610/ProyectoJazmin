import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Memorizamos fetchArticles para evitar que cambie y evitar el warning
  const fetchArticles = useCallback(() => {
    fetch('http://localhost:8000/api/articles', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => setArticles(data))
      .catch(console.error);
  }, [token]);

  // Ahora sí lo ponemos en las dependencias sin problema
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Quieres eliminar este producto?')) return;

    try {
      const res = await fetch(`http://192.168.1.65:8000/api/articles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
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

  const handleEdit = (id) => {
    navigate(`/admin/products/edit/${id}`);
  };

  return (
    <div style={styles.container}>
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
            {articles.map(a => (
              <tr key={a.id || a._id}>
                <td style={styles.td}>{a.descripcion}</td>
                <td style={styles.td}>{a.price.toFixed(2)}</td>
                <td style={styles.td}>{a.stock}</td>
                <td style={styles.td}>
                  <button style={styles.editBtn} onClick={() => handleEdit(a.id || a._id)}>Editar</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(a.id || a._id)}>Eliminar</button>
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
  container: {
    maxWidth: 900,
    margin: '20px auto',
    fontFamily: 'Arial, sans-serif',
    padding: '10px',
  },
  title: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  noData: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    borderBottom: '2px solid #ddd',
    padding: '10px',
    textAlign: 'left',
  },
  td: {
    borderBottom: '1px solid #eee',
    padding: '10px',
  },
  editBtn: {
    marginRight: 8,
    padding: '6px 12px',
    backgroundColor: '#17a2b8',
    border: 'none',
    color: 'white',
    borderRadius: 4,
    cursor: 'pointer',
  },
  deleteBtn: {
    padding: '6px 12px',
    backgroundColor: '#dc3545',
    border: 'none',
    color: 'white',
    borderRadius: 4,
    cursor: 'pointer',
  },
};

export default ArticleList;
