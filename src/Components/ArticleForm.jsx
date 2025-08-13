import React, { useState } from 'react';

const ArticleForm = ({ onSubmit }) => {
  const [descripcion, setDescripcion] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar campos
    if (!descripcion || !price || !stock) {
      setMessage('Por favor completa todos los campos.');
      return;
    }

    const newArticle = {
      descripcion,
      price: parseFloat(price),
      stock: parseInt(stock),
    };

    // Ejecutar función pasada por props (puede ser fetch para backend)
    if (onSubmit) onSubmit(newArticle);

    setMessage('Producto agregado correctamente.');

    // Limpiar formulario
    setDescripcion('');
    setPrice('');
    setStock('');
  };

  return (
    <div style={styles.formContainer}>
      <h2>Agregar Producto</h2>
      {message && <p style={styles.message}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Precio"
          value={price}
          onChange={e => setPrice(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={e => setStock(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Agregar</button>
      </form>
    </div>
  );
};

const styles = {
  formContainer: {
    maxWidth: 400,
    margin: '20px auto',
    padding: 20,
    border: '1px solid #ddd',
    borderRadius: 6,
    backgroundColor: '#fafafa',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: 8,
    marginBottom: 12,
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  button: {
    padding: '8px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  message: {
    marginBottom: 10,
    color: 'green',
  },
};

export default ArticleForm;
