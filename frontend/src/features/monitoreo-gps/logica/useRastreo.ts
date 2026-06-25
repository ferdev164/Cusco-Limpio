import { useEffect, useState } from 'react';
import { socket } from '../api/socket';

export interface PosicionCamion {
  camionId: number;
  lat: number;
  lng: number;
  timestamp: string;
}

export function useRastreo() {
  const [camiones, setCamiones] = useState<Record<number, PosicionCamion>>({});

  useEffect(() => {
    const onMovido = (data: PosicionCamion) => {
      setCamiones((prev) => ({ ...prev, [data.camionId]: data }));
    };
    socket.on('camionMovido', onMovido);
    return () => {
      socket.off('camionMovido', onMovido); // limpia al desmontar
    };
  }, []);

  return Object.values(camiones);
}