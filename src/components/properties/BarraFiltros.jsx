import { LayoutGrid, SlidersHorizontal } from 'lucide-react';
import CampoBusca from '../common/CampoBusca';

function BarraFiltros({ busca, setBusca, status, setStatus, tipo, setTipo }) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <CampoBusca valor={busca} aoMudar={setBusca} />

        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="min-h-[48px] rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-500 shadow-sm outline-none">
          <option value="Todos">Tipo do imóvel</option>
          <option value="Apartamento">Apartamento</option>
          <option value="Villa">Villa</option>
          <option value="Hotel">Hotel</option>
          <option value="Resort">Resort</option>
          <option value="Casa">Casa</option>
          <option value="Cabana">Cabana</option>
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-[48px] rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-500 shadow-sm outline-none">
          <option value="Todos">Todos os status</option>
          <option value="Disponível">Disponível</option>
          <option value="Ativo">Ativo</option>
          <option value="Manutenção">Manutenção</option>
          <option value="Reservado">Reservado</option>
        </select>

        <button className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50">
          <SlidersHorizontal size={16} /> Filtrar
        </button>
      </div>

      <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50">
        <LayoutGrid size={18} />
      </button>
    </div>
  );
}

export default BarraFiltros;