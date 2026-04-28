import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Star,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

const itensMenu = [
  { label: 'Painel', icon: LayoutDashboard, path: '/' },
  { label: 'Propriedades', icon: Building2, path: '/propriedades' },
  { label: 'Usuarios', icon: Users, path: '/usuarios' },
  { label: 'Avaliacoes', icon: Star, path: '/avaliacoes' },
];

function ConteudoMenu({ aoFechar }) {
  return (
    <div className="flex h-full flex-col justify-between bg-[#fcfcfc] p-4">
      <div>
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <h2 className="text-lg font-bold text-slate-900">Menu</h2>
          <button
            onClick={aoFechar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          {itensMenu.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={label}
              to={path}
              onClick={aoFechar}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                  isActive
                    ? 'bg-slate-100 font-semibold text-slate-900'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-2 border-t border-slate-200 pt-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <Settings size={18} /> Configuracoes
        </button>
        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <LogOut size={18} /> Sair
        </button>
      </div>
    </div>
  );
}

function MenuLateral({ aberto, aoFechar }) {
  return (
    <>
      <aside className="hidden border-r border-slate-200 bg-[#fcfcfc] lg:block">
        <ConteudoMenu />
      </aside>

      {aberto && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
          <div className="h-full w-[290px] bg-white shadow-2xl">
            <ConteudoMenu aoFechar={aoFechar} />
          </div>
        </div>
      )}
    </>
  );
}

export default MenuLateral;
