import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Copy,
  CreditCard,
  Eye,
  Globe2,
  Heart,
  Hotel,
  LogOut,
  Mail,
  Menu,
  MapPin,
  QrCode,
  Search,
  ShieldCheck,
  Star,
  Trash2,
  UserRound,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import BotaoPrimario from '../components/common/BotaoPrimario';
import SeloStatus from '../components/common/SeloStatus';
import GaleriaFotosPropriedade from '../components/common/GaleriaFotosPropriedade';
import { formatarNota } from '../utils/formatadores';
import { obterFotoPrincipalPropriedade, obterFotosPropriedade } from '../utils/propriedades';

const STORAGE_CLIENTE = 'vooarp_cliente_logado';
const STORAGE_ALUGUEIS = 'vooarp_alugueis';
const opcoesParcelamento = [1, 2, 3, 4, 5, 6, 10, 12];
const formasPagamento = [
  { valor: 'cartao', rotulo: 'Cartao', icone: CreditCard },
  { valor: 'pix', rotulo: 'Pix', icone: QrCode },
];
const dddsBrasil = [
  { uf: 'SP', codigos: ['11', '12', '13', '14', '15', '16', '17', '18', '19'] },
  { uf: 'RJ/ES', codigos: ['21', '22', '24', '27', '28'] },
  { uf: 'MG', codigos: ['31', '32', '33', '34', '35', '37', '38'] },
  { uf: 'PR/SC', codigos: ['41', '42', '43', '44', '45', '46', '47', '48', '49'] },
  { uf: 'RS', codigos: ['51', '53', '54', '55'] },
  { uf: 'DF/GO/TO/MT/MS/AC/RO', codigos: ['61', '62', '63', '64', '65', '66', '67', '68', '69'] },
  { uf: 'BA/SE', codigos: ['71', '73', '74', '75', '77', '79'] },
  { uf: 'PE/AL/PB/RN/CE/PI/MA', codigos: ['81', '82', '83', '84', '85', '86', '87', '88', '89'] },
  { uf: 'PA/AM/RR/AP', codigos: ['91', '92', '93', '94', '95', '96', '97'] },
  { uf: 'MA/PI', codigos: ['98', '99'] },
];

function lerStorage(chave, fallback) {
  try {
    const valor = localStorage.getItem(chave);
    return valor ? JSON.parse(valor) : fallback;
  } catch (error) {
    return fallback;
  }
}

function salvarStorage(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

function formatarTelefone(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 9);

  if (digitos.length <= 4) {
    return digitos;
  }

  if (digitos.length <= 8) {
    return `${digitos.slice(0, 4)}-${digitos.slice(4)}`;
  }

  return `${digitos.slice(0, 5)}-${digitos.slice(5)}`;
}

function formatarNumeroCartao(valor) {
  return valor
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatarValidadeCartao(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 4);

  if (digitos.length <= 2) {
    return digitos;
  }

  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}

