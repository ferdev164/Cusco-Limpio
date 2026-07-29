import { useEffect, useMemo, useState } from 'react';
import { operacionesApi } from '../services/operaciones.service';
import type {
  ConductorCuenta,
  Horario,
  HorarioAdmin,
  HorarioInput,
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
  const [tab, setTab] = useState<'crear' | 'ver' | 'gestionar' | 'cuentas'>('crear');
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Cuentas de conductor (asociar login a un perfil ya existente)
  const [cuentas, setCuentas] = useState<ConductorCuenta[]>([]);
  const [modalCuenta, setModalCuenta] = useState<ConductorCuenta | null>(null);
  const [formCuenta, setFormCuenta] = useState({
    correo: '',
    contrasena: '',
    telefono: '',
  });
  const [guardandoCuenta, setGuardandoCuenta] = useState(false);

  // CRUD de horarios (HU-11)
  const [todosHorarios, setTodosHorarios] = useState<HorarioAdmin[]>([]);
  const [modalHorario, setModalHorario] = useState(false);
  const [editandoHorarioId, setEditandoHorarioId] = useState<number | null>(null);
  const [formHorario, setFormHorario] = useState<HorarioInput>({
    zonaId: 0,
    turno: '',
    horaInicio: '',
    horaFin: '',
    dias: '',
  });
  const [guardandoHorario, setGuardandoHorario] = useState(false);
  const [confirmarHorario, setConfirmarHorario] = useState<HorarioAdmin | null>(null);

  async function cargarTodosHorarios() {
    setTodosHorarios(await operacionesApi.horariosTodos());
  }

  async function cargarCuentas() {
    setCuentas(await operacionesApi.conductoresCuentas());
  }

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
    void cargarTodosHorarios().catch((err) =>
      setMensaje(err instanceof Error ? err.message : 'No se pudo cargar'),
    );
    void cargarCuentas().catch((err) =>
      setMensaje(err instanceof Error ? err.message : 'No se pudo cargar'),
    );
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

  // ── CRUD de horarios ──
  function abrirCrearHorario() {
    setEditandoHorarioId(null);
    setFormHorario({
      zonaId: zonas[0]?.id ?? 0,
      turno: '',
      horaInicio: '',
      horaFin: '',
      dias: '',
    });
    setModalHorario(true);
  }

  function abrirEditarHorario(h: HorarioAdmin) {
    setEditandoHorarioId(h.id);
    setFormHorario({
      zonaId: zonas.find((z) => z.nombre === h.zona)?.id ?? 0,
      turno: h.turno,
      horaInicio: h.hora_inicio?.slice(0, 5) ?? '',
      horaFin: h.hora_fin?.slice(0, 5) ?? '',
      dias: h.dias,
    });
    setModalHorario(true);
  }

  async function guardarHorario() {
    setGuardandoHorario(true);
    setMensaje('');
    try {
      if (editandoHorarioId) {
        await operacionesApi.actualizarHorario(editandoHorarioId, formHorario);
        setMensaje('Horario actualizado correctamente.');
      } else {
        await operacionesApi.crearHorario(formHorario);
        setMensaje('Horario creado correctamente.');
      }
      setModalHorario(false);
      await cargarTodosHorarios();
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setGuardandoHorario(false);
    }
  }

  // ── Cuentas de conductor ──
  function abrirCrearCuenta(conductor: ConductorCuenta) {
    setFormCuenta({ correo: '', contrasena: '', telefono: '' });
    setModalCuenta(conductor);
  }

  async function guardarCuenta() {
    if (!modalCuenta) return;
    if (!formCuenta.correo || formCuenta.contrasena.length < 6) {
      setMensaje('Ingresa un correo valido y una contrasena de al menos 6 caracteres.');
      return;
    }

    setGuardandoCuenta(true);
    setMensaje('');
    try {
      const actualizado = await operacionesApi.crearCuentaConductor(modalCuenta.id, {
        correo: formCuenta.correo,
        contrasena: formCuenta.contrasena,
        telefono: formCuenta.telefono || undefined,
      });
      setCuentas((actuales) =>
        actuales.map((c) => (c.id === actualizado.id ? actualizado : c)),
      );
      setModalCuenta(null);
      setMensaje(`Cuenta creada para ${actualizado.nombre}.`);
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setGuardandoCuenta(false);
    }
  }

  async function eliminarHorario() {
    if (!confirmarHorario) return;
    setMensaje('');
    try {
      await operacionesApi.eliminarHorario(confirmarHorario.id);
      setMensaje('Horario eliminado correctamente.');
      setConfirmarHorario(null);
      await cargarTodosHorarios();
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo eliminar');
      setConfirmarHorario(null);
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
        {tab === 'gestionar' ? (
          <button
            onClick={abrirCrearHorario}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            + Nuevo horario
          </button>
        ) : tab === 'cuentas' ? null : (
          <button
            onClick={guardarTurno}
            disabled={tab !== 'crear' || guardando}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Agregar turno'}
          </button>
        )}
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
        {(['crear', 'ver', 'gestionar', 'cuentas'] as const).map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              tab === item ? 'bg-emerald-700 text-white' : 'text-slate-600'
            }`}
          >
            {item === 'crear'
              ? 'Crear turno'
              : item === 'ver'
                ? 'Ver programaciones'
                : item === 'gestionar'
                  ? 'Gestionar horarios'
                  : 'Cuentas de conductor'}
          </button>
        ))}
      </div>

      {tab === 'crear' && (
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
      )}

      {tab === 'ver' && (
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

      {tab === 'gestionar' && (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
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
              {todosHorarios.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{h.zona || '—'}</td>
                  <td className="px-4 py-3 text-slate-600">{h.turno}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {h.hora_inicio?.slice(0, 5)} - {h.hora_fin?.slice(0, 5)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{h.dias}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => abrirEditarHorario(h)}
                      className="mr-2 rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmarHorario(h)}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {todosHorarios.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    No hay horarios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {tab === 'cuentas' && (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm text-slate-500">
              Crea el correo y la contrasena de acceso para un conductor ya
              registrado. No se crean conductores nuevos aqui, solo se les da
              una cuenta para iniciar sesion.
            </p>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Conductor</th>
                <th className="px-4 py-3 font-medium">Licencia</th>
                <th className="px-4 py-3 font-medium">Cuenta</th>
                <th className="px-4 py-3 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cuentas.map((conductor) => (
                <tr key={conductor.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{conductor.nombre}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {conductor.licencia || '—'}
                  </td>
                  <td className="px-4 py-3">
                    {conductor.tieneCuenta ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                        {conductor.correo}
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        Sin cuenta
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!conductor.tieneCuenta && (
                      <button
                        onClick={() => abrirCrearCuenta(conductor)}
                        className="rounded-md border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                      >
                        Crear cuenta
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {cuentas.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No hay conductores registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* ── MODAL crear cuenta de conductor ── */}
      {modalCuenta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-1 text-lg font-bold">Crear cuenta</h3>
            <p className="mb-4 text-sm text-slate-500">
              Para <span className="font-semibold">{modalCuenta.nombre}</span>
            </p>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Correo</label>
                <input
                  type="email"
                  value={formCuenta.correo}
                  onChange={(e) =>
                    setFormCuenta({ ...formCuenta, correo: e.target.value })
                  }
                  placeholder="conductor@cuscolimpio.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  Contrasena
                </label>
                <input
                  type="password"
                  value={formCuenta.contrasena}
                  onChange={(e) =>
                    setFormCuenta({ ...formCuenta, contrasena: e.target.value })
                  }
                  placeholder="Minimo 6 caracteres"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">
                  Telefono (opcional)
                </label>
                <input
                  value={formCuenta.telefono}
                  onChange={(e) =>
                    setFormCuenta({ ...formCuenta, telefono: e.target.value })
                  }
                  placeholder="987654321"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setModalCuenta(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCuenta}
                disabled={guardandoCuenta}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {guardandoCuenta ? 'Creando...' : 'Crear cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL crear/editar horario ── */}
      {modalHorario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold">
              {editandoHorarioId ? 'Editar horario' : 'Nuevo horario'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm text-slate-600">Zona</label>
                <select
                  value={formHorario.zonaId}
                  onChange={(e) =>
                    setFormHorario({ ...formHorario, zonaId: Number(e.target.value) })
                  }
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
                <label className="mb-1 block text-sm text-slate-600">Turno</label>
                <input
                  value={formHorario.turno}
                  onChange={(e) =>
                    setFormHorario({ ...formHorario, turno: e.target.value })
                  }
                  placeholder="Mañana"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Hora inicio</label>
                  <input
                    type="time"
                    value={formHorario.horaInicio}
                    onChange={(e) =>
                      setFormHorario({ ...formHorario, horaInicio: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-600">Hora fin</label>
                  <input
                    type="time"
                    value={formHorario.horaFin}
                    onChange={(e) =>
                      setFormHorario({ ...formHorario, horaFin: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-600">Días</label>
                <input
                  value={formHorario.dias}
                  onChange={(e) =>
                    setFormHorario({ ...formHorario, dias: e.target.value })
                  }
                  placeholder="Lunes,Miércoles,Viernes"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setModalHorario(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={guardarHorario}
                disabled={guardandoHorario}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
              >
                {guardandoHorario ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL confirmar borrado ── */}
      {confirmarHorario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-bold">¿Eliminar horario?</h3>
            <p className="mb-6 text-sm text-slate-500">
              Estás por eliminar el turno{' '}
              <span className="font-semibold">{confirmarHorario.turno}</span> de{' '}
              {confirmarHorario.zona}. Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmarHorario(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarHorario}
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
