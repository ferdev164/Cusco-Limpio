import { useNavigate } from 'react-router-dom';

export default function ActivarNotificaciones() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 text-center">

        {/* Ícono */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <span className="text-3xl">📱</span>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">
          ¡Registro exitoso!
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Para recibir alertas automáticas cuando el camión esté cerca,
          activa las notificaciones de WhatsApp en 2 pasos:
        </p>

        {/* Pasos */}
        <div className="bg-green-50 rounded-xl p-5 text-left mb-6 space-y-4">
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-white text-sm font-bold">1</span>
            <p className="text-sm text-gray-700">
              Abre WhatsApp y envía un mensaje al número:
              <br />
              <span className="font-bold text-green-700 text-base">+1 415 523 8886</span>
            </p>
          </div>
          <div className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-700 text-white text-sm font-bold">2</span>
            <p className="text-sm text-gray-700">
              Escribe exactamente este mensaje y envíalo:
              <br />
              <span className="font-mono font-bold text-green-700 text-base bg-green-100 px-2 py-1 rounded">
                join poet-soil
              </span>
              <br />
              <a
                href="https://wa.me/14155238886?text=join%20poet-soil"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <span>💬</span> Abrir WhatsApp y enviar
              </a>
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-400 mb-6">
          Recibirás una confirmación de WhatsApp. A partir de ese momento,
          el sistema le avisará automáticamente cuando el camión esté a
          menos de 500 metros de su vivienda.
        </p>

        {/* Botón para continuar */}
        <button
          onClick={() => navigate('/ciudadano/dashboard')}
          className="w-full rounded-lg bg-green-700 py-3 text-white font-medium hover:bg-green-800 transition-colors"
        >
          Entendido, ir al inicio
        </button>
      </div>
    </div>
  );
}