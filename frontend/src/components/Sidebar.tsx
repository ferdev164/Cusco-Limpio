import { NavLink } from 'react-router-dom';

const recursos = [
  { to: '/admin/dashboard', label: 'Resumen' },
  { to: '/admin/operaciones', label: 'Operaciones' },
  { to: '/admin/monitoreo', label: 'Monitoreo GPS' },
];

export default function Sidebar() {
  return (
    <aside className="flex min-h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1a7a5e] text-sm font-bold text-white">
          CL
        </div>
        <div>
          <p className="font-bold leading-tight text-gray-800">Cusco Limpio</p>
          <p className="text-xs text-gray-500">Panel municipal</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 px-3 py-4">
        <p className="mb-1 mt-2 px-3 text-xs text-gray-400">Recursos</p>
        {recursos.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-[#1a7a5e] text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
