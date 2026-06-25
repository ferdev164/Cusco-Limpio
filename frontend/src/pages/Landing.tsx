import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/hero.png';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a7a5e] text-sm font-bold text-white">
            CL
          </div>
          <div>
            <p className="font-bold text-gray-800">Cusco Limpio</p>
            <p className="text-xs text-gray-500">
              Sistema de recoleccion de residuos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/ciudadano')}
            className="rounded-lg border border-[#1a7a5e] px-4 py-2 text-sm font-medium text-[#1a7a5e] transition-colors hover:bg-green-50"
          >
            Ver horarios
          </button>
          <button
            onClick={() => navigate('/login')}
            className="rounded-lg bg-[#1a7a5e] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#155f49]"
          >
            Iniciar sesion
          </button>
        </div>
      </header>

      <section
        className="relative flex min-h-[520px] items-center justify-center px-6"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 mx-auto max-w-2xl py-24 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1a7a5e] text-lg font-bold text-white">
            CL
          </div>
          <h1 className="mb-4 text-4xl font-bold text-white">
            Gestion inteligente de residuos en Cusco
          </h1>
          <p className="mb-8 text-lg text-gray-200">
            Consulta los horarios de recoleccion de tu zona o accede al panel
            municipal para gestionar la flota y los turnos.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/ciudadano')}
              className="rounded-lg bg-[#1a7a5e] px-6 py-3 font-medium text-white transition-colors hover:bg-[#155f49]"
            >
              Ver horarios de recoleccion
            </button>
            <button
              onClick={() => navigate('/login')}
              className="rounded-lg border border-white px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
            >
              Panel municipal
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
