function CardMetrica({ titulo, valor, descricao, icone: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{titulo}</p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900">{valor}</h3>
          <p className="mt-1 text-xs text-slate-400">{descricao}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default CardMetrica;