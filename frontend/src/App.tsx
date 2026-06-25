import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import AdminOperaciones from './pages/AdminOperaciones';
import Dashboard from './pages/Dashboard';
import HorariosPublicos from './pages/HorariosPublicos';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import type { RolUsuario } from './services/auth.service';

const destinosPorRol: Record<RolUsuario, string> = {
  administrador: '/admin/dashboard',
  ciudadano: '/ciudadano/dashboard',
  conductor: '/conductor/dashboard',
};

function RutaPorRol({
  rol,
  children,
}: {
  rol: RolUsuario;
  children: ReactNode;
}) {
  const { usuario, token } = useAuth();

  if (!token || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (usuario.rol !== rol) {
    return <Navigate to={destinosPorRol[usuario.rol]} replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/ciudadano" element={<HorariosPublicos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/ciudadano/dashboard"
            element={
              <RutaPorRol rol="ciudadano">
                <Dashboard />
              </RutaPorRol>
            }
          />
          <Route
            path="/admin"
            element={
              <RutaPorRol rol="administrador">
                <AdminLayout />
              </RutaPorRol>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="operaciones" element={<AdminOperaciones />} />
            <Route path="zonas" element={<Navigate to="/admin/operaciones" replace />} />
            <Route path="horarios" element={<Navigate to="/admin/operaciones" replace />} />
            <Route path="vehiculos" element={<Navigate to="/admin/operaciones" replace />} />
          </Route>
          <Route
            path="/conductor/dashboard"
            element={
              <RutaPorRol rol="conductor">
                <Dashboard />
              </RutaPorRol>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
