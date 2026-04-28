import { Building2, CalendarCheck, CircleDollarSign, Star } from 'lucide-react';
import CardMetrica from '../components/common/CardMetrica';

function Dashboard({ propriedades, avaliacoes = [] }) {
  const total = propriedades.length;
  const ativos = propriedades.filter(
    (item) => item.status === 'Ativo' || item.status === 'Disponível'
  ).length;
  const reservados = propriedades.filter((item) => item.status === 'Reservado').length;
  const avaliacaoMedia =
    avaliacoes.length === 0
      ? '0.0'
      : (
          avaliacoes.reduce((totalAvaliacoes, avaliacao) => {
            return totalAvaliacoes + Number(avaliacao.nota);
          }, 0) / avaliacoes.length
        ).toFixed(1);

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-400">Painel / Visão geral</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Dashboard
        </h2>
      </div>

       <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CardMetrica titulo="Total de imóveis" valor={total} descricao="Cadastrados na plataforma" icone={Building2} />
        <CardMetrica titulo="Disponíveis" valor={ativos} descricao="Prontos para reserva" icone={CalendarCheck} />
        <CardMetrica titulo="Reservados" valor={reservados} descricao="Reservas em andamento" icone={CircleDollarSign} />
        <CardMetrica titulo="Avaliação média" valor={avaliacaoMedia} descricao="Baseada nos clientes" icone={Star} />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Desempenho mensal</h3>
          <p className="mt-1 text-sm text-slate-500">Resumo visual simples para apresentação do painel.</p>

          <div className="mt-6 flex h-64 items-end gap-4 rounded-2xl bg-slate-50 p-5">
            {[45, 70, 52, 88, 64, 95, 78].map((altura, index) => (
              <div key={index} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-2xl bg-slate-900" style={{ height: `${altura}%` }} />
                <span className="text-xs text-slate-400">M{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Status dos imóveis</h3>
          <div className="mt-5 space-y-4">
            {['Disponível', 'Ativo', 'Reservado', 'Manutenção'].map((status) => {
              const quantidade = propriedades.filter((item) => item.status === status).length;
              const percentual = total === 0 ? 0 : (quantidade / total) * 100;

              return (
                <div key={status}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-600">{status}</span>
                    <span className="text-slate-400">{quantidade}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100">
                    <div className="h-3 rounded-full bg-slate-900" style={{ width: `${percentual}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
