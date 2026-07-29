import { useEffect, useMemo, useState } from 'react';
import { operacionesApi } from '../services/operaciones.service';
import type { Vehiculo, VehiculoInput } from '../services/operaciones.service';

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

const formVacio: VehiculoInput = {
  placa: '',
  tipo: '',
  capacidad: '',
  km: 0,
  estado: 'disponible',
};

export default function AsignarVehiculo() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [cargandoId, setCargandoId] = useState<number | null>(null);

  // Estados para crear / editar / eliminar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<VehiculoInput>(formVacio);
  const [guardando, setGuardando] = useState(false);
  const [confirmarBorrado, setConfirmarBorrado] = useState<Vehiculo | null>(null);

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

  // ── Abrir modal para CREAR ──
  function abrirCrear() {
    setEditandoId(null);
    setForm(formVacio);
    setModalAbierto(true);
  }

  // ── Abrir modal para EDITAR ──
  function abrirEditar(v: Vehiculo) {
    setEditandoId(v.id);
    setForm({
      placa: v.placa,
      tipo: v.tipo,
      capacidad: v.capacidad ?? '',
      km: typeof v.km === 'string' ? Number(v.km) : v.km ?? 0,
      estado: v.estado,
    });
    setModalAbierto(true);
  }

  // ── Guardar (crear o editar) ──
  async function guardar() {
    setGuardando(true);
    setMensaje('');
    try {
      if (editandoId) {
        await operacionesApi.actualizarVehiculo(editandoId, form);
        setMensaje('Vehículo actualizado correctamente.');
      } else {
        await operacionesApi.crearVehiculo(form);
        setMensaje('Vehículo creado correctamente.');
      }
      setModalAbierto(false);
      await cargarVehiculos();
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  }

  // ── Eliminar ──
  async function eliminar() {
    if (!confirmarBorrado) return;
    setMensaje('');
    try {
      await operacionesApi.eliminarVehiculo(confirmarBorrado.id);
      setMensaje('Vehículo eliminado correctamente.');
      setConfirmarBorrado(null);
      await cargarVehiculos();
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo eliminar');
      setConfirmarBorrado(null);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vehículos</h2>
          <p className="text-sm text-slate-500">
            Administra la flota: crea, edita, elimina y asigna camiones a turnos.
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          + Nuevo vehículo
        </button>
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

            {/* Botones editar / eliminar */}
            <div className="mb-2 flex gap-2">
              <button
                onClick={() => abrirEditar(vehiculo)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Editar
              </button>
              <button
                onClick={() => setConfirmarBorrado(vehiculo)}
                className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Eliminar
              </button>
            </div>

            {/* Botón asignar (como estaba) */}
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

      {/* ── MODAL crear/editar ── */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">
              {editandoId ? 'Editar vehículo' : 'Nuevo vehículo'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Placa</label>
                <input
                  value={form.placa}
                  onChange={(e) => setForm({ ...form, placa: e.target.value })}
                  placeholder="X1A-123"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Tipo</label>
                <input
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                  placeholder="Compactador"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Capacidad</label>
                  <input
                    value={form.capacidad}
                    onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
                    placeholder="10 ton"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Km</label>
                  <input
                    type="number"
                    value={form.km}
                    onChange={(e) => setForm({ ...form, km: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="disponible">Disponible</option>
                  <option value="en_ruta">En ruta</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="fuera_servicio">Fuera de servicio</option>
                </select>
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
      {confirmarBorrado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold">¿Eliminar vehículo?</h3>
            <p className="mb-6 text-sm text-slate-500">
              Estás por eliminar el vehículo{' '}
              <span className="font-semibold">{confirmarBorrado.placa}</span>.
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmarBorrado(null)}
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
