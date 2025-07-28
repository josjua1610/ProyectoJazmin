import React, { useState } from 'react';
import axios from 'axios';

const RegisterProduct = () => {
  const [producto, setProducto] = useState({
    descripcion: '',
    price: '',
    stock: ''
  });

  const [mensaje, setMensaje] = useState('');

  const handleChange = e => {
    setProducto({ ...producto, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      // Cambia la URL si tu backend no corre en localhost:8000
      const response = await axios.post('http://localhost:8000/api/articles', producto);
      setMensaje('Producto registrado con éxito');
      setProducto({ descripcion: '', price: '', stock: '' });
    } catch (error) {
      setMensaje('Error al registrar el producto');
      console.error(error);
    }
  };

  return (
    <div className="auth-container">
      <h2>Registrar Producto</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="descripcion"
          placeholder="Descripción"
          value={producto.descripcion}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="number"
          name="price"
          placeholder="Precio"
          value={producto.price}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="number"
          name="stock"
          placeholder="Stock"
          value={producto.stock}
          onChange={handleChange}
          required
        />
        <br />
        <button type="submit">Registrar</button>
      </form>
      {mensaje && <p>{mensaje}</p>}
    </div>
  );
};

export default RegisterProduct;
