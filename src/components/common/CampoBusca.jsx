import { Search } from 'lucide-react';

function CampoBusca({ valor, aoMudar }) {
  return (
    <div className="flex min-h-[48px] flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 shadow-sm">
      <Search size={18} className="text-slate-400" />
      <input
        type="text"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder="Buscar imóvel..."
        className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
    </div>
  );
}

export default CampoBusca;