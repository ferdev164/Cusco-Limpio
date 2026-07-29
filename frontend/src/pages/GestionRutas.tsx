import { useEffect, useState } from 'react';
import { operacionesApi } from '../services/operaciones.service';
import type { Ruta, RutaInput, Zona } from '../services/operaciones.service';

const formVacio: RutaInput = {
  nombre: '',
  zonaId: undefined,
  descripcion: '',
  distanciaKm: 0,
  tiempoEstimadoMin: 0,
};

export default function GestionRutas() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<RutaInput>(formVacio);
  const [guardando, setGuardando] = useState(false);
  const [confirmar, setConfirmar] = useState<Ruta | null>(null);

  async function cargar() {
    const [rutasData, zonasData] = await Promise.all([
      operacionesApi.rutas(),
      operacionesApi.zonas(),
    ]);
    setRutas(rutasData);
    setZonas(zonasData);
  }

  useEffect(() => {
    cargar().catch((e) => setMensaje(e instanceof Error ? e.message : 'Error'));
  }, []);

  function abrirCrear() {
    setEditandoId(null);
    setForm({ ...formVacio, zonaId: zonas[0]?.id });
    setModalAbierto(true);
  }

  function abrirEditar(r: Ruta) {
    setEditandoId(r.id);
    setForm({
      nombre: r.nombre,
      zonaId: zonas.find((z) => z.nombre === r.zona)?.id,
      descripcion: r.descripcion ?? '',
      distanciaKm: r.distancia_km ?? 0,
      tiempoEstimadoMin: r.tiempo_estimado_min ?? 0,
    });
    setModalAbierto(true);
  }

  async function guardar() {
    setGuardando(true);
    setMensaje('');
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
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar() {
    if (!confirmar) return;
    try {
      await operacionesApi.eliminarRuta(confirmar.id);
      setMensaje('Ruta eliminada correctamente.');
      setConfirmar(null);
      await cargar();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo eliminar');
      setConfirmar(null);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de rutas</h2>
          <p className="text-sm text-slate-500">Crea, edita o elimina rutas de recolección.</p>
        </div>
        <button onClick={abrirCrear} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
          + Nueva ruta
        </button>
      </div>

      {mensaje && <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{mensaje}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Zona</th>
              <th className="px-4 py-3 font-medium">Distancia</th>
              <th className="px-4 py-3 font-medium">Tiempo</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rutas.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{r.nombre}</td>
                <td className="px-4 py-3 text-slate-600">{r.zona || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{r.distancia_km ? `${r.distancia_km} km` : '—'}</td>
                <td className="px-4 py-3 text-slate-600">{r.tiempo_estimado_min ? `${r.tiempo_estimado_min} min` : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => abrirEditar(r)} className="mr-2 rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">Editar</button>
                  <button onClick={() => setConfirmar(r)} className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Eliminar</button>
                </td>
              </tr>
            ))}
            {rutas.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No hay rutas registradas.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal crear/editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">{editandoId ? 'Editar ruta' : 'Nueva ruta'}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Nombre</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ruta Centro" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Zona</label>
                <select value={form.zonaId ?? ''} onChange={(e) => setForm({ ...form, zonaId: Number(e.target.value) })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Descripción</label>
                <input value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Recorrido centro histórico" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Distancia (km)</label>
                  <input type="number" step="0.1" value={form.distanciaKm} onChange={(e) => setForm({ ...form, distanciaKm: Number(e.target.value) })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Tiempo (min)</label>
                  <input type="number" value={form.tiempoEstimadoMin} onChange={(e) => setForm({ ...form, tiempoEstimadoMin: Number(e.target.value) })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setModalAbierto(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={guardar} disabled={guardando} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50">{guardando ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar */}
      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold">¿Eliminar ruta?</h3>
            <p className="mb-6 text-sm text-slate-500">Estás por eliminar <span className="font-semibold">{confirmar.nombre}</span>. Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmar(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancelar</button>
              <button onClick={eliminar} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}