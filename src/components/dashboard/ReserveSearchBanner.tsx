import { useEscalacaoDispatch, useEscalacaoState } from '../../hooks/useEscalacao';

const nomesPosicoes: Record<number, string> = {
  1: 'Goleiros',
  2: 'Laterais',
  3: 'Zagueiros',
  4: 'Meias',
  5: 'Atacantes',
  6: 'Técnicos',
};

export function ReserveSearchBanner() {
  const { modoBuscaReserva } = useEscalacaoState();
  const { setModoBuscaReserva, getPrecoMaximoReserva } = useEscalacaoDispatch();

  if (modoBuscaReserva === null) return null;

  const precoMaximoReserva = getPrecoMaximoReserva(modoBuscaReserva);

  return (
    <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-xl shadow-sm">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-extrabold text-orange-900 uppercase tracking-tight">
          Buscando Reserva: {nomesPosicoes[modoBuscaReserva]}
        </span>
        <span className="text-xs font-bold text-orange-600">
          Preço Máximo: C$ {precoMaximoReserva.toFixed(2)}
        </span>
      </div>
      <button
        onClick={() => setModoBuscaReserva(null)}
        className="px-4 py-2 bg-white border border-orange-200 rounded-lg text-xs font-bold text-orange-600 shadow-sm active:scale-95 transition-all hover:bg-orange-100"
      >
        Cancelar
      </button>
    </div>
  );
}
