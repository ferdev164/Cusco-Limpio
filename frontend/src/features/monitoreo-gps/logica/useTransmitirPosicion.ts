// Transmite la ubicacion GPS real del celular del conductor mientras hay un recojo activo

import { useEffect, useState } from 'react';
import { socket } from '../api/socket';

type EstadoGps = 'inactivo' | 'transmitiendo' | 'error';

export function useTransmitirPosicion(activo: boolean) {
  const [estado, setEstado] = useState<EstadoGps>('inactivo');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activo) {
      setEstado('inactivo');
      return;
    }

    if (!('geolocation' in navigator)) {
      setEstado('error');
      setError('Este dispositivo no soporta geolocalizacion');
      return;
    }

    // Reconecta con el token actual: la conexion del socket puede haberse
    // abierto antes del login, sin credenciales.
    socket.auth = { token: localStorage.getItem('token') || undefined };
    if (socket.connected) socket.disconnect();
    socket.connect();

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setEstado('transmitiendo');
        setError(null);
        socket.emit('posicionConductor', {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        setEstado('error');
        setError(err.message || 'No se pudo obtener tu ubicacion');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [activo]);

  return { estado, error };
}
