// En produccion, VITE_API_URL apunta al backend desplegado (dominio distinto
// al del frontend, asi que no se puede calcular a partir del host actual).
// En local, si no esta definida, se calcula del host actual (mismo puerto 3000)
// para que siga funcionando igual en localhost, cusco.limpio o la IP LAN.
export const API_ORIGIN =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:3000`;
