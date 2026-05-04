export const imagemPadraoPropriedade =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80';

export function obterFotosPropriedade(propriedade) {
  const fotos = [];

  if (Array.isArray(propriedade?.imagens)) {
    fotos.push(...propriedade.imagens.filter(Boolean));
  }

  if (propriedade?.imagem) {
    fotos.unshift(propriedade.imagem);
  }

  return Array.from(new Set(fotos)).filter(Boolean);
}

export function obterFotoPrincipalPropriedade(propriedade) {
  return obterFotosPropriedade(propriedade)[0] || imagemPadraoPropriedade;
}
