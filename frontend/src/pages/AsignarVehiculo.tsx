import { useEffect, useMemo, useState } from 'react';
import { operacionesApi } from '../services/operaciones.service';
import type { Vehiculo } from '../services/operaciones.service';

const estadoLabel: Record<string, string> = {
  disponible: 'Disponible',
  en_ruta: 'En ruta',
  mantenimiento: 'Mantenimiento',
  fuera_servicio: 'Fuera de servicio',
};

const estadoClass: Record<string, string> = {
  disponible: 'bg-emerald-50 text-emerald-700',
  en_ruta: 'bg-blue-50 text-blue-700',
  mantenimiento: 'bg-slate-100 text-slate-600',
  fuera_servicio: 'bg-red-50 text-red-700',
};

function formatKm(km: Vehiculo['km']) {
  const valor = typeof km === 'string' ? Number(km) : km || 0;
  return `${new Intl.NumberFormat('es-PE').format(valor)} km`;
}

export default function AsignarVehiculo() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [cargandoId, setCargandoId] = useState<number | null>(null);

  async function cargarVehiculos() {
    setVehiculos(await operacionesApi.vehiculos());
  }

  useEffect(() => {
    cargarVehiculos().catch((err) =>
      setMensaje(err instanceof Error ? err.message : 'No se pudo cargar'),
    );
  }, []);

  const stats = useMemo(
    () => [
      { label: 'Total flota', value: vehiculos.length },
      {
        label: 'Disponibles',
        value: vehiculos.filter((vehiculo) => vehiculo.estado === 'disponible')
          .length,
      },
      {
        label: 'En ruta',
        value: vehiculos.filter((vehiculo) => vehiculo.estado === 'en_ruta')
          .length,
      },
      {
        label: 'No operativos',
        value: vehiculos.filter((vehiculo) =>
          ['mantenimiento', 'fuera_servicio'].includes(vehiculo.estado),
        ).length,
      },
    ],
    [vehiculos],
  );

  async function asignar(vehiculoId: number) {
    setCargandoId(vehiculoId);
    setMensaje('');
    try {
      await operacionesApi.asignarVehiculo(vehiculoId);
      await cargarVehiculos();
      setMensaje('Vehiculo asignado a una programacion pendiente.');
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo asignar');
    } finally {
      setCargandoId(null);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Asignar vehiculo</h2>
        <p className="text-sm text-slate-500">
          Administra la flota y vincula camiones a turnos pendientes.
        </p>
      </div>

      {mensaje && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {mensaje}
        </p>
      )}

      <div className="mb-6 grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {vehiculos.map((vehiculo) => (
          <article
            key={vehiculo.id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-lg font-bold">{vehiculo.placa}</p>
                <p className="text-sm text-slate-500">{vehiculo.tipo}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  estadoClass[vehiculo.estado] || 'bg-slate-100 text-slate-600'
                }`}
              >
                {estadoLabel[vehiculo.estado] || vehiculo.estado}
              </span>
            </div>

            <div className="mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Capacidad</span>
                <span>{vehiculo.capacidad || 'Sin dato'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Kilometraje</span>
                <span>{formatKm(vehiculo.km)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Conductor</span>
                <span>{vehiculo.conductor || 'Sin asignar'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Zona</span>
                <span>{vehiculo.zona || 'Sin asignar'}</span>
              </div>
            </div>

            <button
              onClick={() => asignar(vehiculo.id)}
              disabled={vehiculo.estado !== 'disponible' || cargandoId === vehiculo.id}
              className="w-full rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cargandoId === vehiculo.id ? 'Asignando...' : 'Asignar'}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
