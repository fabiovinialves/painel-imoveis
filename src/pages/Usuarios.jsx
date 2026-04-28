import { useMemo, useState } from 'react';
import { Mail, Phone, Search, ShieldCheck, UserRound, UsersRound } from 'lucide-react';
import CardMetrica from '../components/common/CardMetrica';

const usuarios = [
  {
    id: 1,
    nome: 'Mariana Lopes',
    email: 'mariana@travel.com',
    telefone: '(11) 98888-1200',
    perfil: 'Administrador',
    status: 'Ativo',
    reservas: 3,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  }
];

function lerAlugueisSalvos() {
  try {
    const alugueis = localStorage.getItem('vooarp_alugueis');
    return alugueis ? JSON.parse(alugueis) : [];
  } catch (error) {
    return [];
  }
}

function normalizarStatus(status) {
  return String(status || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function aluguelAtivo(aluguel, propriedades) {
  const propriedade = propriedades.find(
    (item) => String(item.id) === String(aluguel.propriedadeId)
  );

  return normalizarStatus(propriedade?.status) === 'reservado';
}

function Usuarios({ clientes = [], propriedades = [] }) {
  const [busca, setBusca] = useState('');
  const [alugueis] = useState(lerAlugueisSalvos);

  const usuariosComClientes = useMemo(() => {
    const clientesFormatados = clientes.map((cliente) => {
      const reservas = alugueis.filter((aluguel) => {
        return aluguel.clienteEmail === cliente.email && aluguelAtivo(aluguel, propriedades);
      }).length;

      return {
        id: cliente.id,
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        perfil: 'Cliente',
        status: 'Ativo',
        reservas,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(cliente.nome)}&background=0f172a&color=fff`,
      };
    });

    return [...usuarios, ...clientesFormatados];
  }, [alugueis, clientes, propriedades]);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return usuariosComClientes;
    }

    return usuariosComClientes.filter((usuario) => {
      return (
        usuario.nome.toLowerCase().includes(termo) ||
        usuario.email.toLowerCase().includes(termo) ||
        usuario.perfil.toLowerCase().includes(termo)
      );
    });
  }, [busca, usuariosComClientes]);

  const ativos = usuariosComClientes.filter((usuario) => usuario.status === 'Ativo').length;
  const reservasAtivas = usuariosComClientes.reduce((total, usuario) => total + usuario.reservas, 0);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">Painel / Usuarios</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Usuarios
          </h2>
        </div>

        <div className="flex min-h-[48px] w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-4 shadow-sm sm:max-w-sm">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar usuario..."
            className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <CardMetrica
          titulo="Total de usuarios"
          valor={usuariosComClientes.length}
          descricao="Cadastrados na plataforma"
          icone={UsersRound}
        />
        <CardMetrica
          titulo="Usuarios ativos"
          valor={ativos}
          descricao="Com acesso liberado"
          icone={UserRound}
        />
        <CardMetrica
          titulo="Reservas vinculadas"
          valor={reservasAtivas}
          descricao="Alugueis ativos vinculados"
          icone={ShieldCheck}
        />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h3 className="text-lg font-bold text-slate-900">Lista de usuarios</h3>
          <p className="mt-1 text-sm text-slate-500">
            Visao geral dos acessos e contatos cadastrados.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {usuariosFiltrados.map((usuario) => (
            <div
              key={usuario.id}
              className="grid gap-4 p-5 lg:grid-cols-[minmax(240px,1.4fr)_minmax(180px,.8fr)_minmax(150px,.7fr)_auto]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={usuario.avatar}
                  alt={usuario.nome}
                  className="h-12 w-12 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{usuario.nome}</p>
                  <p className="truncate text-sm text-slate-500">{usuario.perfil}</p>
                </div>
              </div>

              <div className="space-y-1 text-sm text-slate-500">
                <p className="flex items-center gap-2">
                  <Mail size={15} className="shrink-0" />
                  <span className="truncate">{usuario.email}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={15} className="shrink-0" />
                  <span>{usuario.telefone}</span>
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase text-slate-400">Reservas</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{usuario.reservas}</p>
              </div>

              <div className="flex items-center lg:justify-end">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    usuario.status === 'Ativo'
                      ? 'bg-emerald-50 text-emerald-700'
                      : usuario.status === 'Pendente'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {usuario.status}
                </span>
              </div>
            </div>
          ))}

          {usuariosFiltrados.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">
              Nenhum usuario encontrado.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Usuarios;
