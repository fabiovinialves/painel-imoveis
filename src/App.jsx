import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LayoutPrincipal from './components/layout/LayoutPrincipal';
import Cabecalho from './components/layout/Cabecalho';
import MenuLateral from './components/layout/MenuLateral';
import FormularioPropriedade from './components/properties/FormularioPropriedade';
import Dashboard from './pages/Dashboard';
import Propriedades from './pages/Propriedades';
import DetalhesPropriedade from './pages/DetalhesPropriedade';
import Usuarios from './pages/Usuarios';
import Cliente from './pages/Cliente';
import Avaliacoes from './pages/Avaliacoes';
import LoginAdmin from './pages/LoginAdmin';
import ConfiguracoesAdmin from './pages/ConfiguracoesAdmin';
import {
  atualizarPropriedade,
  criarPropriedade,
  listarPropriedades,
} from './services/propriedadesService';

const STORAGE_CLIENTES = 'vooarp_clientes';
const STORAGE_AVALIACOES = 'vooarp_avaliacoes';
const STORAGE_ADMIN = 'vooarp_admin_logado';
const STORAGE_ADMIN_CONTA = 'vooarp_admin_conta';
const STORAGE_CLIENTE_LOGADO = 'vooarp_cliente_logado';
const ADMINISTRADOR_PADRAO = {
  nome: 'Administrador',
  email: 'admin@travel.com',
  senha: 'admin123',
};

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

function lerClientesSalvos() {
  try {
    const clientes = localStorage.getItem(STORAGE_CLIENTES);
    return clientes ? JSON.parse(clientes) : [];
  } catch (error) {
    return [];
  }
}

function lerAvaliacoesSalvas() {
  try {
    const avaliacoes = localStorage.getItem(STORAGE_AVALIACOES);
    return avaliacoes ? deduplicarAvaliacoes(JSON.parse(avaliacoes)) : [];
  } catch (error) {
    return [];
  }
}

function lerAdminSalvo() {
  try {
    const admin = localStorage.getItem(STORAGE_ADMIN);
    return admin ? JSON.parse(admin) : null;
  } catch (error) {
    return null;
  }
}

function lerContaAdminSalva() {
  try {
    const conta = localStorage.getItem(STORAGE_ADMIN_CONTA);
    return conta ? { ...ADMINISTRADOR_PADRAO, ...JSON.parse(conta) } : ADMINISTRADOR_PADRAO;
  } catch (error) {
    return ADMINISTRADOR_PADRAO;
  }
}

