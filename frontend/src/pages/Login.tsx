import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/auth.service';

// El backend identifica el rol real (ciudadano, administrador o conductor)
// por el correo y redirige segun RBAC; no hay seleccion de rol en el cliente.
const destinosPorRol: Record<string, string> = {
  administrador: '/admin/dashboard',
  ciudadano: '/ciudadano/dashboard',
  conductor: '/conductor/dashboard',
};

export default function Login() {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { guardarSesion } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await login({ correo, contrasena });
      guardarSesion(res.access_token, res.usuario);
      navigate(destinosPorRol[res.usuario.rol] || '/');
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        setError('Correo o contrasena incorrectos');
      } else {
        setError(
          'No se pudo conectar con el servidor. Si estas probando en HTTPS local, entra directo a la URL del backend (puerto 3000) y acepta el certificado ahi tambien.',
        );
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-10 shadow-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="Volver al inicio"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 flex w-full flex-col items-center"
        >
          <div className="mb-3 rounded-2xl bg-green-700 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Cusco Limpio</h1>
          <p className="text-sm text-green-600">Inicia sesion para continuar</p>
        </button>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Correo</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-600">
              Contrasena
            </label>
            <input
              type="password"
              placeholder="********"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {error && <p className="text-center text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-lg bg-green-700 py-2 font-semibold text-white transition hover:bg-green-800 disabled:opacity-50"
          >
            {cargando ? 'Ingresando...' : 'Iniciar sesion'}
          </button>
        </form>

        <p
          onClick={() => navigate('/register')}
          className="mt-4 cursor-pointer text-center text-sm text-gray-400 hover:text-green-600"
        >
          No tienes cuenta ciudadana? Registrate aqui
        </p>
      </div>
    </div>
  );
}
