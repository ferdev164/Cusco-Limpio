import { useEffect, useState } from 'react';
import { operacionesApi } from '../services/operaciones.service';
import type { Ruta } from '../services/operaciones.service';

export default function Rutas() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    operacionesApi
      .rutas()
      .then(setRutas)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'No se pudo cargar'),
      );
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Rutas</h2>
        <p className="text-sm text-slate-500">
          Listado de rutas municipales registradas.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {rutas.map((ruta) => (
          <article
            key={ruta.id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-semibold">{ruta.nombre}</h3>
              <span className="text-sm text-slate-500">
                {ruta.zona || 'Sin zona'}
              </span>
            </div>
            <p className="mb-3 text-sm text-slate-500">
              {ruta.descripcion || 'Sin descripcion'}
            </p>
            <p className="text-sm text-slate-600">
              Distancia: {ruta.distancia_km || 0} km | Tiempo:{' '}
              {ruta.tiempo_estimado_min || 0} min
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
