import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requireAdmin }) {
  // 1. Check if the user is logged in
  const staffName = localStorage.getItem("staffName");
  const staffRole = localStorage.getItem("staffRole");

  // 2. If not logged in, kick them to Login page
  if (!staffName) {
    return <Navigate to="/" replace />;
  }

  // 3. If Admin is required but user is not Admin, kick them to Dashboard
  if (requireAdmin && staffRole !== 'admin') {
    alert("⛔ Admin Access Required");
    return <Navigate to="/dashboard" replace />;
  }

  // 4. Allowed!
  return children;
}

export default ProtectedRoute;