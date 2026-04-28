import { useState } from "react";
import { X } from "lucide-react";
import BotaoPrimario from "../common/BotaoPrimario";

const imagemPadrao =
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80";

function FormularioPropriedade({
  aberto,
  aoFechar,
  aoSalvar,
  propriedadeEditando,
}) {
  const [imagemPreview, setImagemPreview] = useState(
    propriedadeEditando?.imagem || ""
  );

  if (!aberto) return null;

  const ehEdicao = Boolean(propriedadeEditando);

  function converterImagemParaBase64(arquivo) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(arquivo);
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const arquivoImagem = formData.get("imagem");

    let imagemFinal = propriedadeEditando?.imagem || imagemPadrao;

    if (arquivoImagem && arquivoImagem.size > 0) {
      imagemFinal = await converterImagemParaBase64(arquivoImagem);
    }

    const novaPropriedade = {
      ...(propriedadeEditando?.id ? { id: propriedadeEditando.id } : {}),
      titulo: formData.get("titulo"),
      localizacao: formData.get("localizacao"),
      preco: formData.get("preco"),
      status: formData.get("status"),
      tipo: formData.get("tipo"),
      quartos: Number(formData.get("quartos")),
      hospedes: Number(formData.get("hospedes")),
      nota: propriedadeEditando?.nota ?? 0,
      descricao: formData.get("descricao"),
      imagem: imagemFinal,
      categorias: [
        formData.get("tipo").toLowerCase(),
        `${formData.get("quartos")} quartos`,
      ],
    };

    aoSalvar(novaPropriedade);
  }

  async function handleImagemChange(event) {
    const arquivo = event.target.files[0];

    if (!arquivo) return;

    const imagemBase64 = await converterImagemParaBase64(arquivo);
    setImagemPreview(imagemBase64);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {ehEdicao ? "Editar imóvel" : "Adicionar imóvel"}
            </h2>
            <p className="text-sm text-slate-500">
              Preencha as informações da propriedade.
            </p>
          </div>

          <button
            type="button"
            onClick={aoFechar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Título
              </label>
              <input
                name="titulo"
                required
                defaultValue={propriedadeEditando?.titulo || ""}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                placeholder="Ex: Apartamento Centro Prime"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Localização
              </label>
              <input
                name="localizacao"
                required
                defaultValue={propriedadeEditando?.localizacao || ""}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                placeholder="Ex: Brasília, DF"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Preço
              </label>
              <input
                name="preco"
                required
                defaultValue={propriedadeEditando?.preco || ""}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
                placeholder="Ex: $312.00"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Foto do imóvel
              </label>
              <input
                name="imagem"
                type="file"
                accept="image/*"
                onChange={handleImagemChange}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Tipo
              </label>
              <select
                name="tipo"
                defaultValue={propriedadeEditando?.tipo || "Apartamento"}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              >
                <option value="Apartamento">Apartamento</option>
                <option value="Villa">Villa</option>
                <option value="Hotel">Hotel</option>
                <option value="Resort">Resort</option>
                <option value="Casa">Casa</option>
                <option value="Cabana">Cabana</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                name="status"
                defaultValue={propriedadeEditando?.status || "Disponível"}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              >
                <option value="Disponível">Disponível</option>
                <option value="Ativo">Ativo</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Reservado">Reservado</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Quartos
              </label>
              <input
                name="quartos"
                type="number"
                min="1"
                required
                defaultValue={propriedadeEditando?.quartos || 1}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Hóspedes
              </label>
              <input
                name="hospedes"
                type="number"
                min="1"
                required
                defaultValue={propriedadeEditando?.hospedes || 1}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              />
            </div>

            {imagemPreview && (
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Pré-visualização
                </label>
                <img
                  src={imagemPreview}
                  alt="Pré-visualização do imóvel"
                  className="h-32 w-full rounded-2xl object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Descrição
            </label>
            <textarea
              name="descricao"
              rows="4"
              required
              defaultValue={propriedadeEditando?.descricao || ""}
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-900"
              placeholder="Descreva o imóvel..."
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={aoFechar}
              className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Cancelar
            </button>

            <BotaoPrimario type="submit">
              {ehEdicao ? "Salvar alterações" : "Cadastrar imóvel"}
            </BotaoPrimario>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormularioPropriedade;