function normalizarStatus(status) {
  return String(status || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function propriedadeDisponivelParaCliente(propriedade) {
  const status = normalizarStatus(propriedade.status);
  return status.includes('dispon') || status === 'ativo';
}

function propriedadeAlugadaAtiva(propriedade) {
  return normalizarStatus(propriedade?.status) === 'reservado';
}

function deduplicarAlugueisPorPropriedade(alugueis) {
  const alugueisPorPropriedade = new Map();

  alugueis.forEach((aluguel) => {
    const chave = String(aluguel.propriedadeId);
    const aluguelAtual = alugueisPorPropriedade.get(chave);

    if (!aluguelAtual || new Date(aluguel.data || 0) >= new Date(aluguelAtual.data || 0)) {
      alugueisPorPropriedade.set(chave, aluguel);
    }
  });

  return Array.from(alugueisPorPropriedade.values());
}

function dataAtualInput() {
  return new Date().toISOString().slice(0, 10);
}

function formatarDataAluguel(data) {
  if (!data) {
    return 'Nao informado';
  }

  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(`${data}T00:00:00Z`));
}

function obterValorNumericoPreco(preco) {
  const valorLimpo = String(preco || '').replace(/[^\d.,]/g, '');

  if (!valorLimpo) {
    return 0;
  }

  const valorNormalizado = valorLimpo.includes(',')
    ? valorLimpo.replace(/\./g, '').replace(',', '.')
    : valorLimpo;

  return Number(valorNormalizado) || 0;
}

function formatarValorParcela(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

function rotuloPagamento(valor) {
  return formasPagamento.find((forma) => forma.valor === valor)?.rotulo || 'Nao informado';
}

function cartaoValido(numero) {
  const digitos = numero.replace(/\D/g, '');

  if (digitos.length < 13 || digitos.length > 19) {
    return false;
  }

  let soma = 0;
  let dobrar = false;

  for (let indice = digitos.length - 1; indice >= 0; indice -= 1) {
    let digito = Number(digitos[indice]);

    if (dobrar) {
      digito *= 2;
      if (digito > 9) {
        digito -= 9;
      }
    }

    soma += digito;
    dobrar = !dobrar;
  }

  return soma % 10 === 0;
}

function validadeCartaoValida(validade) {
  const [mesTexto, anoTexto] = validade.split('/');
  const mes = Number(mesTexto);
  const ano = Number(anoTexto);

  if (!mes || !ano || mes < 1 || mes > 12) {
    return false;
  }

  const anoCompleto = 2000 + ano;
  const fimDoMes = new Date(anoCompleto, mes, 0, 23, 59, 59);

  return fimDoMes >= new Date();
}

function gerarCodigoPix(propriedade, cliente, aluguel) {
  if (!propriedade || !cliente) {
    return '';
  }

  const referencia = [
    'PIX-VOOARP',
    `IMOVEL:${propriedade.id}`,
    `CLIENTE:${cliente.email}`,
    `ENTRADA:${aluguel.dataInicio || 'NAO-INFORMADA'}`,
    `SAIDA:${aluguel.dataFim || 'NAO-INFORMADA'}`,
    `VALOR:${propriedade.preco}`,
  ];

  return referencia.join('|');
}

function Cliente({
  propriedades,
  clientes,
  avaliacoes = [],
  aoEntrarAdmin,
  aoCadastrarCliente,
  aoAlugar,
  aoCancelarAluguel,
  aoAvaliar,
  aoExcluirAvaliacao,
}) {
  const navigate = useNavigate();
  const [clienteLogado, setClienteLogado] = useState(() => lerStorage(STORAGE_CLIENTE, null));
  const [alugueis, setAlugueis] = useState(() => lerStorage(STORAGE_ALUGUEIS, []));
  const [avaliacoesFormulario, setAvaliacoesFormulario] = useState({});
  const [modo, setModo] = useState('entrar');
  const [modalAcesso, setModalAcesso] = useState(null);
  const [menuContaAberto, setMenuContaAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [propriedadeSelecionada, setPropriedadeSelecionada] = useState(null);
  const [secaoCliente, setSecaoCliente] = useState('propriedades');
  const [aluguelFormulario, setAluguelFormulario] = useState({
    dataInicio: dataAtualInput(),
    dataFim: '',
    pagamento: 'pix',
    pixConfirmado: false,
    cartaoNome: '',
    cartaoNumero: '',
    cartaoValidade: '',
    cartaoCvv: '',
    parcelas: 1,
  });
  const [formulario, setFormulario] = useState({
    nome: '',
    email: '',
    ddd: '11',
    telefone: '',
    senha: '',
  });

  const propriedadesDisponiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return propriedades.filter((propriedade) => {
      const disponivel =
        propriedade.status === 'Ativo' ||
        propriedade.status === 'Disponivel' ||
        propriedade.status === 'DisponÃ­vel';
      const correspondeBusca =
        !termo ||
        propriedade.titulo.toLowerCase().includes(termo) ||
        propriedade.localizacao.toLowerCase().includes(termo) ||
        propriedade.tipo.toLowerCase().includes(termo);

      return propriedadeDisponivelParaCliente(propriedade) && correspondeBusca;
    });
  }, [busca, propriedades]);

  const alugueisCliente = useMemo(() => {
    if (!clienteLogado) {
      return [];
    }

    return deduplicarAlugueisPorPropriedade(
      alugueis.filter((aluguel) => aluguel.clienteEmail === clienteLogado.email)
    );
  }, [alugueis, clienteLogado]);

  const alugueisVisiveisCliente = useMemo(() => {
    return alugueisCliente
      .map((aluguel) => {
        const propriedadeAtual = propriedades.find(
          (propriedade) => String(propriedade.id) === String(aluguel.propriedadeId)
        );

        return {
          ...aluguel,
          propriedadeTitulo: propriedadeAtual?.titulo || aluguel.propriedadeTitulo,
          localizacao: propriedadeAtual?.localizacao || aluguel.localizacao,
          preco: propriedadeAtual?.preco || aluguel.preco,
          status: propriedadeAtual?.status || aluguel.status,
          imagem: propriedadeAtual ? obterFotoPrincipalPropriedade(propriedadeAtual) : aluguel.imagem,
          imagens: propriedadeAtual ? obterFotosPropriedade(propriedadeAtual) : aluguel.imagens,
          descricao: propriedadeAtual?.descricao,
          quartos: propriedadeAtual?.quartos,
          hospedes: propriedadeAtual?.hospedes,
          nota: propriedadeAtual?.nota,
          tipo: propriedadeAtual?.tipo,
        };
      })
      .filter((aluguel) => {
        const propriedadeAtual = propriedades.find(
          (propriedade) => String(propriedade.id) === String(aluguel.propriedadeId)
        );

        return propriedadeAlugadaAtiva(propriedadeAtual);
      });
  }, [alugueisCliente, propriedades]);

  const avaliacoesCliente = useMemo(() => {
    if (!clienteLogado) {
      return [];
    }

    return avaliacoes.filter((avaliacao) => avaliacao.clienteEmail === clienteLogado.email);
  }, [avaliacoes, clienteLogado]);

  const codigoPix = useMemo(() => {
    return gerarCodigoPix(propriedadeSelecionada, clienteLogado, aluguelFormulario);
  }, [aluguelFormulario, clienteLogado, propriedadeSelecionada]);

  const valorParcelaCartao = useMemo(() => {
    const valorImovel = obterValorNumericoPreco(propriedadeSelecionada?.preco);
    const parcelas = Number(aluguelFormulario.parcelas || 1);

    if (!valorImovel || !parcelas) {
      return '';
    }

    return formatarValorParcela(valorImovel / parcelas);
  }, [aluguelFormulario.parcelas, propriedadeSelecionada]);

  function atualizarFormulario(campo, valor) {
    setFormulario((atual) => ({ ...atual, [campo]: valor }));
    setMensagem('');
  }

  function limparFormulario() {
    setFormulario({ nome: '', email: '', ddd: '11', telefone: '', senha: '' });
  }

  function cadastrarCliente(event) {
    event.preventDefault();

    if (!formulario.nome || !formulario.email || !formulario.ddd || !formulario.telefone || !formulario.senha) {
      setMensagem('Preencha todos os campos para criar sua conta.');
      return;
    }

    const email = formulario.email.trim().toLowerCase();
    const telefoneLimpo = formulario.telefone.replace(/\D/g, '');

    if (telefoneLimpo.length < 8 || telefoneLimpo.length > 9) {
      setMensagem('Informe um telefone valido com 8 ou 9 digitos.');
      return;
    }

    const clienteExistente = clientes.some((cliente) => cliente.email === email);

    if (clienteExistente) {
      setMensagem('Este email ja esta cadastrado. Entre com sua conta.');
      setModo('entrar');
      return;
    }

    const novoCliente = {
      id: crypto.randomUUID(),
      nome: formulario.nome.trim(),
      email,
      telefone: `+55 (${formulario.ddd}) ${formatarTelefone(telefoneLimpo)}`,
      senha: formulario.senha,
      perfil: 'Cliente',
    };

    aoCadastrarCliente(novoCliente);
    setClienteLogado(novoCliente);
    salvarStorage(STORAGE_CLIENTE, novoCliente);
    limparFormulario();
    setMensagem('Cadastro criado');
    setModalAcesso(null);
  }

  function entrarCliente(event) {
    event.preventDefault();

    const email = formulario.email.trim().toLowerCase();
    const cliente = clientes.find(
      (item) => item.email === email && item.senha === formulario.senha
    );

    if (!cliente) {
      setMensagem('Email ou senha invalidos para cliente.');
      return;
    }

    setClienteLogado(cliente);
    salvarStorage(STORAGE_CLIENTE, cliente);
    limparFormulario();
    setMensagem('');
    setModalAcesso(null);
  }

  function entrarAdminPublico(event) {
    event.preventDefault();

    if (!aoEntrarAdmin || !aoEntrarAdmin(formulario.email, formulario.senha)) {
      setMensagem('Email ou senha invalidos para administrador.');
      return;
    }

    limparFormulario();
    setMensagem('');
    setModalAcesso(null);
    navigate('/admin');
  }

  function sairCliente() {
    setClienteLogado(null);
    localStorage.removeItem(STORAGE_CLIENTE);
    setMensagem('');
    setModo('entrar');
  }

  function selecionarPropriedade(propriedade) {
    setPropriedadeSelecionada(propriedade);
    setAluguelFormulario({
      dataInicio: dataAtualInput(),
      dataFim: '',
      pagamento: 'pix',
      pixConfirmado: false,
      cartaoNome: '',
      cartaoNumero: '',
      cartaoValidade: '',
      cartaoCvv: '',
      parcelas: 1,
    });
    setMensagem('');
  }

  function atualizarAluguelFormulario(campo, valor) {
    setAluguelFormulario((atual) => {
      const proximo = { ...atual, [campo]: valor };

      if (campo === 'dataInicio' && proximo.dataFim && proximo.dataFim < valor) {
        proximo.dataFim = valor;
      }

      if (['dataInicio', 'dataFim', 'pagamento'].includes(campo)) {
        proximo.pixConfirmado = false;
      }

      return proximo;
    });
    setMensagem('');
  }

  async function copiarCodigoPix() {
    if (!codigoPix) {
      return;
    }

    try {
      await navigator.clipboard.writeText(codigoPix);
      setMensagem('Codigo Pix copiado. Depois de pagar, confirme para concluir o aluguel.');
    } catch (error) {
      setMensagem('Nao foi possivel copiar automaticamente. Selecione e copie o codigo Pix.');
    }
  }

  async function alugarPropriedade(propriedade) {
    if (!clienteLogado) {
      setPropriedadeSelecionada(null);
      setModalAcesso('cliente');
      setModo('entrar');
      setMensagem('Entre como cliente para concluir o aluguel.');
      return;
    }

    const aluguelExistente = alugueisVisiveisCliente.some(
      (aluguel) => String(aluguel.propriedadeId) === String(propriedade.id)
    );

    if (aluguelExistente) {
      setMensagem('Voce ja alugou esta propriedade.');
      return;
    }

    if (!aluguelFormulario.dataInicio || !aluguelFormulario.dataFim) {
      setMensagem('Selecione a data de entrada e a data final do aluguel.');
      return;
    }

    if (aluguelFormulario.dataFim < aluguelFormulario.dataInicio) {
      setMensagem('A data final do aluguel deve ser igual ou posterior a data de entrada.');
      return;
    }

    if (!aluguelFormulario.pagamento) {
      setMensagem('Selecione a forma de pagamento.');
      return;
    }

    if (aluguelFormulario.pagamento === 'pix' && !aluguelFormulario.pixConfirmado) {
      setMensagem('Copie o Pix, realize o pagamento e marque a confirmacao antes de alugar.');
      return;
    }

    if (aluguelFormulario.pagamento === 'cartao') {
      const nomeCartao = aluguelFormulario.cartaoNome.trim();
      const numeroCartao = aluguelFormulario.cartaoNumero.replace(/\D/g, '');
      const cvvCartao = aluguelFormulario.cartaoCvv.replace(/\D/g, '');

      if (!nomeCartao || !aluguelFormulario.cartaoNumero || !aluguelFormulario.cartaoValidade || !cvvCartao) {
        setMensagem('Preencha todos os dados do cartao para concluir o aluguel.');
        return;
      }

      if (!cartaoValido(aluguelFormulario.cartaoNumero)) {
        setMensagem('Informe um numero de cartao valido.');
        return;
      }

      if (!validadeCartaoValida(aluguelFormulario.cartaoValidade)) {
        setMensagem('Informe uma validade de cartao valida.');
        return;
      }

      if (cvvCartao.length < 3 || cvvCartao.length > 4) {
        setMensagem('Informe um CVV valido.');
        return;
      }

      if (numeroCartao.length < 13 || numeroCartao.length > 19) {
        setMensagem('Informe um numero de cartao valido.');
        return;
      }

      if (!opcoesParcelamento.includes(Number(aluguelFormulario.parcelas))) {
        setMensagem('Selecione uma opcao de parcelamento valida.');
        return;
      }
    }

    try {
      const numeroCartao = aluguelFormulario.cartaoNumero.replace(/\D/g, '');
      await aoAlugar(propriedade);

      const novoAluguel = {
        id: crypto.randomUUID(),
        clienteEmail: clienteLogado.email,
        clienteNome: clienteLogado.nome,
        propriedadeId: propriedade.id,
        propriedadeTitulo: propriedade.titulo,
        localizacao: propriedade.localizacao,
        preco: propriedade.preco,
        dataInicio: aluguelFormulario.dataInicio,
        dataFim: aluguelFormulario.dataFim,
        pagamento: aluguelFormulario.pagamento,
        pixReferencia: aluguelFormulario.pagamento === 'pix' ? codigoPix : '',
        cartaoFinal: aluguelFormulario.pagamento === 'cartao' ? numeroCartao.slice(-4) : '',
        cartaoNome: aluguelFormulario.pagamento === 'cartao' ? aluguelFormulario.cartaoNome.trim() : '',
        parcelas: aluguelFormulario.pagamento === 'cartao' ? Number(aluguelFormulario.parcelas) : 1,
        valorParcela: aluguelFormulario.pagamento === 'cartao' ? valorParcelaCartao : '',
        data: new Date().toISOString(),
      };

      const listaAtualizada = [...alugueis, novoAluguel];
      setAlugueis(listaAtualizada);
      salvarStorage(STORAGE_ALUGUEIS, listaAtualizada);
      setPropriedadeSelecionada(null);
      setSecaoCliente('alugueis');
      setMensagem(`${propriedade.titulo} foi alugado com sucesso.`);
    } catch (error) {
      setMensagem('Nao foi possivel concluir o aluguel. Verifique se o json-server esta rodando.');
    }
  }

  async function excluirAluguel(aluguel) {
    try {
      if (aoCancelarAluguel) {
        await aoCancelarAluguel(aluguel.propriedadeId);
      }

      const listaAtualizada = alugueis.filter((item) => {
        return !(
          item.clienteEmail === clienteLogado.email &&
          String(item.propriedadeId) === String(aluguel.propriedadeId)
        );
      });
      setAlugueis(listaAtualizada);
      salvarStorage(STORAGE_ALUGUEIS, listaAtualizada);
      setMensagem(`${aluguel.propriedadeTitulo} foi removido dos seus alugueis.`);
    } catch (error) {
      setMensagem('Nao foi possivel excluir o aluguel. Verifique se o json-server esta rodando.');
    }
  }

  function atualizarAvaliacao(propriedadeId, campo, valor) {
    setAvaliacoesFormulario((atual) => ({
      ...atual,
      [propriedadeId]: {
        nota: atual[propriedadeId]?.nota || 5,
        comentario: atual[propriedadeId]?.comentario || '',
        [campo]: valor,
      },
    }));
    setMensagem('');
  }

  async function enviarAvaliacao(aluguel) {
    const avaliacaoAtual = avaliacoesFormulario[aluguel.propriedadeId] || {};
    const nota = Number(avaliacaoAtual.nota || 5);
    const comentario = (avaliacaoAtual.comentario || '').trim();

    if (!comentario) {
      setMensagem('Escreva um comentario para avaliar a propriedade.');
      return;
    }

    try {
      await aoAvaliar({
        id: `${clienteLogado.email}-${aluguel.propriedadeId}`,
        clienteEmail: clienteLogado.email,
        clienteNome: clienteLogado.nome,
        propriedadeId: aluguel.propriedadeId,
        propriedadeTitulo: aluguel.propriedadeTitulo,
        localizacao: aluguel.localizacao,
        nota,
        comentario,
        data: new Date().toISOString(),
      });

      setMensagem('Avaliacao enviada com sucesso.');
    } catch (error) {
      setMensagem('Nao foi possivel salvar a avaliacao. Verifique se o json-server esta rodando.');
    }
  }

  async function excluirAvaliacao(avaliacao) {
    try {
      if (aoExcluirAvaliacao) {
        await aoExcluirAvaliacao(avaliacao);
      }

      setAvaliacoesFormulario((atual) => {
        const proximo = { ...atual };
        delete proximo[avaliacao.propriedadeId];
        return proximo;
      });
      setMensagem('Avaliacao excluida com sucesso.');
    } catch (error) {
      setMensagem('Nao foi possivel excluir a avaliacao. Verifique se o json-server esta rodando.');
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white">
              <Hotel size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-rose-600">StayHub</h1>
              <p className="text-sm text-slate-500">Acomodações para alugar</p>
            </div>
          </div>

          {!clienteLogado && (
            <div className="order-3 grid rounded-full border border-slate-200 bg-white p-2 shadow-sm lg:order-2 lg:min-w-[520px] lg:grid-cols-[1fr_1fr_auto]">
              <label className="min-w-0 px-4 py-1">
                <span className="block text-xs font-bold text-slate-900">Onde</span>
                <input
                  type="search"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Buscar destinos"
                  className="w-full border-none bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
                />
              </label>
              <div className="hidden border-l border-slate-200 px-4 py-1 sm:block">
                <span className="block text-xs font-bold text-slate-900">Quando</span>
                <span className="text-sm text-slate-500">Insira as datas</span>
              </div>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white transition hover:bg-rose-700"
                aria-label="Buscar"
              >
                <Search size={20} />
              </button>
            </div>
          )}

          <div className="order-2 flex flex-wrap items-center gap-3 lg:order-3">
            {clienteLogado ? (
              <>
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
                {clienteLogado.nome}
              </div>
              <button
                type="button"
                onClick={sairCliente}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LogOut size={16} />
                Sair
              </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setModalAcesso('cliente');
                    setModo('entrar');
                    setMensagem('');
                    setMenuContaAberto(false);
                  }}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Login cliente
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalAcesso('admin');
                    setModo('entrar');
                    setMensagem('');
                    setMenuContaAberto(false);
                  }}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Login admin
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700"
                  aria-label="Idioma"
                >
                  <Globe2 size={18} />
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuContaAberto((aberto) => !aberto)}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
                    aria-label="Menu"
                    aria-expanded={menuContaAberto}
                  >
                    <Menu size={18} />
                  </button>

                  {menuContaAberto && (
                    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setModalAcesso('cliente');
                          setModo('cadastro');
                          setMensagem('');
                          setMenuContaAberto(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <UserPlus size={17} />
                        Criar conta
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {!clienteLogado ? (
          <section className="space-y-12">
            <div className="pt-2">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Acomodações muito procuradas
                </h2>
              </div>
            </div>

            {propriedadesDisponiveis.length > 0 ? (
              <div id="propriedades" className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-6">
                {propriedadesDisponiveis.map((propriedade) => (
                  <article key={propriedade.id} className="group min-w-0">
                    <button
                      type="button"
                      onClick={() => selecionarPropriedade(propriedade)}
                      className="block w-full min-w-0 text-left"
                    >
                      <GaleriaFotosPropriedade
                        propriedade={propriedade}
                        alt={propriedade.titulo}
                        className="aspect-square rounded-2xl"
                        imagemClassName="transition duration-500 group-hover:scale-105"
                      >
                        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-800 shadow">
                          Preferido dos hóspedes
                        </span>
                        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white transition group-hover:bg-black/35">
                          <Heart size={20} />
                        </span>
                      </GaleriaFotosPropriedade>
                      <div className="mt-3 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="min-w-0 truncate text-sm font-bold text-slate-950">
                            {propriedade.titulo}
                          </h3>
                          <span className="flex shrink-0 items-center gap-1 text-sm text-slate-700">
                            <Star size={13} className="fill-slate-900 text-slate-900" />
                            {formatarNota(propriedade.nota)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-slate-500">{propriedade.localizacao}</p>
                        <p className="mt-1 text-sm text-slate-500">8 - 10 de mai.</p>
                        <p className="mt-1 text-sm text-slate-700">
                          <span className="font-semibold text-slate-950">{propriedade.preco}</span> total
                        </p>
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
                Nenhuma propriedade disponivel para aluguel agora.
              </div>
            )}
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
            <aside className="hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
              <div className="mb-5 flex items-center gap-3 border-b border-slate-200 pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <UserRound size={20} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{clienteLogado.nome}</p>
                  <p className="truncate text-xs text-slate-500">Area do cliente</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSecaoCliente('propriedades')}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                    secaoCliente === 'propriedades'
                      ? 'bg-slate-100 font-semibold text-slate-900'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Building2 size={18} />
                  Propriedades
                </button>
                <button
                  type="button"
                  onClick={() => setSecaoCliente('alugueis')}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                    secaoCliente === 'alugueis'
                      ? 'bg-slate-100 font-semibold text-slate-900'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <ClipboardList size={18} />
                  Meus alugueis
                </button>
              </nav>
            </aside>

            <section className="space-y-6">
            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm lg:hidden">
              <button
                type="button"
                onClick={() => setSecaoCliente('propriedades')}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  secaoCliente === 'propriedades'
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Propriedades
              </button>
              <button
                type="button"
                onClick={() => setSecaoCliente('alugueis')}
                className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                  secaoCliente === 'alugueis'
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Meus alugueis
              </button>
            </div>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Area do cliente</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {secaoCliente === 'propriedades' ? 'Propriedades para alugar' : 'Meus alugueis'}
                </h2>
              </div>

              {secaoCliente === 'propriedades' && (
              <div className="flex min-h-[48px] w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-4 shadow-sm lg:max-w-sm">
                <Search size={18} className="text-slate-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                  placeholder="Buscar por local, tipo ou nome..."
                  className="w-full border-none bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              )}
            </div>

            {mensagem && (
              <div className="rounded-3xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-600 shadow-sm">
                {mensagem}
              </div>
            )}

            {secaoCliente === 'alugueis' && alugueisVisiveisCliente.length > 0 && (
              <div id="alugueis" className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Seus alugueis</h3>
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {alugueisVisiveisCliente.map((aluguel) => {
                    const avaliacaoExistente = avaliacoesCliente.find(
                      (avaliacao) =>
                        String(avaliacao.propriedadeId) === String(aluguel.propriedadeId)
                    );

                    return (
                      <div key={aluguel.id} className="overflow-hidden rounded-2xl bg-slate-50">
                        <div className="grid gap-0 lg:grid-cols-[220px_1fr]">
                          <GaleriaFotosPropriedade
                            propriedade={aluguel}
                            alt={aluguel.propriedadeTitulo}
                            className="h-48 lg:h-full"
                          />

                          <div className="p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-semibold text-slate-900">{aluguel.propriedadeTitulo}</p>
                                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                                  <MapPin size={15} />
                                  {aluguel.localizacao}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2 sm:justify-end">
                                <SeloStatus status={aluguel.status} />
                                {avaliacaoExistente && (
                                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    Avaliado
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => excluirAluguel(aluguel)}
                                  className="inline-flex items-center gap-1 rounded-full border border-red-100 bg-white px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                  <Trash2 size={14} />
                                  Excluir
                                </button>
                              </div>
                            </div>

                            <p className="mt-3 line-clamp-2 text-sm text-slate-500">{aluguel.descricao}</p>

                            <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2">
                              <div className="flex min-h-12 items-center gap-3 rounded-2xl bg-white px-3 py-2">
                                <BedDouble size={17} className="shrink-0 text-slate-500" />
                                <span className="min-w-0 leading-5">
                                  <strong className="font-semibold text-slate-900">{aluguel.quartos}</strong>{' '}
                                  quartos
                                </span>
                              </div>
                              <div className="flex min-h-12 items-center gap-3 rounded-2xl bg-white px-3 py-2">
                                <Users size={17} className="shrink-0 text-slate-500" />
                                <span className="min-w-0 leading-5">
                                  <strong className="font-semibold text-slate-900">{aluguel.hospedes}</strong>{' '}
                                  hospedes
                                </span>
                              </div>
                              <div className="flex min-h-12 items-center gap-3 rounded-2xl bg-white px-3 py-2">
                                <Star size={17} className="shrink-0 fill-yellow-400 text-yellow-400" />
                                <span className="min-w-0 leading-5">
                                  Nota <strong className="font-semibold text-slate-900">{formatarNota(aluguel.nota || 0)}</strong>
                                </span>
                              </div>
                              <div className="flex min-h-12 items-center gap-3 rounded-2xl bg-white px-3 py-2">
                                <Building2 size={17} className="shrink-0 text-slate-500" />
                                <span className="min-w-0 break-words leading-5">
                                  {aluguel.tipo}
                                </span>
                              </div>
                            </div>

                            <p className="mt-4 text-2xl font-bold text-slate-900">{aluguel.preco}</p>

                            <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-3">
                              <div className="rounded-2xl bg-white px-3 py-2">
                                <span className="text-xs font-semibold uppercase text-slate-400">Entrada</span>
                                <p className="mt-1 font-semibold text-slate-900">
                                  {formatarDataAluguel(aluguel.dataInicio)}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-white px-3 py-2">
                                <span className="text-xs font-semibold uppercase text-slate-400">Saida</span>
                                <p className="mt-1 font-semibold text-slate-900">
                                  {formatarDataAluguel(aluguel.dataFim)}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-white px-3 py-2">
                                <span className="text-xs font-semibold uppercase text-slate-400">Pagamento</span>
                                <p className="mt-1 font-semibold text-slate-900">
                                  {rotuloPagamento(aluguel.pagamento)}
                                  {aluguel.cartaoFinal ? ` final ${aluguel.cartaoFinal}` : ''}
                                </p>
                                {aluguel.pagamento === 'cartao' && aluguel.parcelas && (
                                  <p className="mt-1 text-xs font-medium text-slate-500">
                                    {aluguel.parcelas}x
                                    {aluguel.valorParcela ? ` de ${aluguel.valorParcela}` : ''}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {!avaliacaoExistente && (
                          <div className="space-y-3 border-t border-slate-200 p-4">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-medium text-slate-600">Sua nota</span>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, index) => {
                                  const notaAtual =
                                    avaliacoesFormulario[aluguel.propriedadeId]?.nota || 5;

                                  return (
                                    <button
                                      key={index}
                                      type="button"
                                      onClick={() =>
                                        atualizarAvaliacao(aluguel.propriedadeId, 'nota', index + 1)
                                      }
                                      className="text-yellow-400"
                                    >
                                      <Star
                                        size={19}
                                        className={
                                          index < Number(notaAtual)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-slate-300'
                                        }
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <textarea
                              value={avaliacoesFormulario[aluguel.propriedadeId]?.comentario ?? ''}
                              onChange={(event) =>
                                atualizarAvaliacao(
                                  aluguel.propriedadeId,
                                  'comentario',
                                  event.target.value
                                )
                              }
                              placeholder="Conte como foi sua estadia..."
                              className="min-h-24 w-full resize-none rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-400"
                            />

                            <button
                              type="button"
                              onClick={() => enviarAvaliacao(aluguel)}
                              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100"
                            >
                              <Star size={16} />
                              Salvar avaliação
                            </button>
                          </div>
                        )}

                        {avaliacaoExistente && (
                          <div className="space-y-3 border-t border-slate-200 p-4">
                            <div className="rounded-2xl bg-white p-3">
                              <div className="mb-2 flex items-center gap-1 text-yellow-400">
                                {Array.from({ length: 5 }).map((_, index) => (
                                  <Star
                                    key={index}
                                    size={17}
                                    className={
                                      index < Number(avaliacaoExistente.nota)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-slate-300'
                                    }
                                  />
                                ))}
                              </div>
                              <p className="text-sm leading-6 text-slate-600">
                                {avaliacaoExistente.comentario}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => excluirAvaliacao(avaliacaoExistente)}
                              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-100 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                              Excluir avaliação
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {secaoCliente === 'alugueis' && alugueisVisiveisCliente.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
                Voce ainda nao possui alugueis ativos.
              </div>
            )}

            {secaoCliente === 'propriedades' && (
            <div id="propriedades" className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {propriedadesDisponiveis.map((propriedade) => (
                <article
                  key={propriedade.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <GaleriaFotosPropriedade
                    propriedade={propriedade}
                    alt={propriedade.titulo}
                    className="h-56"
                  >
                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-slate-800 shadow">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      {formatarNota(propriedade.nota)}
                    </div>
                  </GaleriaFotosPropriedade>

                  <div className="space-y-4 p-5">
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

                    <p className="line-clamp-2 text-sm text-slate-500">{propriedade.descricao}</p>

                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <BedDouble size={17} />
                        <p className="mt-2 font-semibold">{propriedade.quartos} quartos</p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <Users size={17} />
                        <p className="mt-2 font-semibold">{propriedade.hospedes} hospedes</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                      <p className="text-2xl font-bold text-slate-900">{propriedade.preco}</p>
                      <BotaoPrimario type="button" onClick={() => selecionarPropriedade(propriedade)}>
                        <Eye size={16} />
                        Ver detalhes
                      </BotaoPrimario>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            )}

            {secaoCliente === 'propriedades' && propriedadesDisponiveis.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
                Nenhuma propriedade disponivel para aluguel agora.
              </div>
            )}
            </section>
          </div>
        )}
      </div>

      {modalAcesso && !clienteLogado && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
          <section className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  {modalAcesso === 'admin' ? <ShieldCheck size={16} /> : <UserRound size={16} />}
                  {modalAcesso === 'admin' ? 'Area administrativa' : 'Area do cliente'}
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {modalAcesso === 'admin'
                    ? 'Entrar como admin'
                    : modo === 'entrar'
                      ? 'Entrar como cliente'
                      : 'Cadastrar cliente'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalAcesso(null);
                  setMensagem('');
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            {modalAcesso === 'cliente' && (
              <div className="mb-5 grid grid-cols-2 rounded-full bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setModo('entrar');
                    setMensagem('');
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    modo === 'entrar' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModo('cadastro');
                    setMensagem('');
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    modo === 'cadastro' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  Cadastrar
                </button>
              </div>
            )}

            <form
              className="space-y-4"
              onSubmit={
                modalAcesso === 'admin'
                  ? entrarAdminPublico
                  : modo === 'entrar'
                    ? entrarCliente
                    : cadastrarCliente
              }
            >
              {modalAcesso === 'cliente' && modo === 'cadastro' && (
                <>
                  <input
                    type="text"
                    value={formulario.nome}
                    onChange={(event) => atualizarFormulario('nome', event.target.value)}
                    placeholder="Nome completo"
                    className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                  />
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition focus-within:border-slate-400 focus-within:ring-4 focus-within:ring-slate-100">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Telefone
                    </p>
                    <div className="grid grid-cols-[96px_1fr] gap-3 sm:grid-cols-[132px_1fr]">
                      <label className="min-w-0">
                        <span className="sr-only">DDD</span>
                        <select
                          value={formulario.ddd}
                          onChange={(event) => atualizarFormulario('ddd', event.target.value)}
                          className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 outline-none transition hover:bg-white focus:border-slate-400"
                        >
                          {dddsBrasil.map((grupo) => (
                            <optgroup key={grupo.uf} label={grupo.uf}>
                              {grupo.codigos.map((ddd) => (
                                <option key={ddd} value={ddd}>
                                  {ddd}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </label>

                      <label className="flex h-12 min-w-0 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition focus-within:border-slate-400">
                        <span className="flex h-full items-center border-r border-slate-200 px-3 text-sm font-bold text-slate-500">
                          +55
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={formatarTelefone(formulario.telefone)}
                          onChange={(event) =>
                            atualizarFormulario(
                              'telefone',
                              event.target.value.replace(/\D/g, '').slice(0, 9)
                            )
                          }
                          placeholder="99999-9999"
                          className="h-full min-w-0 flex-1 border-none bg-transparent px-3 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}

              <input
                type="email"
                value={formulario.email}
                onChange={(event) => atualizarFormulario('email', event.target.value)}
                placeholder={modalAcesso === 'admin' ? 'admin@travel.com' : 'Email'}
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                required
              />
              <input
                type="password"
                value={formulario.senha}
                onChange={(event) => atualizarFormulario('senha', event.target.value)}
                placeholder="Senha"
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-slate-400"
                required
              />

              {mensagem && (
                <p className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600">{mensagem}</p>
              )}

              <BotaoPrimario type="submit" className="w-full">
                {modalAcesso === 'admin' ? <ShieldCheck size={16} /> : modo === 'entrar' ? <Mail size={16} /> : <UserPlus size={16} />}
                {modalAcesso === 'admin'
                  ? 'Entrar no painel'
                  : modo === 'entrar'
                    ? 'Entrar'
                    : 'Criar conta'}
              </BotaoPrimario>
            </form>
          </section>
        </div>
      )}

      {propriedadeSelecionada && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-sm font-medium text-slate-400">Detalhes da propriedade</p>
                <h3 className="text-xl font-bold text-slate-900">{propriedadeSelecionada.titulo}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPropriedadeSelecionada(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
              <GaleriaFotosPropriedade
                propriedade={propriedadeSelecionada}
                alt={propriedadeSelecionada.titulo}
                className="h-72 lg:h-full"
              />

              <div className="space-y-5 p-5 lg:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={16} />
                      {propriedadeSelecionada.localizacao}
                    </p>
                    <p className="mt-3 text-3xl font-bold text-slate-900">
                      {propriedadeSelecionada.preco}
                    </p>
                  </div>
                  <SeloStatus status={propriedadeSelecionada.status} />
                </div>

                <p className="text-sm leading-6 text-slate-600">{propriedadeSelecionada.descricao}</p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <BedDouble size={18} />
                    <p className="mt-2 text-xs text-slate-500">Quartos</p>
                    <p className="font-bold text-slate-900">{propriedadeSelecionada.quartos}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <Users size={18} />
                    <p className="mt-2 text-xs text-slate-500">Hospedes</p>
                    <p className="font-bold text-slate-900">{propriedadeSelecionada.hospedes}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    <p className="mt-2 text-xs text-slate-500">Nota</p>
                    <p className="font-bold text-slate-900">{formatarNota(propriedadeSelecionada.nota)}</p>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CalendarDays size={16} />
                        Data de entrada
                      </span>
                      <input
                        type="date"
                        min={dataAtualInput()}
                        value={aluguelFormulario.dataInicio}
                        onChange={(event) =>
                          atualizarAluguelFormulario('dataInicio', event.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CalendarDays size={16} />
                        Data final
                      </span>
                      <input
                        type="date"
                        min={aluguelFormulario.dataInicio || dataAtualInput()}
                        value={aluguelFormulario.dataFim}
                        onChange={(event) =>
                          atualizarAluguelFormulario('dataFim', event.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400"
                      />
                    </label>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">Forma de pagamento</p>
                    <div className="grid grid-cols-2 gap-2">
                      {formasPagamento.map((forma) => {
                        const IconePagamento = forma.icone;
                        const selecionado = aluguelFormulario.pagamento === forma.valor;

                        return (
                          <button
                            key={forma.valor}
                            type="button"
                            onClick={() =>
                              atualizarAluguelFormulario('pagamento', forma.valor)
                            }
                            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${
                              selecionado
                                ? 'border-slate-950 bg-slate-950 text-white'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <IconePagamento size={17} />
                            {forma.rotulo}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {aluguelFormulario.pagamento === 'pix' && (
                    <div className="space-y-3 border-t border-slate-200 pt-4">
                      <div className="grid gap-3 sm:grid-cols-[132px_1fr]">
                        <div className="flex min-h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                          <div className="grid h-24 w-24 grid-cols-5 gap-1 rounded-xl bg-slate-950 p-2">
                            {Array.from({ length: 25 }).map((_, index) => (
                              <span
                                key={index}
                                className={`rounded-sm ${
                                  (index + codigoPix.length) % 3 === 0 ||
                                  index === 0 ||
                                  index === 4 ||
                                  index === 20 ||
                                  index === 24
                                    ? 'bg-white'
                                    : 'bg-slate-950'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3">
                          <p className="text-sm font-semibold text-slate-700">Pix copia e cola</p>
                          <textarea
                            readOnly
                            value={codigoPix}
                            className="mt-2 min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-600 outline-none"
                          />
                          <button
                            type="button"
                            onClick={copiarCodigoPix}
                            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            <Copy size={16} />
                            Copiar Pix
                          </button>
                        </div>
                      </div>

                      <label className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                        <input
                          type="checkbox"
                          checked={aluguelFormulario.pixConfirmado}
                          onChange={(event) =>
                            atualizarAluguelFormulario('pixConfirmado', event.target.checked)
                          }
                          className="mt-1 h-4 w-4 rounded border-emerald-300"
                        />
                        <span>Ja realizei o pagamento Pix e quero concluir o aluguel.</span>
                      </label>
                    </div>
                  )}

                  {aluguelFormulario.pagamento === 'cartao' && (
                    <div className="grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
                      <label className="block sm:col-span-2">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">
                          Nome impresso no cartao
                        </span>
                        <input
                          type="text"
                          value={aluguelFormulario.cartaoNome}
                          onChange={(event) =>
                            atualizarAluguelFormulario('cartaoNome', event.target.value)
                          }
                          placeholder="Nome completo"
                          autoComplete="cc-name"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400"
                        />
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">
                          Numero do cartao
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatarNumeroCartao(aluguelFormulario.cartaoNumero)}
                          onChange={(event) =>
                            atualizarAluguelFormulario(
                              'cartaoNumero',
                              event.target.value.replace(/\D/g, '').slice(0, 19)
                            )
                          }
                          placeholder="0000 0000 0000 0000"
                          autoComplete="cc-number"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">
                          Validade
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={formatarValidadeCartao(aluguelFormulario.cartaoValidade)}
                          onChange={(event) =>
                            atualizarAluguelFormulario(
                              'cartaoValidade',
                              formatarValidadeCartao(event.target.value)
                            )
                          }
                          placeholder="MM/AA"
                          autoComplete="cc-exp"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">CVV</span>
                        <input
                          type="password"
                          inputMode="numeric"
                          value={aluguelFormulario.cartaoCvv}
                          onChange={(event) =>
                            atualizarAluguelFormulario(
                              'cartaoCvv',
                              event.target.value.replace(/\D/g, '').slice(0, 4)
                            )
                          }
                          placeholder="123"
                          autoComplete="cc-csc"
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400"
                        />
                      </label>

                      <label className="block sm:col-span-2">
                        <span className="mb-2 block text-sm font-semibold text-slate-700">
                          Parcelamento
                        </span>
                        <select
                          value={aluguelFormulario.parcelas}
                          onChange={(event) =>
                            atualizarAluguelFormulario('parcelas', Number(event.target.value))
                          }
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-slate-400"
                        >
                          {opcoesParcelamento.map((parcelas) => {
                            const valorImovel = obterValorNumericoPreco(propriedadeSelecionada.preco);
                            const valorParcela = valorImovel
                              ? ` - ${formatarValorParcela(valorImovel / parcelas)} por parcela`
                              : '';

                            return (
                              <option key={parcelas} value={parcelas}>
                                {parcelas}x sem juros{valorParcela}
                              </option>
                            );
                          })}
                        </select>
                        {valorParcelaCartao && (
                          <p className="mt-2 text-sm font-medium text-slate-500">
                            Total {propriedadeSelecionada.preco} em {aluguelFormulario.parcelas}x de{' '}
                            {valorParcelaCartao}
                          </p>
                        )}
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setPropriedadeSelecionada(null)}
                    className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                  >
                    Voltar
                  </button>
                  <BotaoPrimario type="button" onClick={() => alugarPropriedade(propriedadeSelecionada)}>
                    <CheckCircle2 size={16} />
                    Alugar agora
                  </BotaoPrimario>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Cliente;
