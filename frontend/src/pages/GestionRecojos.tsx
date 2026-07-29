import { useEffect, useState } from 'react';
import { operacionesApi } from '../services/operaciones.service';
import type { RecojoAdmin, ReporteZona } from '../services/operaciones.service';

function formatFechaHora(valor: string | null) {
  if (!valor) return '—';
  const fecha = new Date(valor);
  return fecha.toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function GestionRecojos() {
  const [recojos, setRecojos] = useState<RecojoAdmin[]>([]);
  const [reportes, setReportes] = useState<ReporteZona[]>([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    async function cargar() {
      try {
        const [recojosData, reportesData] = await Promise.all([
          operacionesApi.recojosTodos(),
          operacionesApi.recojosReportes(),
        ]);
        setRecojos(recojosData);
        setReportes(reportesData);
      } catch (err) {
        setMensaje(err instanceof Error ? err.message : 'No se pudo cargar');
      }
    }

    void cargar();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Recojos y tiempos</h2>
        <p className="text-sm text-slate-500">
          Tiempo que toman los conductores en completar cada recojo, por zona.
        </p>
      </div>

      {mensaje && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {mensaje}
        </p>
      )}

      <div className="mb-6 grid grid-cols-4 gap-4">
        {reportes
          .filter((reporte) => reporte.cantidadRecojos > 0)
          .map((reporte) => (
            <div
              key={reporte.zona}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <p className="text-3xl font-bold">{reporte.promedioMin} min</p>
              <p className="text-sm text-slate-500">
                Promedio en {reporte.zona} ({reporte.cantidadRecojos} recojos)
              </p>
            </div>
          ))}
        {reportes.every((reporte) => reporte.cantidadRecojos === 0) && (
          <p className="col-span-4 text-sm text-slate-400">
            Todavia no hay recojos finalizados para calcular promedios.
          </p>
        )}
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Conductor</th>
              <th className="px-4 py-3 font-medium">Zona</th>
              <th className="px-4 py-3 font-medium">Vehiculo</th>
              <th className="px-4 py-3 font-medium">Inicio</th>
              <th className="px-4 py-3 font-medium">Fin</th>
              <th className="px-4 py-3 font-medium">Tiempo</th>
              <th className="px-4 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recojos.map((recojo) => (
              <tr key={recojo.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">
                  {recojo.conductor || '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {recojo.zona || '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {recojo.vehiculo || '—'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatFechaHora(recojo.horaInicio)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatFechaHora(recojo.horaFin)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {recojo.tiempoTranscurridoMin != null
                    ? `${recojo.tiempoTranscurridoMin} min`
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      recojo.estado === 'finalizado'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {recojo.estado === 'finalizado' ? 'Finalizado' : 'En curso'}
                  </span>
                </td>
              </tr>
            ))}
            {recojos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No hay recojos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
