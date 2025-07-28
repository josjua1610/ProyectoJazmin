import React, { useState } from 'react';

export default function RegisterProduct() {
  const [formData, setFormData] = useState({
    descripcion: '',
    price: '',
    stock: ''
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          descripcion: formData.descripcion,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock, 10)
        })
      });

      if (!response.ok) {
        throw new Error('Error al registrar el artículo');
      }

      setMessage('Artículo registrado correctamente');
      setFormData({ descripcion: '', price: '', stock: '' });
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Registrar artículo</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Descripción:</label><br />
          <input
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Precio:</label><br />
          <input
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Stock:</label><br />
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />
        </div>
        <br />
        <button type="submit">Registrar</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
