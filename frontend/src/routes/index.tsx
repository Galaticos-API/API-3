import type { JSX } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// componente temporario de proteção de rota
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = true; // na sprint 2 integrar com o JWT do nestJS
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==== ROTAS PUBLICAS ==== */}
        <Route path="/" element={<div className="p-4 text-2xl font-bold text-blue-600">Home Pública - DM Crédito</div>} />
        <Route path="/login" element={<div className="p-4">Tela de Login</div>} />

        {/* ==== ROTAS PRIVADAS ==== */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <div className="p-4 text-green-600 font-bold">Dashboard Interno (Mapa template)</div>
            </ProtectedRoute>
          } 
        />
        
        {/* ==== ROTA FALLBACK 404 ==== */}
        <Route path="*" element={<div className="p-4 text-red-500">Página não encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
};