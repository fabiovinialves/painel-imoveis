function BotaoPrimario({ children, className = '', ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default BotaoPrimario;