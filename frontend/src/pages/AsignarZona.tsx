import { useEffect, useMemo, useState } from 'react';
import { operacionesApi } from '../services/operaciones.service';
import type {
  Ruta,
  RutaInput,
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

const formVacio: RutaInput = {
  nombre: '',
  zonaId: undefined,
  descripcion: '',
  distanciaKm: 0,
  tiempoEstimadoMin: 0,
};

export default function AsignarZona() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [zonaId, setZonaId] = useState<number | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Estados CRUD
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<RutaInput>(formVacio);
  const [guardando, setGuardando] = useState(false);
  const [confirmar, setConfirmar] = useState<Ruta | null>(null);

  async function cargar() {
    const [zonasData, rutasData, vehiculosData] = await Promise.all([
      operacionesApi.zonas(),
      operacionesApi.rutas(),
      operacionesApi.vehiculos(),
    ]);
    setZonas(zonasData);
    setRutas(rutasData);
    setVehiculos(vehiculosData);
    setZonaId((prev) => prev ?? zonasData[0]?.id ?? null);
  }

  useEffect(() => {
    cargar().catch((err) =>
      setError(err instanceof Error ? err.message : 'No se pudo cargar'),
    );
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

  // ── Crear ──
  function abrirCrear() {
    setEditandoId(null);
    setForm({ ...formVacio, zonaId: zonaActiva?.id ?? zonas[0]?.id });
    setModalAbierto(true);
  }

  // ── Editar ──
  function abrirEditar(ruta: Ruta) {
    setEditandoId(ruta.id);
    setForm({
      nombre: ruta.nombre,
      zonaId: zonas.find((z) => z.nombre === ruta.zona)?.id,
      descripcion: ruta.descripcion ?? '',
      distanciaKm: ruta.distancia_km ?? 0,
      tiempoEstimadoMin: ruta.tiempo_estimado_min ?? 0,
    });
    setModalAbierto(true);
  }

  async function guardar() {
    setGuardando(true);
    setMensaje('');
    setError('');
    try {
      if (editandoId) {
        await operacionesApi.actualizarRuta(editandoId, form);
        setMensaje('Ruta actualizada correctamente.');
      } else {
        await operacionesApi.crearRuta(form);
        setMensaje('Ruta creada correctamente.');
      }
      setModalAbierto(false);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!confirmar) return;
    setMensaje('');
    setError('');
    try {
      await operacionesApi.eliminarRuta(confirmar.id);
      setMensaje('Ruta eliminada correctamente.');
      setConfirmar(null);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar');
      setConfirmar(null);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Zonas y rutas</h2>
          <p className="text-sm text-slate-500">
            Consulta, crea, edita o elimina rutas por zona de recolección.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar ruta"
            className="w-56 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
          <button
            onClick={abrirCrear}
            className="whitespace-nowrap rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            + Nueva ruta
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {mensaje && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {mensaje}
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
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-slate-500">
                      {formatDistancia(ruta.distancia_km)} |{' '}
                      {formatTiempo(ruta.tiempo_estimado_min || 0)}
                    </p>
                    <button
                      onClick={() => abrirEditar(ruta)}
                      className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmar(ruta)}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
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

      {/* ── MODAL crear/editar ── */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">
              {editandoId ? 'Editar ruta' : 'Nueva ruta'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Nombre</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ruta Centro"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Zona</label>
                <select
                  value={form.zonaId ?? ''}
                  onChange={(e) => setForm({ ...form, zonaId: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {zonas.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Descripción</label>
                <input
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Recorrido centro histórico"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Distancia (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.distanciaKm}
                    onChange={(e) => setForm({ ...form, distanciaKm: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Tiempo (min)</label>
                  <input
                    type="number"
                    value={form.tiempoEstimadoMin}
                    onChange={(e) => setForm({ ...form, tiempoEstimadoMin: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setModalAbierto(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                disabled={guardando}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL confirmar borrado ── */}
      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold">¿Eliminar ruta?</h3>
            <p className="mb-6 text-sm text-slate-500">
              Estás por eliminar{' '}
              <span className="font-semibold">{confirmar.nombre}</span>. Esta
              acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmar(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={eliminar}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
