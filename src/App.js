import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterProduct from './components/RegisterProduct';
import ArticleList from './components/ArticleList';


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/register-product" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/register-product" element={<RegisterProduct />} />
      <Route path="/products" element={<ArticleList mode="view" />} />
      <Route path="/manage" element={<ArticleList mode="manage" />} />

      <Route path="*" element={<Navigate to="/register-product" replace />} />
    </Routes>
  );
}