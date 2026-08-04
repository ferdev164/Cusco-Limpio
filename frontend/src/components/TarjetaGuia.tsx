import type { Guia } from '../services/guias.service';

export default function TarjetaGuia({ guia }: { guia: Guia }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      {guia.imagenUrl && (
        <img
          src={guia.imagenUrl}
          alt={guia.titulo}
          className="h-40 w-full object-cover"
        />
      )}
      <div className="p-4">
        <p className="font-semibold text-slate-900">{guia.titulo}</p>
        <p className="mt-1 text-sm text-slate-600">{guia.descripcion}</p>
      </div>
    </div>
  );
}
