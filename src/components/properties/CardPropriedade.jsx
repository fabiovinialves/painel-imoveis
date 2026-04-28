import { Link } from 'react-router-dom';
import { MapPin, Pencil, Wallet, Eye, Star } from 'lucide-react';
import Etiqueta from '../common/Etiqueta';
import SeloStatus from '../common/SeloStatus';

function CardPropriedade({ propriedade, aoEditar }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 overflow-hidden sm:h-56">
        <img
          src={propriedade.imagem}
          alt={propriedade.titulo}
          className="h-full w-full object-cover transition duration-500 hover:scale-105"
        />
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-slate-800 shadow">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          {propriedade.nota}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{propriedade.titulo}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin size={15} />
              {propriedade.localizacao}
            </p>
          </div>
          <SeloStatus status={propriedade.status} />
        </div>

        <div className="flex flex-wrap gap-2">
          {propriedade.categorias.map((categoria) => (
            <Etiqueta key={categoria} texto={categoria} />
          ))}
        </div>

        <p className="text-2xl font-bold tracking-tight text-slate-900">{propriedade.preco}</p>

        <div className="grid grid-cols-3 gap-2 border-t border-slate-200 pt-3">
          <button
            type="button"
            onClick={() => aoEditar(propriedade)}
            className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
          >
            <Pencil size={15} />
            Editar
          </button>

          <button className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100">
            <Wallet size={15} />
            Financeiro
          </button>

          <Link
            to={`/propriedades/${propriedade.id}`}
            className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
          >
            <Eye size={15} />
            Ver
          </Link>
        </div>
      </div>
    </article>
  );
}

export default CardPropriedade;