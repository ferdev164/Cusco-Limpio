export interface PosicionCamion {
  camionId: number;
  lat: number;
  lng: number;
  recorridoId: number; // sube cada vez que el camión reinicia su ruta
  timestamp: string;
}