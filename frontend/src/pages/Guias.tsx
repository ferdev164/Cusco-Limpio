import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TarjetaGuia from '../components/TarjetaGuia';
import { guiasApi } from '../services/guias.service';
import type { Guia } from '../services/guias.service';

export default function Guias() {
  const navigate = useNavigate();
  const [guias, setGuias] = useState<Guia[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    guiasApi
      .listar()
      .then(setGuias)
      .catch((err) =>
        setMensaje(err instanceof Error ? err.message : 'No se pudo cargar'),
      )
      .finally(() => setCargando(false));
  }, []);

  const reciclables = guias.filter((g) => g.categoria === 'reciclable');
  const noReciclables = guias.filter((g) => g.categoria === 'no_reciclable');

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
        <button
          onClick={() => navigate('/')}
          className="text-sm font-medium text-[#1a7a5e]"
        >
          Cusco Limpio
        </button>
        <button
          onClick={() => navigate('/login')}
          className="rounded-lg bg-[#1a7a5e] px-4 py-2 text-sm font-medium text-white hover:bg-[#155f49]"
        >
          Iniciar sesion
        </button>
      </header>

      <div className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Guias de reciclaje
        </h1>
        <p className="mb-8 text-sm text-slate-500">
          Aprende a clasificar correctamente tus residuos.
        </p>

        {mensaje && (
          <p className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {mensaje}
          </p>
        )}

        {cargando && <p className="text-sm text-slate-400">Cargando...</p>}

        {!cargando && guias.length === 0 && !mensaje && (
          <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
            Todavia no hay guias publicadas.
          </p>
        )}

        {reciclables.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-emerald-700">
              Reciclable
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {reciclables.map((g) => (
                <TarjetaGuia key={g.id} guia={g} />
              ))}
            </div>
          </div>
        )}

        {noReciclables.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-semibold text-slate-700">
              No reciclable
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {noReciclables.map((g) => (
                <TarjetaGuia key={g.id} guia={g} />
              ))}
            </div>
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
          <p className="mb-3 text-sm text-slate-600">
            Entérate de las próximas campañas de reciclaje de la municipalidad.
          </p>
          <a
            href="https://www.facebook.com/MedioAmbienteMPC"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-[#1877F2] px-5 py-2 text-sm font-semibold text-white hover:bg-[#166fe0]"
          >
            Síguenos en Facebook
          </a>
        </div>
      </div>
    </div>
  );
}
