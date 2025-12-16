import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requireAdmin }) {
  // 1. Check if the user is logged in (Do we have a name in memory?)
  const staffName = localStorage.getItem("staffName");
  const staffRole = localStorage.getItem("staffRole");

  // 2. If no user is found, kick them to the Login Page
  if (!staffName) {
    return <Navigate to="/" replace />;
  }

  // 3. (Optional) If the page requires Admin, but user is just a Cashier
  if (requireAdmin && staffRole !== 'admin') {
    alert("⛔ Admin Access Required");
    return <Navigate to="/dashboard" replace />;
  }

  // 4. If all checks pass, let them see the page!
  return children;
}

export default ProtectedRoute;