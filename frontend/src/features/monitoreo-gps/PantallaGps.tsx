import MapaCamiones from './componentes/MapaCamiones';
import { useRastreo } from './logica/useRastreo';

export default function PantallaGps() {
  const camiones = useRastreo();

  return (
    // h-screen en el padre + flex-col aseguran que el mapa tenga altura real
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="bg-green-700 text-white px-6 py-4 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold">Monitoreo de camiones — Cusco Limpio</h1>
        <span className="text-sm bg-green-800 px-3 py-1 rounded-full">
          {camiones.length} camión(es) en ruta
        </span>
      </header>
      {/* flex-1 hace que este div tome todo el espacio restante */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <MapaCamiones camiones={camiones} />
      </div>
    </div>
  );
}