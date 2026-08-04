import { useEffect, useState } from 'react';
import TarjetaGuia from '../components/TarjetaGuia';
import { guiasApi } from '../services/guias.service';
import type { CategoriaGuia, Guia, GuiaInput } from '../services/guias.service';

const formVacio: GuiaInput = {
  titulo: '',
  categoria: 'reciclable',
  descripcion: '',
  imagenUrl: '',
};

const etiquetaCategoria: Record<CategoriaGuia, string> = {
  reciclable: 'Reciclable',
  no_reciclable: 'No reciclable',
};

export default function GestionGuias() {
  const [guias, setGuias] = useState<Guia[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<GuiaInput>(formVacio);
  const [guardando, setGuardando] = useState(false);
  const [confirmar, setConfirmar] = useState<Guia | null>(null);

  async function cargar() {
    setGuias(await guiasApi.listar());
  }

  useEffect(() => {
    cargar().catch((e) => setMensaje(e instanceof Error ? e.message : 'Error'));
  }, []);

  function abrirCrear() {
    setEditandoId(null);
    setForm(formVacio);
    setModalAbierto(true);
  }

  function abrirEditar(g: Guia) {
    setEditandoId(g.id);
    setForm({
      titulo: g.titulo,
      categoria: g.categoria,
      descripcion: g.descripcion,
      imagenUrl: g.imagenUrl ?? '',
    });
    setModalAbierto(true);
  }

  async function guardar() {
    setGuardando(true);
    setMensaje('');
    try {
      const datos = { ...form, imagenUrl: form.imagenUrl || undefined };
      if (editandoId) {
        await guiasApi.actualizar(editandoId, datos);
        setMensaje('Guia actualizada correctamente.');
      } else {
        await guiasApi.crear(datos);
        setMensaje('Guia creada correctamente.');
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
      await guiasApi.eliminar(confirmar.id);
      setMensaje('Guia eliminada correctamente.');
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
          <h2 className="text-2xl font-bold">Guias de reciclaje</h2>
          <p className="text-sm text-slate-500">
            Contenido publico que ven los ciudadanos sin iniciar sesion.
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          + Nueva guia
        </button>
      </div>

      {mensaje && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {mensaje}
        </p>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Titulo</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Descripcion</th>
              <th className="px-4 py-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {guias.map((g) => (
              <tr key={g.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{g.titulo}</td>
                <td className="px-4 py-3 text-slate-600">
                  {etiquetaCategoria[g.categoria]}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                  {g.descripcion}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => abrirEditar(g)}
                    className="mr-2 rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmar(g)}
                    className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {guias.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                  No hay guias registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {guias.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            Vista previa (asi las ve el ciudadano en /guias)
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guias.map((g) => (
              <TarjetaGuia key={g.id} guia={g} />
            ))}
          </div>
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">
              {editandoId ? 'Editar guia' : 'Nueva guia'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  Titulo
                </label>
                <input
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  placeholder="Botellas de plastico (PET)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  Categoria
                </label>
                <select
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      categoria: e.target.value as CategoriaGuia,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="reciclable">Reciclable</option>
                  <option value="no_reciclable">No reciclable</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  Descripcion
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  placeholder="Enjuaga la botella y aplasta antes de depositarla..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  URL de imagen (opcional)
                </label>
                <input
                  value={form.imagenUrl}
                  onChange={(e) =>
                    setForm({ ...form, imagenUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
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

      {confirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold">¿Eliminar guia?</h3>
            <p className="mb-6 text-sm text-slate-500">
              Estas por eliminar{' '}
              <span className="font-semibold">{confirmar.titulo}</span>. Esta
              accion no se puede deshacer.
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
                Si, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
