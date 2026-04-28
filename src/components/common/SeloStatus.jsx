function SeloStatus({ status }) {
  const estilos = {
    'Disponível': 'bg-emerald-50 text-emerald-600',
    Ativo: 'bg-emerald-50 text-emerald-600',
    Manutenção: 'bg-orange-50 text-orange-500',
    Reservado: 'bg-blue-50 text-blue-600',
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${estilos[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

export default SeloStatus;