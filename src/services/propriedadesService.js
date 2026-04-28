const API_URL = 'http://localhost:3001/propriedades';

export async function listarPropriedades() {
  const resposta = await fetch(API_URL);

  if (!resposta.ok) {
    throw new Error('Erro ao buscar propriedades.');
  }

  return resposta.json();
}

export async function buscarPropriedadePorId(id) {
  const resposta = await fetch(`${API_URL}/${id}`);

  if (!resposta.ok) {
    throw new Error('Imóvel não encontrado.');
  }

  return resposta.json();
}

export async function criarPropriedade(propriedade) {
  const resposta = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(propriedade),
  });

  if (!resposta.ok) {
    throw new Error('Erro ao cadastrar imóvel.');
  }

  return resposta.json();
}

export async function atualizarPropriedade(id, propriedade) {
  const resposta = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(propriedade),
  });

  if (!resposta.ok) {
    throw new Error('Erro ao atualizar imóvel.');
  }

  return resposta.json();
}