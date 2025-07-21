import React, { useState } from 'react';
import './AuthForm.css'; // Asegúrate de tener este archivo en src
import { Link } from 'react-router-dom'; // Para el enlace a /login

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
        <button type="submit">Registrarse</button>
        <Link to="/login">¿Ya tienes cuenta? Inicia sesión</Link>
      </form>
    </div>
  );
}

export default Register;
