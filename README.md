# Painel de Imóveis

Sistema web para gerenciamento e aluguel de imóveis, com área administrativa e area do cliente. O projeto permite cadastrar propriedades, acompanhar status dos imóveis, criar clientes, realizar alugueis, escolher datas, selecionar pagamento por Pix ou cartão de crédito, parcelar no cartão e avaliar propriedades alugadas.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)
![React Router DOM](https://img.shields.io/badge/React_Router_DOM-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)
![Lucide React](https://img.shields.io/badge/Lucide_React-111827?style=for-the-badge&logo=lucide&logoColor=white)
![JSON Server](https://img.shields.io/badge/JSON_Server-323330?style=for-the-badge&logo=json&logoColor=white)

<img width="1907" height="942" alt="Captura de tela 2026-05-04 100541" src="https://github.com/user-attachments/assets/daa8a3f3-c852-40e8-9da9-35afd91331db" />


## Funcionalidades

- Dashboard administrativo com indicadores dos imóveis.
- Listagem, cadastro e edição de propriedades.
- Filtros por busca, status e tipo de imóvel.
- Area do cliente com cadastro e login.
- Aluguel de propriedades com data de entrada e data final.
- Pagamento por Pix com codigo copia e cola e confirmação.
- Pagamento por cartão com validação de numero, validade, CVV e parcelamento.
- Exclusão de aluguel pelo cliente, liberando o imóvel novamente.
- Avaliação de propriedades alugadas.
- Exclusão da propria avaliação pelo cliente.
- Lista de usuarios com reservas ativas vinculadas.
- Persistência local de clientes, alugueis e avaliações via `localStorage`.
- Persistência de propriedades via `json-server`.

## Tecnologias

- React
- Vite
- React Router DOM
- Tailwind CSS
- Lucide React
- JSON Server

## Como Rodar

### 1. Clonar o repositorio

```bash
git clone https://github.com/fabiovinialves/painel-imoveis.git
cd painel-imoveis
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Iniciar a API local

Em um terminal, rode:

```bash
npm run server
```

A API local ficara disponível em:

```text
http://localhost:3001
```

### 4. Iniciar o projeto

Em outro terminal, rode:

```bash
npm run dev
```

O app ficara disponivel em:

```text
http://localhost:5173
```

## Rotas

- `/` - Dashboard administrativo.
- `/propriedades` - Listagem e gerenciamento de propriedades.
- `/usuarios` - Lista de usuarios e reservas ativas.
- `/avaliacoes` - Avaliações cadastradas.
- `/cliente` - Area do cliente para cadastro, login, aluguel e avaliação.

## Scripts

```bash
npm run dev
```

Inicia o servidor de desenvolvimento do Vite.

```bash
npm run server
```

Inicia o JSON Server usando o arquivo `db.json` na porta `3001`.

```bash
npm run build
```

Gera a versão de produção na pasta `dist`.

```bash
npm run preview
```

Executa uma previa local da build de produção.

## Estrutura Principal

```text
src/
  components/
    common/
    layout/
    properties/
  data/
  pages/
  services/
db.json
```

## Observacoes

- O pagamento por Pix e cartao é uma simulacao para fluxo de estudo e demonstracão.
- O app não salva numero completo do cartão nem CVV no `localStorage`; salva apenas o final do cartão.
- Para pagamentos reais, seria necessário integrar um provedor como Mercado Pago, Stripe, Asaas ou Efi/Gerencianet.
- Clientes, alugueis e avaliações ficam no navegador via `localStorage`.
- Propriedades ficam no `db.json`, servido pelo `json-server`.

## Build

Para gerar a build final:

```bash
npm run build
```

Depois, os arquivos de produção estarão na pasta:

```text
dist/
```
