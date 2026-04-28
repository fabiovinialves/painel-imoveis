import CardPropriedade from './CardPropriedade';

function GradePropriedades({ propriedades, aoEditar }) {
  if (!propriedades.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
        Nenhum imóvel encontrado com os filtros selecionados.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {propriedades.map((propriedade) => (
        <CardPropriedade
          key={propriedade.id}
          propriedade={propriedade}
          aoEditar={aoEditar}
        />
      ))}
    </div>
  );
}

export default GradePropriedades;