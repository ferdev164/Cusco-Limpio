import { useEffect, useMemo, useState } from 'react';
import { operacionesApi } from '../services/operaciones.service';
import type {
  Horario,
  PersonaOperativa,
  Programacion,
  Vehiculo,
  Zona,
} from '../services/operaciones.service';

function formatHora(hora?: string | null) {
  return hora ? hora.slice(0, 5) : '--:--';
}

function parseMinutos(hora: string) {
  const [h, m] = hora.split(':');
  return Number(h) * 60 + Number(m);
}

function normalizarDias(dias: string) {
  const limpio = dias
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (limpio.includes('todos')) {
    return new Set(['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']);
  }

  const mapa: Record<string, string> = {
    lun: 'lun',
    lunes: 'lun',
    mar: 'mar',
    martes: 'mar',
    mie: 'mie',
    miercoles: 'mie',
    jue: 'jue',
    jueves: 'jue',
    vie: 'vie',
    viernes: 'vie',
    sab: 'sab',
    sabado: 'sab',
    dom: 'dom',
    domingo: 'dom',
  };

  return new Set(
    (limpio.match(/[a-z]+/g) || [])
      .map((token) => mapa[token])
      .filter(Boolean),
  );
}

function seCruzan(a: Set<string>, b: Set<string>) {
  for (const dia of a) {
    if (b.has(dia)) return true;
  }
  return false;
}

