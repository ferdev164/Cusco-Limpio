import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function SelectorUbicacion({ onSeleccionar }: { onSeleccionar: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSeleccionar(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    telefono: '',
  });
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ubicacion) {
      setError('Por favor marca tu ubicación en el mapa');
      return;
    }

    setCargando(true);
    try {
      await axios.post('http://localhost:3000/auth/register', {
        ...form,
        rol: 'ciudadano',
        latitud: ubicacion.lat,
        longitud: ubicacion.lng,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg">

        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-700 rounded-2xl p-3 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Registro ciudadano</h1>
          <p className="text-green-600 text-sm">Cusco Limpio</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nombre completo</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Juan Quispe"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Teléfono</label>
              <input
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="987654321"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Correo electrónico</label>
            <input
              name="correo"
              type="email"
              value={form.correo}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Contraseña</label>
            <input
              name="contrasena"
              type="password"
              value={form.contrasena}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Mapa */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Ubica tu vivienda{' '}
              <span className="text-green-600">(haz clic en el mapa)</span>
            </label>
            <div className="rounded-lg overflow-hidden border border-gray-300">
              <MapContainer
                center={[-13.5319, -71.9675]}
                zoom={15}
                style={{ height: '250px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <SelectorUbicacion onSeleccionar={(lat, lng) => setUbicacion({ lat, lng })} />
                {ubicacion && (
                  <Marker position={[ubicacion.lat, ubicacion.lng]} />
                )}
              </MapContainer>
            </div>
            {ubicacion ? (
              <p className="text-xs text-green-600 mt-1">
                ✓ Ubicación marcada correctamente
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                Haz clic en el mapa para marcar tu casa
              </p>
            )}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {cargando ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p
          onClick={() => navigate('/login')}
          className="text-center text-sm text-gray-400 mt-4 cursor-pointer hover:text-green-600"
        >
          ← Volver al login
        </p>
      </div>
    </div>
  );
}