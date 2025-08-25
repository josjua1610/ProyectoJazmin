import React, { useState } from 'react';
import './AuthForm.css';
import { Link, useNavigate } from 'react-router-dom';

export const API_URL = 'http://localhost:8000/api'; // URL de tu Flask backend

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleChange = e => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('name', data.name);

        // Redirigir según rol
        if (data.role === 'admin') navigate('/dashboard-admin');
        else if (data.role === 'vendedor') navigate('/dashboard-vendedor');
        else navigate('/dashboard-cliente');
      } else {
        alert(data.message || "Credenciales incorrectas");
      }
    } catch (error) {
      console.error(error);
      alert("Error al iniciar sesión");
    }
  };

  return (
    <div className="auth-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" name="email" placeholder="Correo" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
        <button type="submit">Entrar</button>
        <Link to="/register">¿No tienes cuenta? Regístrate</Link>
      </form>
    </div>
  );
}

export default Login;
