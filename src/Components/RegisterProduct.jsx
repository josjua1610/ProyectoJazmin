import React, { useState } from 'react';

const RegisterProduct = () => {
  const [form, setForm] = useState({ descripcion: '', price: '', stock: '' });
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:8000/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMensaje('Producto registrado con éxito');
        setForm({ descripcion: '', price: '', stock: '' });
      } else {
        setMensaje('Error al registrar producto');
      }
    } catch {
      setMensaje('Error al conectar al servidor');
    }
  };

  return (
  <div className='auth-container'>
    <form onSubmit={handleSubmit}>
      <input name="descripcion" placeholder="Descripción" value={form.descripcion} onChange={handleChange} required />
      <input name="price" type="number" placeholder="Precio" value={form.price} onChange={handleChange} required />
      <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
      <button type="submit">Registrar Producto</button>
      {mensaje && <p>{mensaje}</p>}
    </form>
  </div>
  );
};

export default RegisterProduct;
