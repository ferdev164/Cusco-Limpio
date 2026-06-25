import { useState } from 'react';
import AsignarHorario from './AsignarHorario';
import AsignarVehiculo from './AsignarVehiculo';
import AsignarZona from './AsignarZona';

type OperacionTab = 'turnos' | 'vehiculos' | 'zonas';

const tabs: { id: OperacionTab; label: string }[] = [
  { id: 'turnos', label: 'Turnos y personal' },
  { id: 'vehiculos', label: 'Vehiculos' },
  { id: 'zonas', label: 'Zonas y rutas' },
];

export default function AdminOperaciones() {
  const [tabActiva, setTabActiva] = useState<OperacionTab>('turnos');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-900">
            Operaciones de recoleccion
          </h2>
          <p className="text-sm text-slate-500">
            Gestiona turnos, vehiculos, zonas y rutas desde una sola ventana.
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTabActiva(tab.id)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tabActiva === tab.id
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {tabActiva === 'turnos' && <AsignarHorario />}
      {tabActiva === 'vehiculos' && <AsignarVehiculo />}
      {tabActiva === 'zonas' && <AsignarZona />}
    </div>
  );
}