export default function AsignarHorario() {
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [zonaId, setZonaId] = useState('');
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [horarioId, setHorarioId] = useState<number | null>(null);
  const [conductores, setConductores] = useState<PersonaOperativa[]>([]);
  const [conductorId, setConductorId] = useState<number | null>(null);
  const [ayudantes, setAyudantes] = useState<PersonaOperativa[]>([]);
  const [ayudanteIds, setAyudanteIds] = useState<number[]>([]);
  const [programaciones, setProgramaciones] = useState<Programacion[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [tab, setTab] = useState<'crear' | 'ver'>('crear');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargarBase() {
      try {
        const [
          zonasData,
          conductoresData,
          ayudantesData,
          programacionesData,
          vehiculosData,
        ] = await Promise.all([
          operacionesApi.zonas(),
          operacionesApi.conductores(),
          operacionesApi.ayudantes(),
          operacionesApi.programaciones(),
          operacionesApi.vehiculos(),
        ]);
        setZonas(zonasData);
        setConductores(conductoresData);
        setAyudantes(ayudantesData);
        setProgramaciones(programacionesData);
        setVehiculos(vehiculosData);
      } catch (err) {
        setMensaje(err instanceof Error ? err.message : 'No se pudo cargar');
      }
    }

    void cargarBase();
  }, []);

  useEffect(() => {
    async function cargarHorarios() {
      setHorarioId(null);
      if (!zonaId) {
        setHorarios([]);
        return;
      }
      try {
        setHorarios(await operacionesApi.horariosPorZona(Number(zonaId)));
      } catch (err) {
        setMensaje(err instanceof Error ? err.message : 'No se pudo cargar');
      }
    }

    void cargarHorarios();
  }, [zonaId]);

  const horarioSeleccionado = useMemo(
    () => horarios.find((horario) => horario.id === horarioId) || null,
    [horarioId, horarios],
  );

  const disponibilidadConductores = useMemo(() => {
    const mapa = new Map<number, boolean>();

    conductores.forEach((conductor) => {
      if (!horarioSeleccionado || !conductor.disponible) {
        mapa.set(conductor.id, conductor.disponible);
        return;
      }

      const diasHorario = normalizarDias(horarioSeleccionado.dias);
      const inicioHorario = parseMinutos(horarioSeleccionado.hora_inicio);
      const finHorario = parseMinutos(horarioSeleccionado.hora_fin);

      const ocupado = programaciones.some((programacion) => {
        if (programacion.conductor !== conductor.nombre || !programacion.dias) {
          return false;
        }
        const diasProgramacion = normalizarDias(programacion.dias);
        const inicio = parseMinutos(programacion.hora_inicio || '00:00');
        const fin = parseMinutos(programacion.hora_fin || '00:00');
        return (
          seCruzan(diasHorario, diasProgramacion) &&
          inicioHorario < fin &&
          inicio < finHorario
        );
      });

      mapa.set(conductor.id, !ocupado);
    });

    return mapa;
  }, [conductores, horarioSeleccionado, programaciones]);

  const resumen = useMemo(
    () => [
      { label: 'Programaciones', value: programaciones.length },
      {
        label: 'Conductores disponibles',
        value: conductores.filter((conductor) => conductor.disponible).length,
      },
      {
        label: 'Vehiculos en ruta',
        value: vehiculos.filter((vehiculo) => vehiculo.estado === 'en_ruta')
          .length,
      },
      {
        label: 'Turnos sin vehiculo',
        value: programaciones.filter((programacion) => !programacion.vehiculo)
          .length,
      },
    ],
    [conductores, programaciones, vehiculos],
  );

  function toggleAyudante(id: number) {
    setAyudanteIds((actuales) => {
      if (actuales.includes(id)) {
        return actuales.filter((item) => item !== id);
      }
      if (actuales.length >= 2) return actuales;
      return [...actuales, id];
    });
  }

  async function guardarTurno() {
    if (!horarioId || !conductorId) {
      setMensaje('Selecciona una zona, horario y conductor.');
      return;
    }

    setGuardando(true);
    setMensaje('');
    try {
      await operacionesApi.crearProgramacion({
        horarioId,
        conductorId,
        ayudanteIds,
      });
      setProgramaciones(await operacionesApi.programaciones());
      setConductorId(null);
      setAyudanteIds([]);
      setHorarioId(null);
      setMensaje('Turno agregado correctamente.');
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Asignar horarios</h2>
          <p className="text-sm text-slate-500">
            Programa turnos, conductores y ayudantes por zona.
          </p>
        </div>
        <button
          onClick={guardarTurno}
          disabled={tab !== 'crear' || guardando}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Agregar turno'}
        </button>
      </div>

      {mensaje && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {mensaje}
        </p>
      )}

      <div className="mb-6 grid grid-cols-4 gap-4">
        {resumen.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 inline-flex rounded-lg border border-slate-200 bg-white p-1">
        {(['crear', 'ver'] as const).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              tab === item ? 'bg-emerald-700 text-white' : 'text-slate-600'
            }`}
          >
            {item === 'crear' ? 'Crear horario' : 'Ver horarios'}
          </button>
        ))}
      </div>

      {tab === 'crear' ? (
        <div className="grid grid-cols-2 gap-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold">Zona y horario</h3>
            <select
              value={zonaId}
              onChange={(event) => setZonaId(event.target.value)}
              className="mb-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Seleccionar zona</option>
              {zonas.map((zona) => (
                <option key={zona.id} value={zona.id}>
                  {zona.nombre}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2">
              {horarios.map((horario) => (
                <button
                  key={horario.id}
                  onClick={() => setHorarioId(horario.id)}
                  className={`rounded-lg border p-3 text-left ${
                    horarioId === horario.id
                      ? 'border-emerald-700 bg-emerald-50'
                      : 'border-slate-200 hover:border-emerald-600'
                  }`}
                >
                  <p className="text-sm font-semibold">{horario.turno}</p>
                  <p className="text-xs text-slate-500">
                    {formatHora(horario.hora_inicio)} -{' '}
                    {formatHora(horario.hora_fin)}
                  </p>
                  <p className="text-xs text-slate-400">{horario.dias}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold">Conductor</h3>
              <div className="space-y-2">
                {conductores.map((conductor) => {
                  const disponible =
                    disponibilidadConductores.get(conductor.id) ?? false;
                  return (
                    <button
                      key={conductor.id}
                      onClick={() => disponible && setConductorId(conductor.id)}
                      disabled={!disponible}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                        conductorId === conductor.id
                          ? 'bg-emerald-50 text-emerald-900'
                          : 'bg-slate-50 text-slate-700'
                      } disabled:opacity-50`}
                    >
                      <span>{conductor.nombre}</span>
                      <span>{disponible ? 'Disponible' : 'Ocupado'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Ayudantes</h3>
                <span className="text-xs text-slate-500">
                  {ayudanteIds.length}/2
                </span>
              </div>
              <div className="space-y-2">
                {ayudantes.map((ayudante) => (
                  <label
                    key={ayudante.id}
                    className={`flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm ${
                      ayudante.disponible ? '' : 'opacity-50'
                    }`}
                  >
                    <span>{ayudante.nombre}</span>
                    <input
                      type="checkbox"
                      checked={ayudanteIds.includes(ayudante.id)}
                      onChange={() => toggleAyudante(ayudante.id)}
                      disabled={!ayudante.disponible}
                      className="accent-emerald-700"
                    />
                  </label>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-semibold">
            Programaciones registradas
          </h3>
          <div className="space-y-3">
            {programaciones.map((programacion) => (
              <div
                key={programacion.id}
                className="rounded-lg border border-slate-200 p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{programacion.zona}</p>
                  <span className="text-sm text-slate-500">
                    {programacion.turno}
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  {programacion.dias} - {formatHora(programacion.hora_inicio)} a{' '}
                  {formatHora(programacion.hora_fin)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Conductor: {programacion.conductor || 'Sin conductor'} |
                  Vehiculo: {programacion.vehiculo || 'Sin vehiculo'}
                </p>
                <p className="text-sm text-slate-500">
                  Ayudantes:{' '}
                  {programacion.ayudantes.length
                    ? programacion.ayudantes.map((a) => a.nombre).join(', ')
                    : 'Sin ayudantes'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
