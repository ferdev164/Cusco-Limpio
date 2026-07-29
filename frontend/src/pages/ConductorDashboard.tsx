import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { operacionesApi } from '../services/operaciones.service';
import type { ProgramacionConductor } from '../services/operaciones.service';

function formatHora(hora?: string | null) {
  return hora ? hora.slice(0, 5) : '--:--';
}

function formatDuracion(segundos: number) {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = Math.floor(segundos % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function Cronometro({ horaInicio }: { horaInicio: string }) {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const segundos = Math.max(
    0,
    Math.floor((ahora - new Date(horaInicio).getTime()) / 1000),
  );

  return (
    <span className="font-mono text-lg font-bold text-emerald-700">
      {formatDuracion(segundos)}
    </span>
  );
}

export default function ConductorDashboard() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const [turnos, setTurnos] = useState<ProgramacionConductor[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(true);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  async function cargarTurnos() {
    try {
      setTurnos(await operacionesApi.misProgramaciones());
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo cargar');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    void cargarTurnos();
  }, []);

  const resumen = useMemo(
    () => ({
      total: turnos.length,
      enCurso: turnos.filter((t) => t.recojoActivo).length,
    }),
    [turnos],
  );

  function handleCerrarSesion() {
    cerrarSesion();
    navigate('/login');
  }

  async function iniciar(programacionId: number) {
    setProcesandoId(programacionId);
    setMensaje('');
    try {
      await operacionesApi.iniciarRecojo(programacionId);
      await cargarTurnos();
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo iniciar');
    } finally {
      setProcesandoId(null);
    }
  }

  async function finalizar(recojoId: number, programacionId: number) {
    setProcesandoId(programacionId);
    setMensaje('');
    try {
      const resultado = await operacionesApi.finalizarRecojo(recojoId);
      setMensaje(
        `Recojo finalizado. Tiempo transcurrido: ${resultado.tiempoTranscurridoMin} min.`,
      );
      await cargarTurnos();
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo finalizar');
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Hola, {usuario?.nombre}
            </h1>
            <p className="text-sm text-slate-500">Panel de conductor</p>
          </div>
          <button
            onClick={handleCerrarSesion}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cerrar sesion
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-3xl font-bold">{resumen.total}</p>
            <p className="text-sm text-slate-500">Turnos asignados</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-3xl font-bold">{resumen.enCurso}</p>
            <p className="text-sm text-slate-500">Recojos en curso</p>
          </div>
        </div>

        {mensaje && (
          <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {mensaje}
          </p>
        )}

        {cargando && <p className="text-sm text-slate-400">Cargando turnos...</p>}

        <div className="space-y-3">
          {turnos.map((turno) => (
            <div
              key={turno.id}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {turno.zona || 'Sin zona'} - {turno.turno || 'Sin turno'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {formatHora(turno.horaInicioTurno)} -{' '}
                    {formatHora(turno.horaFinTurno)} | {turno.dias}
                  </p>
                  <p className="text-sm text-slate-500">
                    Vehiculo: {turno.vehiculo || 'Sin asignar'}
                  </p>
                </div>

                <div className="text-right">
                  {turno.recojoActivo ? (
                    <div className="space-y-2">
                      <Cronometro horaInicio={turno.recojoActivo.horaInicio} />
                      <button
                        onClick={() =>
                          finalizar(turno.recojoActivo!.id, turno.id)
                        }
                        disabled={procesandoId === turno.id}
                        className="block w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {procesandoId === turno.id
                          ? 'Guardando...'
                          : 'Finalizar recojo'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => iniciar(turno.id)}
                      disabled={procesandoId === turno.id}
                      className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
                    >
                      {procesandoId === turno.id
                        ? 'Iniciando...'
                        : 'Iniciar recojo'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!cargando && turnos.length === 0 && (
            <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
              No tienes turnos asignados todavia.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
