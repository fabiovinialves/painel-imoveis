import { useMemo, useState } from 'react';
import { MessageSquareText, Search, Star, UsersRound } from 'lucide-react';
import CardMetrica from '../components/common/CardMetrica';

function deduplicarAvaliacoes(avaliacoes) {
  const avaliacoesPorClienteEPropriedade = new Map();

  avaliacoes.forEach((avaliacao) => {
    const chave = `${avaliacao.clienteEmail}-${avaliacao.propriedadeId}`;
    const avaliacaoAtual = avaliacoesPorClienteEPropriedade.get(chave);

    if (!avaliacaoAtual || new Date(avaliacao.data || 0) >= new Date(avaliacaoAtual.data || 0)) {
      avaliacoesPorClienteEPropriedade.set(chave, avaliacao);
    }
  });

  return Array.from(avaliacoesPorClienteEPropriedade.values());
}

function Avaliacoes({ avaliacoes = [], propriedades = [] }) {
  const [busca, setBusca] = useState('');
  const avaliacoesUnicas = useMemo(() => deduplicarAvaliacoes(avaliacoes), [avaliacoes]);

  const avaliacoesComPropriedade = useMemo(() => {
    return avaliacoesUnicas.map((avaliacao) => {
      const propriedade = propriedades.find(
        (item) => String(item.id) === String(avaliacao.propriedadeId)
      );

      return {
        ...avaliacao,
        propriedadeTitulo: propriedade?.titulo || avaliacao.propriedadeTitulo || 'Propriedade removida',
        propriedadeImagem: propriedade?.imagem,
        localizacao: propriedade?.localizacao || avaliacao.localizacao || '',
      };
    });
  }, [avaliacoesUnicas, propriedades]);

  const avaliacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return avaliacoesComPropriedade;
    }

    return avaliacoesComPropriedade.filter((avaliacao) => {
      return (
        avaliacao.clienteNome.toLowerCase().includes(termo) ||
        avaliacao.propriedadeTitulo.toLowerCase().includes(termo) ||
        avaliacao.comentario.toLowerCase().includes(termo)
      );
    });
  }, [avaliacoesComPropriedade, busca]);

  const media =
    avaliacoesUnicas.length === 0
      ? '0.0'
      : (
          avaliacoesUnicas.reduce((total, avaliacao) => total + Number(avaliacao.nota), 0) /
          avaliacoesUnicas.length
        ).toFixed(1);

  const clientesUnicos = new Set(avaliacoesUnicas.map((avaliacao) => avaliacao.clienteEmail)).size;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">Painel / Avaliacoes</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Avaliacoes
          </h2>
        </div>

        <div className="flex min-h-[48px] w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-4 shadow-sm sm:max-w-sm">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar avaliacao..."
            className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <CardMetrica
          titulo="Total de avaliacoes"
          valor={avaliacoesUnicas.length}
          descricao="Enviadas por clientes"
          icone={MessageSquareText}
        />
        <CardMetrica
          titulo="Nota media"
          valor={media}
          descricao="Media geral das propriedades"
          icone={Star}
        />
        <CardMetrica
          titulo="Clientes avaliando"
          valor={clientesUnicos}
          descricao="Clientes com feedback"
          icone={UsersRound}
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h3 className="text-lg font-bold text-slate-900">Feedbacks recebidos</h3>
          <p className="mt-1 text-sm text-slate-500">
            Avaliacoes feitas pelos clientes apos o aluguel.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {avaliacoesFiltradas.map((avaliacao) => (
            <article
              key={avaliacao.id}
              className="grid gap-4 p-5 lg:grid-cols-[96px_minmax(220px,1fr)_minmax(220px,1.2fr)_auto]"
            >
              <div className="h-24 overflow-hidden rounded-2xl bg-slate-100">
                {avaliacao.propriedadeImagem ? (
                  <img
                    src={avaliacao.propriedadeImagem}
                    alt={avaliacao.propriedadeTitulo}
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div>
                <p className="font-semibold text-slate-900">{avaliacao.propriedadeTitulo}</p>
                <p className="mt-1 text-sm text-slate-500">{avaliacao.localizacao}</p>
                <p className="mt-3 text-sm font-medium text-slate-700">{avaliacao.clienteNome}</p>
                <p className="text-xs text-slate-400">{avaliacao.clienteEmail}</p>
              </div>

              <p className="text-sm leading-6 text-slate-600">{avaliacao.comentario}</p>

              <div className="flex items-start gap-1 lg:justify-end">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={17}
                    className={
                      index < Number(avaliacao.nota)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300'
                    }
                  />
                ))}
              </div>
            </article>
          ))}

          {avaliacoesFiltradas.length === 0 && (
            <div className="p-10 text-center text-sm text-slate-500">
              Nenhuma avaliacao encontrada.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Avaliacoes;
