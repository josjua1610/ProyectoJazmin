import React, { useEffect, useState } from 'react';

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [editando, setEditando] = useState(null); // ID del artículo en edición
  const [formData, setFormData] = useState({
    descripcion: '',
    price: '',
    stock: '',
  });

  useEffect(() => {
    obtenerArticulos();
  }, []);

  const obtenerArticulos = async () => {
    const res = await fetch('http://127.0.0.1:8000/api/articles');
    const data = await res.json();
    setArticles(data);
  };

  const eliminarArticulo = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/articles/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setArticles(prev => prev.filter(article => (article._id || article.id) !== id));
      } else {
        console.error('No se pudo eliminar');
      }
    } catch (error) {
      console.error('Error al eliminar artículo:', error);
    }
  };

  const iniciarEdicion = (article) => {
    setEditando(article._id || article.id);
    setFormData({
      descripcion: article.descripcion,
      price: article.price,
      stock: article.stock,
    });
  };

  const actualizarArticulo = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/articles/${editando}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await obtenerArticulos();
        setEditando(null);
        setFormData({ descripcion: '', price: '', stock: '' });
      } else {
        console.error('Error al actualizar');
      }
    } catch (error) {
      console.error('Error en la petición:', error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Lista de Productos</h2>
      <ul>
        {articles.length > 0 ? (
          articles.map(article => (
            <li key={article._id || article.id} style={{ marginBottom: '10px' }}>
              <strong>{article.descripcion}</strong><br />
              Precio: ${article.price} | Stock: {article.stock}
              <br />
              <button onClick={() => eliminarArticulo(article._id || article.id)}>Eliminar</button>
              <button onClick={() => iniciarEdicion(article)}>Editar</button>
            </li>
          ))
        ) : (
          <p>No hay productos registrados.</p>
        )}
      </ul>

      {editando && (
        <form onSubmit={actualizarArticulo} style={{ marginTop: '20px' }}>
          <h3>Editar Producto</h3>
          <input
            type="text"
            placeholder="Descripción"
            value={formData.descripcion}
            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Precio"
            value={formData.price}
            onChange={e => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <input
            type="number"
            placeholder="Stock"
            value={formData.stock}
            onChange={e => setFormData({ ...formData, stock: e.target.value })}
            required
          />
          <button type="submit">Guardar Cambios</button>
          <button type="button" onClick={() => setEditando(null)}>Cancelar</button>
        </form>
      )}
    </div>
  );
};

export default ArticleList;
