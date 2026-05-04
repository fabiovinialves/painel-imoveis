import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BedDouble, MapPin, Star, Users } from 'lucide-react';
import SeloStatus from '../components/common/SeloStatus';
import Etiqueta from '../components/common/Etiqueta';
import { formatarNota } from '../utils/formatadores';
import GaleriaFotosPropriedade from '../components/common/GaleriaFotosPropriedade';

function DetalhesPropriedade({ propriedades }) {
  const { id } = useParams();
  const propriedade = propriedades.find((item) => String(item.id) === String(id));

  if (!propriedade) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Imóvel não encontrado</h2>
        <Link to="/admin/propriedades" className="mt-4 inline-block text-sm font-semibold text-blue-700">
          Voltar para propriedades
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <Link to="/admin/propriedades" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <GaleriaFotosPropriedade
          propriedade={propriedade}
          alt={propriedade.titulo}
          className="h-72 lg:h-96"
        />

        <div className="space-y-6 p-5 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                {propriedade.categorias.map((categoria) => (
                  <Etiqueta key={categoria} texto={categoria} />
                ))}
              </div>
              <h2 className="text-3xl font-bold text-slate-900">{propriedade.titulo}</h2>
              <p className="mt-2 flex items-center gap-2 text-slate-500">
                <MapPin size={18} /> {propriedade.localizacao}
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 lg:items-end">
              <SeloStatus status={propriedade.status} />
              <p className="text-3xl font-bold text-slate-900">{propriedade.preco}</p>
            </div>
          </div>

          <p className="max-w-3xl text-slate-600">{propriedade.descricao}</p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 p-5">
              <BedDouble className="text-slate-700" />
              <p className="mt-3 text-sm text-slate-500">Quartos</p>
              <strong className="text-2xl text-slate-900">{propriedade.quartos}</strong>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <Users className="text-slate-700" />
              <p className="mt-3 text-sm text-slate-500">Hóspedes</p>
              <strong className="text-2xl text-slate-900">{propriedade.hospedes}</strong>
            </div>
            <div className="rounded-2xl bg-slate-50 p-5">
              <Star className="fill-yellow-400 text-yellow-400" />
              <p className="mt-3 text-sm text-slate-500">Avaliação</p>
              <strong className="text-2xl text-slate-900">{formatarNota(propriedade.nota)}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DetalhesPropriedade;
