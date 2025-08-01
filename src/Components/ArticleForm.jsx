import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ArticleForm() {
  const [descripcion, setDescripcion] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook para redirigir

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { descripcion, price, stock };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/articles', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      
    }
  };

  return (

    <div className="auth-container">

      {/* 🔽 Botón para ir a la lista de productos */}
      <br />
      <button onClick={() => navigate('/articles')}>
        Ver Productos
      </button>
    </div>
  );
}
