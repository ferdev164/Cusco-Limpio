import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function salir() {
    cerrarSesion();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-slate-900">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-3">
          <div>
            <p className="text-sm font-medium text-gray-800">
              {usuario?.nombre || 'Administrador'}
            </p>
            <p className="text-xs text-gray-500">{usuario?.rol || 'admin'}</p>
          </div>
          <button
            onClick={salir}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            Cerrar sesion
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
