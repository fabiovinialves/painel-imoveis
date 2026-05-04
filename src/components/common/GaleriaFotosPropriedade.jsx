import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { imagemPadraoPropriedade, obterFotosPropriedade } from '../../utils/propriedades';

function GaleriaFotosPropriedade({
  propriedade,
  alt,
  className = 'h-56',
  imagemClassName = '',
  children,
}) {
  const fotos = useMemo(() => {
    const fotosPropriedade = obterFotosPropriedade(propriedade);
    return fotosPropriedade.length ? fotosPropriedade : [imagemPadraoPropriedade];
  }, [propriedade]);
  const [indiceFoto, setIndiceFoto] = useState(0);
  const temMultiplasFotos = fotos.length > 1;

  useEffect(() => {
    setIndiceFoto(0);
  }, [fotos]);

  function irParaFotoAnterior(event) {
    event.stopPropagation();
    setIndiceFoto((indiceAtual) => (indiceAtual === 0 ? fotos.length - 1 : indiceAtual - 1));
  }

  function irParaProximaFoto(event) {
    event.stopPropagation();
    setIndiceFoto((indiceAtual) => (indiceAtual + 1) % fotos.length);
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      <img
        src={fotos[indiceFoto]}
        alt={alt}
        className={`h-full w-full object-cover ${imagemClassName}`}
      />

      {children}

      {temMultiplasFotos && (
        <>
          <button
            type="button"
            onClick={irParaFotoAnterior}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow transition hover:bg-white"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={irParaProximaFoto}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow transition hover:bg-white"
            aria-label="Proxima foto"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {fotos.map((foto, index) => (
              <span
                key={`${foto}-${index}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === indiceFoto ? 'w-5 bg-white' : 'w-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default GaleriaFotosPropriedade;
