export function formatarNota(nota) {
  const valor = Number(nota);

  if (Number.isNaN(valor)) {
    return '0,0';
  }

  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}
