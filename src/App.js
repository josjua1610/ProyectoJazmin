import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterProduct from './components/RegisterProduct';
import ArticleList from './components/ArticleList';
import ArticleForm from './components/ArticleForm';

import DashboardAdmin from './pages/DashboardAdmin';
import DashboardVendedor from './pages/DashboardVendedor';
import DashboardCliente from './pages/DashboardCliente';
import AdminUsers from './pages/AdminUsers';
import AdminProducts from './pages/AdminProducts';
import VentasList from './pages/VentasList';
import ReporteVentas from './pages/ReporteVentas'; 
import CreateSale from './pages/CreateSale';
import VentasAdmin from './pages/VentasAdmin';

import PrivateRoute from './components/PrivateRoute';  // importa PrivateRoute

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/RegisterProduct" element={<RegisterProduct />} />
        <Route path="/ArticleForm" element={<ArticleForm />} />
        <Route path="/articles" element={<ArticleList />} />
        <Route path="/crear-venta" element={<CreateSale token={localStorage.getItem('token')} />} />
        <Route path="/ventas" element={<VentasAdmin />} />
        <Route
  path="/admin/users"
  element={
    <PrivateRoute allowedRoles={['admin']}>
      <AdminUsers />
    </PrivateRoute>
  }
/>
<Route
  path="/reportes/ventas"
  element={
    <PrivateRoute allowedRoles={['admin']}>
      <ReporteVentas />
    </PrivateRoute>
  }
/>
<Route
  path="/admin/products"
  element={
    <PrivateRoute allowedRoles={['admin']}>
      <AdminProducts />
    </PrivateRoute>
  }
/>
<Route
  path="/ventas"
  element={
    <PrivateRoute allowedRoles={['admin', 'vendedor']}>
      <VentasList token={localStorage.getItem('token')} />
    </PrivateRoute>
  }
/>


        {/* Rutas protegidas */}
        <Route
          path="/dashboard-admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard-vendedor"
          element={
            <PrivateRoute allowedRoles={['vendedor']}>
              <DashboardVendedor />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard-cliente"
          element={
            <PrivateRoute allowedRoles={['cliente']}>
              <DashboardCliente />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
