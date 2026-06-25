import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { operacionesApi } from '../services/operaciones.service';
import type { Horario, Zona } from '../services/operaciones.service';

function formatHora(hora: string) {
  return hora.slice(0, 5);
}

export default function HorariosPublicos() {
  const navigate = useNavigate();
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [zonaId, setZonaId] = useState('');
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    operacionesApi
      .zonas()
      .then(setZonas)
      .catch((err) =>
        setMensaje(err instanceof Error ? err.message : 'No se pudo cargar'),
      );
  }, []);

  useEffect(() => {
    if (!zonaId) {
      setHorarios([]);
      return;
    }

    operacionesApi
      .horariosPorZona(Number(zonaId))
      .then(setHorarios)
      .catch((err) =>
        setMensaje(err instanceof Error ? err.message : 'No se pudo cargar'),
      );
  }, [zonaId]);

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

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#1a7a5e]">
            Consulta publica
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Horarios de recoleccion
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Selecciona tu zona para ver los turnos disponibles sin iniciar
            sesion.
          </p>
        </div>

        {mensaje && (
          <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {mensaje}
          </p>
        )}

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Zona
          </label>
          <select
            value={zonaId}
            onChange={(event) => setZonaId(event.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Seleccionar zona</option>
            {zonas.map((zona) => (
              <option key={zona.id} value={zona.id}>
                {zona.nombre}
              </option>
            ))}
          </select>

          <div className="mt-5 grid gap-3">
            {horarios.map((horario) => (
              <div
                key={horario.id}
                className="rounded-lg border border-gray-200 bg-gray-50 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{horario.turno}</p>
                  <span className="text-sm text-gray-500">{horario.dias}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {formatHora(horario.hora_inicio)} -{' '}
                  {formatHora(horario.hora_fin)}
                </p>
              </div>
            ))}
            {zonaId && horarios.length === 0 && (
              <p className="text-sm text-gray-500">
                No hay horarios registrados para esta zona.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
