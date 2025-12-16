import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScanPage from './pages/ScanPage';
import ManualEntry from './pages/ManualEntry';
import CardLogic from './pages/CardLogic';
import Customers from './pages/Customers';
import StaffManager from './pages/StaffManager';

// The Security Guard
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route (Login) */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes (Must be logged in to see these) */}
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/scan" element={
          <ProtectedRoute>
             <ScanPage />
          </ProtectedRoute>
        } />

        <Route path="/manual" element={
          <ProtectedRoute>
             <ManualEntry />
          </ProtectedRoute>
        } />

        <Route path="/card-logic/:cardId" element={
          <ProtectedRoute>
             <CardLogic />
          </ProtectedRoute>
        } />

        <Route path="/customers" element={
          <ProtectedRoute>
             <Customers />
          </ProtectedRoute>
        } />

        {/* Staff Manager (Requires ADMIN access) */}
        <Route path="/staff" element={
          <ProtectedRoute requireAdmin={true}>
             <StaffManager />
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;