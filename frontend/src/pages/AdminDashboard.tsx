import { useEffect, useMemo, useState } from 'react';
import { operacionesApi } from '../services/operaciones.service';
import type {
  Programacion,
  Ruta,
  Vehiculo,
  Zona,
} from '../services/operaciones.service';

export default function AdminDashboard() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargar() {
      try {
        const [zonasData, rutasData, vehiculosData, programacionesData] =
          await Promise.all([
            operacionesApi.zonas(),
            operacionesApi.rutas(),
            operacionesApi.vehiculos(),
            operacionesApi.programaciones(),
          ]);
        setZonas(zonasData);
        setRutas(rutasData);
        setVehiculos(vehiculosData);
        setProgramaciones(programacionesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar');
      }
    }

    void cargar();
  }, []);

  const stats = useMemo(
    () => [
      { label: 'Zonas activas', value: zonas.length },
      { label: 'Rutas registradas', value: rutas.length },
      {
        label: 'Vehiculos en ruta',
        value: vehiculos.filter((vehiculo) => vehiculo.estado === 'en_ruta')
          .length,
      },
      {
        label: 'Turnos pendientes',
        value: programaciones.filter((programacion) => !programacion.vehiculo)
          .length,
      },
    ],
    [programaciones, rutas, vehiculos, zonas],
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">Gestion municipal</h2>
        <p className="text-sm text-slate-500">
          Horarios, rutas y flota para la recoleccion.
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-4 gap-4">
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
    </div>
  );
}
