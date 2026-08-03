// Mapa Leaflet con marcador 🚛 moviéndose

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';
import type { PosicionCamion } from '../logica/useRastreo';

// Ícono de camión (un emoji dentro de un divIcon; cámbialo si quieres)
const iconoCamion = L.divIcon({
  className: '',
  html: `<div style="font-size:26px;line-height:26px">🚛</div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const iconoCasa = L.divIcon({
  className: '',
  html: `<div style="font-size:24px;line-height:24px">🏠</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Recentra el mapa suavemente cuando el camión se mueve
function Recentrar({ posicion }: { posicion: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (posicion) map.setView(posicion, map.getZoom());
  }, [posicion, map]);
  return null;
}

export default function MapaCamiones({
  camiones,
  casa,
}: {
  camiones: PosicionCamion[];
  casa?: { lat: number; lng: number } | null;
}) {
  const primero = camiones[0];
  const centro: [number, number] = primero
    ? [primero.lat, primero.lng]
    : casa
      ? [casa.lat, casa.lng]
      : [-13.5319, -71.9675]; // Plaza de Armas por defecto

  return (
    <MapContainer center={centro} zoom={15} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />
      {casa && (
        <Marker position={[casa.lat, casa.lng]} icon={iconoCasa}>
          <Popup>Tu vivienda</Popup>
        </Marker>
      )}
      {camiones.map((c) => (
        <Marker key={c.camionId} position={[c.lat, c.lng]} icon={iconoCamion}>
          <Popup>Camión #{c.camionId}</Popup>
        </Marker>
      ))}
      <Recentrar posicion={primero ? [primero.lat, primero.lng] : null} />
    </MapContainer>
  );
}
