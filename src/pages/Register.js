import React, { useState } from 'react';
import './AuthForm.css';
import { Link } from 'react-router-dom';

export const API_URL = 'http://172.20.10.7:8000/api'; // URL de tu Flask backend

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // ✅ Validación de contraseña
    if (formData.password.length < 9) {
      alert("La contraseña debe tener al menos 9 caracteres");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/register`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password, 
          role: 'cliente'  // rol fijo a cliente
        })
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Registro exitoso");
      } else {
        alert(data.message || "Error al registrar");
      }
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
          placeholder="Contraseña (mínimo 9 caracteres)" 
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
