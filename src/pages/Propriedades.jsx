import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import BotaoPrimario from '../components/common/BotaoPrimario';
import BarraFiltros from '../components/properties/BarraFiltros';
import GradePropriedades from '../components/properties/GradePropriedades';

function Propriedades({ propriedades, aoAdicionar, aoEditar }) {
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('Todos');
  const [tipo, setTipo] = useState('Todos');

  const propriedadesFiltradas = useMemo(() => {
    return propriedades.filter((item) => {
      const correspondeBusca =
        item.titulo.toLowerCase().includes(busca.toLowerCase()) ||
        item.localizacao.toLowerCase().includes(busca.toLowerCase());

      const correspondeStatus = status === 'Todos' ? true : item.status === status;
      const correspondeTipo = tipo === 'Todos' ? true : item.tipo === tipo;

      return correspondeBusca && correspondeStatus && correspondeTipo;
    });
  }, [busca, status, tipo, propriedades]);

   return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">Painel / Propriedades</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Propriedades
          </h2>
        </div>

        <BotaoPrimario onClick={aoAdicionar}>
          <Plus size={16} />
          Adicionar imóvel
        </BotaoPrimario>
      </div>

      <BarraFiltros
        busca={busca}
        setBusca={setBusca}
        status={status}
        setStatus={setStatus}
        tipo={tipo}
        setTipo={setTipo}
      />

      <GradePropriedades
        propriedades={propriedadesFiltradas}
        aoEditar={aoEditar}
      />
    </section>
  );
}

export default Propriedades;