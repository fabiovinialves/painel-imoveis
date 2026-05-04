import { Bell, Hotel, Menu } from 'lucide-react';

function Cabecalho({ aoAbrirMenu, administrador }) {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={aoAbrirMenu}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
          >
            <Menu size={18} />
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-blue-700">StayHub</h1>
        </div>
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-2">
        <button className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">
          <span className="flex items-center gap-2"><Hotel size={16} /> Reservas</span>
        </button>
      </nav>

      <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-end">
        <button className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"
            alt="Usuario administrador"
            className="h-11 w-11 rounded-full object-cover"
          />
          <div className="pr-3">
            <p className="text-sm font-semibold text-slate-900">{administrador?.nome || 'Administrador'}</p>
            <p className="text-xs text-slate-500">{administrador?.email || 'admin@travel.com'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Cabecalho;
