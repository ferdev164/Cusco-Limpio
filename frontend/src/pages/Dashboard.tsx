import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-10 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ¡Bienvenido, {usuario?.nombre}!
        </h1>
        <p className="text-green-600 mb-6">Rol: {usuario?.rol}</p>
        <button
          onClick={handleCerrarSesion}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}