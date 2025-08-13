import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/Login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/Login" replace />;
  }

  return children;
}

export default PrivateRoute;