function App() {
  const [menuAberto, setMenuAberto] = useState(false);
  const [propriedades, setPropriedades] = useState([]);
  const [clientes, setClientes] = useState(lerClientesSalvos);
  const [avaliacoes, setAvaliacoes] = useState(lerAvaliacoesSalvas);
  const [contaAdmin, setContaAdmin] = useState(lerContaAdminSalva);
  const [adminLogado, setAdminLogado] = useState(lerAdminSalvo);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [propriedadeEditando, setPropriedadeEditando] = useState(null);

  async function carregarPropriedades() {
    try {
      setCarregando(true);
      setErro('');
      const dados = await listarPropriedades();
      setPropriedades(dados);
    } catch (error) {
      setErro('Nao foi possivel carregar os imoveis. Verifique se o json-server esta rodando.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarPropriedades();
  }, []);

  function abrirCadastro() {
    setPropriedadeEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(propriedade) {
    setPropriedadeEditando(propriedade);
    setModalAberto(true);
  }

  function fecharFormulario() {
    setModalAberto(false);
    setPropriedadeEditando(null);
  }

  function entrarAdmin(email, senha) {
    const emailNormalizado = email.trim().toLowerCase();

    if (emailNormalizado !== contaAdmin.email || senha !== contaAdmin.senha) {
      return false;
    }

    const admin = {
      nome: contaAdmin.nome,
      email: contaAdmin.email,
    };
    setAdminLogado(admin);
    localStorage.setItem(STORAGE_ADMIN, JSON.stringify(admin));
    return true;
  }

  function entrarCliente(email, senha) {
    const emailNormalizado = email.trim().toLowerCase();
    const cliente = clientes.find(
      (item) => item.email === emailNormalizado && item.senha === senha
    );

    if (!cliente) {
      return false;
    }

    localStorage.setItem(STORAGE_CLIENTE_LOGADO, JSON.stringify(cliente));
    return true;
  }

  function sairAdmin() {
    setAdminLogado(null);
    localStorage.removeItem(STORAGE_ADMIN);
    setMenuAberto(false);
    fecharFormulario();
  }

  function salvarContaAdmin(contaAtualizada) {
    setContaAdmin(contaAtualizada);
    localStorage.setItem(STORAGE_ADMIN_CONTA, JSON.stringify(contaAtualizada));

    const admin = {
      nome: contaAtualizada.nome,
      email: contaAtualizada.email,
    };
    setAdminLogado(admin);
    localStorage.setItem(STORAGE_ADMIN, JSON.stringify(admin));
  }

  async function salvarPropriedade(propriedadeSalva) {
    try {
      if (propriedadeEditando) {
        await atualizarPropriedade(propriedadeEditando.id, propriedadeSalva);
      } else {
        await criarPropriedade(propriedadeSalva);
      }

      await carregarPropriedades();
      fecharFormulario();
    } catch (error) {
      alert('Erro ao salvar imovel. Verifique se o json-server esta rodando.');
    }
  }

  async function alugarPropriedade(propriedade) {
    await atualizarPropriedade(propriedade.id, {
      ...propriedade,
      status: 'Reservado',
    });
    await carregarPropriedades();
  }

  async function liberarPropriedade(propriedadeId) {
    const propriedade = propriedades.find((item) => String(item.id) === String(propriedadeId));

    if (!propriedade) {
      return;
    }

    await atualizarPropriedade(propriedade.id, {
      ...propriedade,
      status: 'Ativo',
    });
    await carregarPropriedades();
  }

  function cadastrarCliente(cliente) {
    const listaAtualizada = [...clientes, cliente];
    setClientes(listaAtualizada);
    localStorage.setItem(STORAGE_CLIENTES, JSON.stringify(listaAtualizada));
  }

  async function salvarAvaliacao(avaliacao) {
    const avaliacoesSemDuplicar = avaliacoes.filter((item) => {
      return !(
        String(item.propriedadeId) === String(avaliacao.propriedadeId) &&
        item.clienteEmail === avaliacao.clienteEmail
      );
    });
    const listaAtualizada = deduplicarAvaliacoes([...avaliacoesSemDuplicar, avaliacao]);
    const avaliacoesDaPropriedade = listaAtualizada.filter(
      (item) => String(item.propriedadeId) === String(avaliacao.propriedadeId)
    );
    const media =
      avaliacoesDaPropriedade.reduce((total, item) => total + Number(item.nota), 0) /
      avaliacoesDaPropriedade.length;
    const propriedade = propriedades.find(
      (item) => String(item.id) === String(avaliacao.propriedadeId)
    );

    if (propriedade) {
      await atualizarPropriedade(propriedade.id, {
        ...propriedade,
        nota: Number(media.toFixed(1)),
      });
      await carregarPropriedades();
    }

    setAvaliacoes(listaAtualizada);
    localStorage.setItem(STORAGE_AVALIACOES, JSON.stringify(listaAtualizada));
  }

  async function excluirAvaliacao(avaliacao) {
    const listaAtualizada = avaliacoes.filter((item) => {
      return !(
        String(item.propriedadeId) === String(avaliacao.propriedadeId) &&
        item.clienteEmail === avaliacao.clienteEmail
      );
    });
    const avaliacoesDaPropriedade = listaAtualizada.filter(
      (item) => String(item.propriedadeId) === String(avaliacao.propriedadeId)
    );
    const propriedade = propriedades.find(
      (item) => String(item.id) === String(avaliacao.propriedadeId)
    );

    if (propriedade) {
      const notaAtualizada = avaliacoesDaPropriedade.length
        ? Number(
            (
              avaliacoesDaPropriedade.reduce((total, item) => total + Number(item.nota), 0) /
              avaliacoesDaPropriedade.length
            ).toFixed(1)
          )
        : 0;

      await atualizarPropriedade(propriedade.id, {
        ...propriedade,
        nota: notaAtualizada,
      });
      await carregarPropriedades();
    }

    setAvaliacoes(listaAtualizada);
    localStorage.setItem(STORAGE_AVALIACOES, JSON.stringify(listaAtualizada));
  }

  function ConteudoAdmin() {
    if (!adminLogado) {
      return <LoginAdmin aoEntrarAdmin={entrarAdmin} aoEntrarCliente={entrarCliente} />;
    }

    return (
      <LayoutPrincipal
        cabecalho={
          <Cabecalho
            aoAbrirMenu={() => setMenuAberto(true)}
            administrador={adminLogado}
          />
        }
        menuLateral={
          <MenuLateral
            aberto={menuAberto}
            aoFechar={() => setMenuAberto(false)}
            aoSair={sairAdmin}
          />
        }
      >
        {carregando && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Carregando imoveis...
          </div>
        )}

        {erro && !carregando && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-600 shadow-sm">
            {erro}
          </div>
        )}

        {!carregando && !erro && (
          <Routes>
            <Route index element={<Dashboard propriedades={propriedades} avaliacoes={avaliacoes} />} />

            <Route
              path="propriedades"
              element={
                <Propriedades
                  propriedades={propriedades}
                  aoAdicionar={abrirCadastro}
                  aoEditar={abrirEdicao}
                />
              }
            />

            <Route
              path="propriedades/:id"
              element={<DetalhesPropriedade propriedades={propriedades} />}
            />

            <Route path="usuarios" element={<Usuarios clientes={clientes} propriedades={propriedades} />} />
            <Route path="usuários" element={<Usuarios clientes={clientes} propriedades={propriedades} />} />
            <Route
              path="avaliacoes"
              element={<Avaliacoes avaliacoes={avaliacoes} propriedades={propriedades} />}
            />
            <Route
              path="configuracoes"
              element={
                <ConfiguracoesAdmin
                  administrador={contaAdmin}
                  aoSalvar={salvarContaAdmin}
                />
              }
            />
          </Routes>
        )}
      </LayoutPrincipal>
    );
  }

  function ConteudoCliente() {
    if (carregando) {
      return (
        <div className="min-h-screen bg-slate-100 p-6 text-center text-slate-500">
          Carregando imoveis...
        </div>
      );
    }

    if (erro) {
      return <div className="min-h-screen bg-slate-100 p-6 text-center text-red-600">{erro}</div>;
    }

    return (
      <Cliente
        propriedades={propriedades}
        clientes={clientes}
        avaliacoes={avaliacoes}
        aoEntrarAdmin={entrarAdmin}
        aoCadastrarCliente={cadastrarCliente}
        aoAlugar={alugarPropriedade}
        aoCancelarAluguel={liberarPropriedade}
        aoAvaliar={salvarAvaliacao}
        aoExcluirAvaliacao={excluirAvaliacao}
      />
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<ConteudoCliente />} />
        <Route path="/login" element={<LoginAdmin aoEntrarAdmin={entrarAdmin} aoEntrarCliente={entrarCliente} />} />
        <Route path="/cliente" element={<ConteudoCliente />} />
        <Route path="/admin/*" element={<ConteudoAdmin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <FormularioPropriedade
        aberto={modalAberto}
        aoFechar={fecharFormulario}
        aoSalvar={salvarPropriedade}
        propriedadeEditando={propriedadeEditando}
      />
    </>
  );
}

export default App;
