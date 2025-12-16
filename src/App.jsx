import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ScanPage from './pages/ScanPage';
import ManualEntry from './pages/ManualEntry';
import CardLogic from './pages/CardLogic';
import Customers from './pages/Customers';
import StaffManager from './pages/StaffManager';
import AllCards from './pages/AllCards'; 
import ProtectedRoute from './Components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/scan" element={<ProtectedRoute><ScanPage /></ProtectedRoute>} />
        <Route path="/manual" element={<ProtectedRoute><ManualEntry /></ProtectedRoute>} />
        <Route path="/card-logic/:cardId" element={<ProtectedRoute><CardLogic /></ProtectedRoute>} />
        <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute requireAdmin={true}><StaffManager /></ProtectedRoute>} />
        <Route path="/all-cards" element={<ProtectedRoute requireAdmin={true}><AllCards /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;