import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { operacionesApi } from '../services/operaciones.service';
import type { ReporteZona, Zona } from '../services/operaciones.service';

const EJE_ESTILO = { fontSize: 12, fill: '#64748b' };
const TOOLTIP_ESTILO = {
  contentStyle: {
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
    fontSize: 13,
  },
  cursor: { fill: '#f1f5f9' },
};

const COLOR_RECICLABLE = '#047857';
const COLOR_NO_RECICLABLE = '#1d4ed8';

function ejeXProps() {
  return {
    dataKey: 'zona' as const,
    tick: EJE_ESTILO,
    axisLine: { stroke: '#e2e8f0' },
    tickLine: false,
    interval: 0,
    angle: -20,
    textAnchor: 'end' as const,
    height: 50,
  };
}

function GraficoSimple({
  titulo,
  descripcion,
  data,
  color,
  sufijo,
}: {
  titulo: string;
  descripcion: string;
  data: { zona: string; valor: number }[];
  color: string;
  sufijo: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="text-sm font-semibold text-slate-900">{titulo}</h3>
      <p className="mb-4 text-xs text-slate-500">{descripcion}</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis {...ejeXProps()} />
          <YAxis tick={EJE_ESTILO} axisLine={false} tickLine={false} width={36} />
          <Tooltip
            {...TOOLTIP_ESTILO}
            formatter={(valor: number) => [`${valor}${sufijo}`, titulo]}
          />
          <Bar dataKey="valor" fill={color} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

function GraficoVolumen({ data }: { data: ReporteZona[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 lg:col-span-2">
      <h3 className="text-sm font-semibold text-slate-900">
        Volumen recolectado por tipo
      </h3>
      <p className="mb-4 text-xs text-slate-500">
        Toneladas estimadas segun la capacidad del vehiculo de cada recojo
        finalizado, separadas por tipo de residuo.
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis {...ejeXProps()} />
          <YAxis tick={EJE_ESTILO} axisLine={false} tickLine={false} width={36} />
          <Tooltip
            {...TOOLTIP_ESTILO}
            formatter={(valor: number, nombre: string) => [`${valor} ton`, nombre]}
          />
          <Legend
            wrapperStyle={{ fontSize: 12, color: '#52514e' }}
            iconType="circle"
            iconSize={8}
          />
          <Bar
            dataKey="volumenReciclableTon"
            name="Reciclable"
            stackId="volumen"
            fill={COLOR_RECICLABLE}
            radius={[0, 0, 0, 0]}
            maxBarSize={48}
          />
          <Bar
            dataKey="volumenNoReciclableTon"
            name="No reciclable"
            stackId="volumen"
            fill={COLOR_NO_RECICLABLE}
            radius={[4, 4, 0, 0]}
            maxBarSize={48}
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

function aCsv(reportes: ReporteZona[]): string {
  const encabezado = [
    'Zona',
    'Cumplimiento %',
    'Tiempo promedio (min)',
    'Recojos finalizados',
    'Volumen reciclable (ton)',
    'Volumen no reciclable (ton)',
  ];
  const filas = reportes.map((r) => [
    r.zona,
    r.cumplimientoPct,
    r.promedioMin,
    r.cantidadRecojos,
    r.volumenReciclableTon,
    r.volumenNoReciclableTon,
  ]);
  return [encabezado, ...filas].map((fila) => fila.join(',')).join('\n');
}

function descargarCsv(reportes: ReporteZona[]) {
  const csv = aCsv(reportes);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `reporte-cusco-limpio-${new Date().toISOString().slice(0, 10)}.csv`;
  enlace.click();
  URL.revokeObjectURL(url);
}

export default function Reportes() {
  const [reportes, setReportes] = useState<ReporteZona[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [zonaId, setZonaId] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    void operacionesApi.zonas().then(setZonas).catch(() => undefined);
  }, []);

  async function cargar() {
    setCargando(true);
    setMensaje('');
    try {
      setReportes(
        await operacionesApi.recojosReportes({
          zonaId: zonaId ? Number(zonaId) : undefined,
          desde: desde || undefined,
          hasta: hasta || undefined,
        }),
      );
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo cargar');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zonaId, desde, hasta]);

  const conDatos = useMemo(
    () => reportes.filter((r) => r.programacionesTotal > 0),
    [reportes],
  );

  return (
    <div className="p-8 print:p-0">
      <div className="mb-6 flex items-start justify-between print:mb-4">
        <div>
          <h2 className="text-2xl font-bold">Reportes</h2>
          <p className="text-sm text-slate-500">
            Cumplimiento de rutas, tiempos y volumen recolectado por zona.
          </p>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => descargarCsv(conDatos)}
            disabled={conDatos.length === 0}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Imprimir
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4 print:hidden">
        <div>
          <label className="mb-1 block text-xs text-slate-500">Zona</label>
          <select
            value={zonaId}
            onChange={(e) => setZonaId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todas las zonas</option>
            {zonas.map((zona) => (
              <option key={zona.id} value={zona.id}>
                {zona.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Desde</label>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Hasta</label>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        {(zonaId || desde || hasta) && (
          <button
            onClick={() => {
              setZonaId('');
              setDesde('');
              setHasta('');
            }}
            className="text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {mensaje && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {mensaje}
        </p>
      )}

      {!cargando && conDatos.length === 0 && (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
          No hay datos para los filtros seleccionados.
        </p>
      )}

      {conDatos.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <GraficoSimple
            titulo="Cumplimiento de rutas y horarios"
            descripcion="% de turnos programados que ya tuvieron al menos un recojo finalizado."
            data={conDatos.map((r) => ({ zona: r.zona, valor: r.cumplimientoPct }))}
            color="#047857"
            sufijo="%"
          />
          <GraficoSimple
            titulo="Tiempo promedio"
            descripcion="Minutos que toma en promedio completar un recojo."
            data={conDatos.map((r) => ({ zona: r.zona, valor: r.promedioMin }))}
            color="#b45309"
            sufijo=" min"
          />
          <GraficoVolumen data={conDatos} />
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400 print:mt-2">
        El volumen es una estimacion basada en la capacidad declarada de cada
        vehiculo (reciclador vs. compactador), no una medicion real de peso.
        Reporte generado el {new Date().toLocaleString('es-PE')}.
      </p>
    </div>
  );
}
