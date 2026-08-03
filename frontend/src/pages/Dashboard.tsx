import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ciudadanoApi } from '../services/ciudadano.service';
import type { AvisoRecibido, PerfilCiudadano } from '../services/ciudadano.service';
import { operacionesApi } from '../services/operaciones.service';
import type { Horario, Zona } from '../services/operaciones.service';
import MapaCamiones from '../features/monitoreo-gps/componentes/MapaCamiones';
import { useRastreo } from '../features/monitoreo-gps/logica/useRastreo';

function distanciaMetros(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371000;
  const rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistancia(metros: number) {
  return metros < 1000 ? `${Math.round(metros)} m` : `${(metros / 1000).toFixed(1)} km`;
}

function formatHora(hora: string) {
  return hora.slice(0, 5);
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const estadoLabel: Record<AvisoRecibido['estado'], string> = {
  enviada: 'Enviado',
  fallida: 'Fallo',
  pendiente: 'Pendiente',
};

const estadoClase: Record<AvisoRecibido['estado'], string> = {
  enviada: 'bg-emerald-50 text-emerald-700',
  fallida: 'bg-red-50 text-red-700',
  pendiente: 'bg-amber-50 text-amber-700',
};

export default function Dashboard() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const camiones = useRastreo();

  const [perfil, setPerfil] = useState<PerfilCiudadano | null>(null);
  const [avisos, setAvisos] = useState<AvisoRecibido[]>([]);
  const [zonas, setZonas] = useState<Zona[]>([]);
  const [zonaId, setZonaId] = useState('');
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    ciudadanoApi
      .miPerfil()
      .then(setPerfil)
      .catch((err) => setMensaje(err instanceof Error ? err.message : 'No se pudo cargar'));
    ciudadanoApi.misAvisos().then(setAvisos).catch(() => undefined);
    operacionesApi.zonas().then(setZonas).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!zonaId) {
      setHorarios([]);
      return;
    }
    operacionesApi.horariosPorZona(Number(zonaId)).then(setHorarios).catch(() => undefined);
  }, [zonaId]);

  const casa = useMemo(() => {
    if (perfil?.latitud == null || perfil?.longitud == null) return null;
    return { lat: Number(perfil.latitud), lng: Number(perfil.longitud) };
  }, [perfil]);

  const distanciaCamionCercano = useMemo(() => {
    if (!casa || camiones.length === 0) return null;
    return Math.min(
      ...camiones.map((c) => distanciaMetros(casa.lat, casa.lng, c.lat, c.lng)),
    );
  }, [casa, camiones]);

  const yaRecibioAvisos = avisos.some((a) => a.estado === 'enviada');

  function handleCerrarSesion() {
    cerrarSesion();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Hola, {usuario?.nombre}
            </h1>
            <p className="text-sm text-gray-500">Bienvenido a Cusco Limpio</p>
          </div>
          <button
            onClick={handleCerrarSesion}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cerrar sesion
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-6">
        {mensaje && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {mensaje}
          </p>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white lg:col-span-2">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Camion en tiempo real
                </h2>
                <p className="text-xs text-gray-500">
                  Se actualiza automaticamente
                </p>
              </div>
              {distanciaCamionCercano != null && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                  A {formatDistancia(distanciaCamionCercano)} de tu casa
                </span>
              )}
            </div>
            <div style={{ height: 420 }}>
              <MapaCamiones camiones={camiones} casa={casa} />
            </div>
            {camiones.length === 0 && (
              <p className="px-5 py-3 text-center text-xs text-gray-400">
                Ningun camion transmitiendo ubicacion en este momento.
              </p>
            )}
          </section>

          <div className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-3 font-semibold text-gray-900">
                Horario de recoleccion
              </h2>
              <select
                value={zonaId}
                onChange={(e) => setZonaId(e.target.value)}
                className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Selecciona tu zona</option>
                {zonas.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nombre}
                  </option>
                ))}
              </select>
              <div className="space-y-2">
                {horarios.map((h) => (
                  <div key={h.id} className="rounded-lg bg-gray-50 p-3 text-sm">
                    <p className="font-medium text-gray-800">{h.turno}</p>
                    <p className="text-gray-500">
                      {formatHora(h.hora_inicio)} - {formatHora(h.hora_fin)} |{' '}
                      {h.dias}
                    </p>
                  </div>
                ))}
                {zonaId && horarios.length === 0 && (
                  <p className="text-xs text-gray-400">
                    Sin horarios registrados para esta zona.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-2 font-semibold text-gray-900">
                Notificaciones WhatsApp
              </h2>
              {yaRecibioAvisos ? (
                <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  Activas: ya recibiste avisos antes.
                </p>
              ) : (
                <div className="rounded-lg bg-amber-50 px-3 py-3 text-sm text-amber-800">
                  <p className="mb-2">
                    Aun no confirmamos que las tengas activas.
                  </p>
                  <button
                    onClick={() => navigate('/activar-notificaciones')}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                  >
                    Activar ahora
                  </button>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5">
              <h2 className="mb-2 font-semibold text-gray-900">
                Guias de reciclaje
              </h2>
              <p className="mb-3 text-sm text-gray-500">
                Aprende a clasificar tus residuos correctamente.
              </p>
              <button
                onClick={() => navigate('/guias')}
                className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Ver guias
              </button>
            </section>
          </div>
        </div>

        <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-gray-900">
            Historial de avisos
          </h2>
          {avisos.length === 0 ? (
            <p className="text-sm text-gray-400">
              Todavia no te hemos enviado ningun aviso.
            </p>
          ) : (
            <div className="space-y-2">
              {avisos.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2 text-sm"
                >
                  <span className="text-gray-700">
                    Camion a {a.distanciaMetros} m de tu casa
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${estadoClase[a.estado]}`}
                    >
                      {estadoLabel[a.estado]}
                    </span>
                    <span className="text-gray-400">
                      {formatFecha(a.fechaCreacion)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
