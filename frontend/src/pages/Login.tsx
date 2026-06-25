import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/auth.service';
import type { RolLogin } from '../services/auth.service';

const destinosPorRol: Record<string, string> = {
  administrador: '/admin/dashboard',
  ciudadano: '/ciudadano/dashboard',
  conductor: '/conductor/dashboard',
};

export default function Login() {
  const [rol, setRol] = useState<RolLogin>('ciudadano');
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
      const res = await login({ correo, contrasena, rol });
      guardarSesion(res.access_token, res.usuario);
      navigate(destinosPorRol[res.usuario.rol] || '/');
    } catch (err: unknown) {
      setError('Correo, contrasena o tipo de usuario incorrectos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-10 shadow-md">
        <div className="mb-6 flex flex-col items-center">
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
          <p className="text-sm text-green-600">
            {rol === 'administrador' ? 'Panel municipal' : 'Acceso ciudadano'}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setRol('ciudadano')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              rol === 'ciudadano'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Ciudadano
          </button>
          <button
            type="button"
            onClick={() => setRol('administrador')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              rol === 'administrador'
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Administrador
          </button>
        </div>

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
            {cargando ? 'Ingresando...' : `Ingresar como ${rol}`}
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
