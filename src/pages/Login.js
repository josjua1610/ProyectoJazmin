import React, { useState } from 'react';
import './AuthForm.css';
import { Link } from 'react-router-dom';

function Login() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleChange = e => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        alert("Inicio de sesión exitoso");
      } else {
        alert("Credenciales incorrectas");
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
