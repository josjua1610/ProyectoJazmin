import React, { useState } from 'react';
import './AuthForm.css';
import { Link } from 'react-router-dom';
export const API_URL = 'http://192.168.1.65:8000/api';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cliente' // rol fijo a cliente
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Enviar siempre role: "cliente" independientemente del formData.role (por seguridad)
       const res = await fetch(`http://192.168.1.65:8000/api/register`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: 'cliente'  // forzamos cliente aquí
        })
      });
      const data = await res.json();
      alert("Registro exitoso");
      console.log(data);
    } catch (error) {
      console.error(error);
      alert("Error al registrar");
    }
  };

  return (
    <div className="auth-container">
      <h2>Registro</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Nombre"
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Correo"
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Contraseña"
          onChange={handleChange}
          required
        />

        {/* Eliminamos el select de rol */}

        <button type="submit">Registrarse</button>
        <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
      </form>
    </div>
  );
}

export default Register;
