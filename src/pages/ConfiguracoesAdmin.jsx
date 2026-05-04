import { useState } from 'react';
import { Lock, Mail, Save, UserRound } from 'lucide-react';
import BotaoPrimario from '../components/common/BotaoPrimario';

function ConfiguracoesAdmin({ administrador, aoSalvar }) {
  const [nome, setNome] = useState(administrador.nome || '');
  const [email, setEmail] = useState(administrador.email || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipoMensagem, setTipoMensagem] = useState('sucesso');

  function salvar(event) {
    event.preventDefault();
    const nomeTratado = nome.trim();
    const emailTratado = email.trim().toLowerCase();

    if (!nomeTratado || !emailTratado) {
      setTipoMensagem('erro');
      setMensagem('Preencha nome e email.');
      return;
    }

    if (senhaAtual !== administrador.senha) {
      setTipoMensagem('erro');
      setMensagem('Informe a senha atual para salvar as alteracoes.');
      return;
    }

    if (novaSenha || confirmarSenha) {
      if (novaSenha.length < 6) {
        setTipoMensagem('erro');
        setMensagem('A nova senha deve ter pelo menos 6 caracteres.');
        return;
      }

      if (novaSenha !== confirmarSenha) {
        setTipoMensagem('erro');
        setMensagem('A confirmacao da senha nao confere.');
        return;
      }
    }

    aoSalvar({
      nome: nomeTratado,
      email: emailTratado,
      senha: novaSenha || administrador.senha,
    });
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarSenha('');
    setTipoMensagem('sucesso');
    setMensagem('Configuracoes salvas com sucesso.');
  }

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-400">Painel / Configuracoes</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Configuracoes do administrador
        </h2>
      </div>

      <form
        onSubmit={salvar}
        className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <UserRound size={16} />
              Nome
            </span>
            <input
              value={nome}
              onChange={(event) => {
                setNome(event.target.value);
                setMensagem('');
              }}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-900"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Mail size={16} />
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMensagem('');
              }}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-900"
              required
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Lock size={16} />
              Senha atual
            </span>
            <input
              type="password"
              value={senhaAtual}
              onChange={(event) => {
                setSenhaAtual(event.target.value);
                setMensagem('');
              }}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-900"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Lock size={16} />
              Nova senha
            </span>
            <input
              type="password"
              value={novaSenha}
              onChange={(event) => {
                setNovaSenha(event.target.value);
                setMensagem('');
              }}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-900"
              placeholder="Opcional"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Lock size={16} />
              Confirmar nova senha
            </span>
            <input
              type="password"
              value={confirmarSenha}
              onChange={(event) => {
                setConfirmarSenha(event.target.value);
                setMensagem('');
              }}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-900"
              placeholder="Opcional"
            />
          </label>
        </div>

        {mensagem && (
          <p
            className={`mt-4 rounded-2xl px-4 py-3 text-sm font-medium ${
              tipoMensagem === 'erro'
                ? 'bg-red-50 text-red-600'
                : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            {mensagem}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <BotaoPrimario type="submit">
            <Save size={16} />
            Salvar configuracoes
          </BotaoPrimario>
        </div>
      </form>
    </section>
  );
}

export default ConfiguracoesAdmin;
