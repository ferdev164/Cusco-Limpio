import { useEffect, useState } from 'react';
import { operacionesApi } from '../services/operaciones.service';
import type { HorarioAdmin, HorarioInput, Zona } from '../services/operaciones.service';

const formVacio: HorarioInput = {
  zonaId: 0,
  turno: '',
  horaInicio: '',
  horaFin: '',
  dias: '',
};

export default function GestionHorarios() {
  const [horarios, setHorarios] = useState<HorarioAdmin[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<HorarioInput>(formVacio);
  const [guardando, setGuardando] = useState(false);
  const [confirmar, setConfirmar] = useState<HorarioAdmin | null>(null);

  async function cargar() {
    const [horariosData, zonasData] = await Promise.all([
      operacionesApi.horariosTodos(),
      operacionesApi.zonas(),
    ]);
    setHorarios(horariosData);
    setZonas(zonasData);
  }

  useEffect(() => {
    cargar().catch((e) => setMensaje(e instanceof Error ? e.message : 'Error'));
  }, []);

  function abrirCrear() {
    setEditandoId(null);
    setForm({ ...formVacio, zonaId: zonas[0]?.id ?? 0 });
    setModalAbierto(true);
  }

  function abrirEditar(h: HorarioAdmin) {
    setEditandoId(h.id);
    setForm({
      zonaId: zonas.find((z) => z.nombre === h.zona)?.id ?? 0,
      turno: h.turno,
      horaInicio: h.hora_inicio?.slice(0, 5) ?? '',
      horaFin: h.hora_fin?.slice(0, 5) ?? '',
      dias: h.dias,
    });
    setModalAbierto(true);
  }

  async function guardar() {
    setGuardando(true);
    setMensaje('');
    try {
      if (editandoId) {
        await operacionesApi.actualizarHorario(editandoId, form);
        setMensaje('Horario actualizado correctamente.');
      } else {
        await operacionesApi.crearHorario(form);
        setMensaje('Horario creado correctamente.');
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
      await operacionesApi.eliminarHorario(confirmar.id);
      setMensaje('Horario eliminado correctamente.');
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
          <h2 className="text-2xl font-bold">Gestión de horarios</h2>
          <p className="text-sm text-slate-500">Crea, edita o elimina horarios de recolección.</p>
        </div>
        <button onClick={abrirCrear} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
          + Nuevo horario
        </button>
      </div>

      {mensaje && <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">{mensaje}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Zona</th>
              <th className="px-4 py-3 font-medium">Turno</th>
              <th className="px-4 py-3 font-medium">Horario</th>
              <th className="px-4 py-3 font-medium">Días</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {horarios.map((h) => (
              <tr key={h.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{h.zona || '—'}</td>
                <td className="px-4 py-3 text-slate-600">{h.turno}</td>
                <td className="px-4 py-3 text-slate-600">{h.hora_inicio?.slice(0, 5)} - {h.hora_fin?.slice(0, 5)}</td>
                <td className="px-4 py-3 text-slate-600">{h.dias}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => abrirEditar(h)} className="mr-2 rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100">Editar</button>
                  <button onClick={() => setConfirmar(h)} className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Eliminar</button>
                </td>
              </tr>
            ))}
            {horarios.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No hay horarios registrados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal crear/editar */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">{editandoId ? 'Editar horario' : 'Nuevo horario'}</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Zona</label>
                <select value={form.zonaId} onChange={(e) => setForm({ ...form, zonaId: Number(e.target.value) })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  {zonas.map((z) => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Turno</label>
                <input value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value })} placeholder="Mañana" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Hora inicio</label>
                  <input type="time" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Hora fin</label>
                  <input type="time" value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Días</label>
                <input value={form.dias} onChange={(e) => setForm({ ...form, dias: e.target.value })} placeholder="Lunes,Miércoles,Viernes" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
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
            <h3 className="mb-2 text-lg font-bold">¿Eliminar horario?</h3>
            <p className="mb-6 text-sm text-slate-500">Estás por eliminar el turno <span className="font-semibold">{confirmar.turno}</span> de {confirmar.zona}. Esta acción no se puede deshacer.</p>
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