import { useEffect, useMemo, useState } from 'react';
import { operacionesApi } from '../services/operaciones.service';
import type {
  Ruta,
  Vehiculo,
  Zona,
} from '../services/operaciones.service';

function formatDistancia(valor: number | null) {
  return valor ? `${valor.toFixed(1)} km` : '0 km';
}

function formatTiempo(minutos: number) {
  if (!minutos) return '0 min';
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return horas ? `${horas}h ${resto} min` : `${resto} min`;
}

export default function AsignarZona() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [zonaId, setZonaId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargar() {
      try {
        const [zonasData, rutasData, vehiculosData] = await Promise.all([
          operacionesApi.zonas(),
          operacionesApi.rutas(),
          operacionesApi.vehiculos(),
        ]);
        setZonas(zonasData);
        setRutas(rutasData);
        setVehiculos(vehiculosData);
        setZonaId(zonasData[0]?.id ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar');
      }
    }

    void cargar();
  }, []);

  const zonaActiva = useMemo(
    () => zonas.find((zona) => zona.id === zonaId) || null,
    [zonaId, zonas],
  );

  const rutasZona = useMemo(() => {
    if (!zonaActiva) return [];
    const termino = busqueda.trim().toLowerCase();
    return rutas.filter((ruta) => {
      const mismaZona = ruta.zona === zonaActiva.nombre;
      const coincide =
        !termino ||
        ruta.nombre.toLowerCase().includes(termino) ||
        (ruta.descripcion || '').toLowerCase().includes(termino);
      return mismaZona && coincide;
    });
  }, [busqueda, rutas, zonaActiva]);

  const distanciaTotal = rutasZona.reduce(
    (total, ruta) => total + (ruta.distancia_km || 0),
    0,
  );
  const tiempoTotal = rutasZona.reduce(
    (total, ruta) => total + (ruta.tiempo_estimado_min || 0),
    0,
  );

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Zonas y rutas</h2>
          <p className="text-sm text-slate-500">
            Consulta las rutas municipales por zona de recoleccion.
          </p>
        </div>
        <input
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar ruta"
          className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          { label: 'Zonas activas', value: zonas.length },
          { label: 'Rutas totales', value: rutas.length },
          {
            label: 'Vehiculos en ruta',
            value: vehiculos.filter((vehiculo) => vehiculo.estado === 'en_ruta')
              .length,
          },
          {
            label: 'No operativos',
            value: vehiculos.filter((vehiculo) =>
              ['mantenimiento', 'fuera_servicio'].includes(vehiculo.estado),
            ).length,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="mb-5 flex flex-wrap gap-2">
          {zonas.map((zona) => (
            <button
              key={zona.id}
              onClick={() => setZonaId(zona.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${
                zona.id === zonaId
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {zona.nombre}
            </button>
          ))}
        </div>

        {zonaActiva ? (
          <>
            <div className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-2xl font-bold">{rutasZona.length}</p>
                <p className="text-sm text-slate-500">Rutas</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-2xl font-bold">
                  {formatDistancia(distanciaTotal)}
                </p>
                <p className="text-sm text-slate-500">Distancia total</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-2xl font-bold">
                  {formatTiempo(tiempoTotal)}
                </p>
                <p className="text-sm text-slate-500">Tiempo estimado</p>
              </div>
            </div>

            <div className="space-y-3">
              {rutasZona.map((ruta) => (
                <div
                  key={ruta.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
                >
                  <div>
                    <p className="font-semibold">{ruta.nombre}</p>
                    <p className="text-sm text-slate-500">
                      {ruta.descripcion || 'Sin descripcion'}
                    </p>
                  </div>
                  <p className="text-sm text-slate-500">
                    {formatDistancia(ruta.distancia_km)} |{' '}
                    {formatTiempo(ruta.tiempo_estimado_min || 0)}
                  </p>
                </div>
              ))}
              {rutasZona.length === 0 && (
                <p className="text-sm text-slate-500">
                  No hay rutas registradas para esta zona.
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-slate-500">No hay zonas registradas.</p>
        )}
      </section>
    </div>
  );
}
