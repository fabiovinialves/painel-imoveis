import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hotel, Lock, Mail } from 'lucide-react';
import BotaoPrimario from '../components/common/BotaoPrimario';

function LoginAdmin({ aoEntrarAdmin, aoEntrarCliente }) {
  const navigate = useNavigate();
  const [tipoAcesso, setTipoAcesso] = useState('cliente');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  function entrar(event) {
    event.preventDefault();
    const resultado =
      tipoAcesso === 'admin'
        ? aoEntrarAdmin(email, senha)
        : aoEntrarCliente(email, senha);

    if (!resultado) {
      setMensagem(
        tipoAcesso === 'admin'
          ? 'Email ou senha invalidos para administrador.'
          : 'Email ou senha invalidos para cliente.'
      );
      return;
    }

    if (tipoAcesso === 'cliente') {
      navigate('/cliente');
      return;
    }

    navigate('/admin');
  }

  function trocarTipoAcesso(tipo) {
    setTipoAcesso(tipo);
    setEmail('');
    setSenha('');
    setMensagem('');
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-45"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80')",
        }}
      />

      <form
        onSubmit={entrar}
        className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Hotel size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Acesso StayHub</p>
            <h1 className="text-2xl font-extrabold text-blue-700">StayHub</h1>
          </div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => trocarTipoAcesso('cliente')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              tipoAcesso === 'cliente'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Cliente
          </button>
          <button
            type="button"
            onClick={() => trocarTipoAcesso('admin')}
            className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
              tipoAcesso === 'admin'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Administrador
          </button>
        </div>

        <div className="space-y-4">
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
              placeholder={tipoAcesso === 'admin' ? 'admin@travel.com' : 'seu@email.com'}
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Lock size={16} />
              Senha
            </span>
            <input
              type="password"
              value={senha}
              onChange={(event) => {
                setSenha(event.target.value);
                setMensagem('');
              }}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-900"
              placeholder="Digite a senha"
              required
            />
          </label>
        </div>

        {mensagem && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {mensagem}
          </p>
        )}

        <BotaoPrimario type="submit" className="mt-6 w-full">
          {tipoAcesso === 'admin' ? 'Entrar no painel' : 'Entrar como cliente'}
        </BotaoPrimario>

        {tipoAcesso === 'cliente' && (
          <button
            type="button"
            onClick={() => navigate('/cliente')}
            className="mt-3 w-full rounded-full px-4 py-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Criar conta de cliente
          </button>
        )}
      </form>
    </main>
  );
}

export default LoginAdmin;
