import type { Atleta } from '../../types/Atleta';

interface LineupSlotProps {
  posicao_id: number;
  nomePosicao: string;
  atleta: Atleta | null;
  isReserva?: boolean;
  isBuscandoEstaPosicao?: boolean;
  podeAdicionarReserva?: boolean;
  capitaoId?: number | null;
  onSetCapitao?: (id: number | null) => void;
  onRemoveJogador?: (atleta: Atleta) => void;
  onClickEmptyReserva?: (posicaoId: number) => void;
}

export function LineupSlot({
  posicao_id,
  nomePosicao,
  atleta,
  isReserva = false,
  isBuscandoEstaPosicao = false,
  podeAdicionarReserva = false,
  capitaoId,
  onSetCapitao,
  onRemoveJogador,
  onClickEmptyReserva,
}: LineupSlotProps) {
  if (atleta) {
    const nomeFormatado = (() => {
      const partes = atleta.nome.trim().split(' ');
      if (partes.length > 1) return `${partes[0][0]}. ${partes[partes.length - 1]}`;
      return atleta.nome;
    })();

    return (
      <div
        className={`flex items-center justify-between p-2 transition-all shadow-sm rounded-xl group ${isReserva ? 'bg-gray-50 border border-gray-200' : 'bg-white border border-gray-100 hover:border-gray-300'}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={
              atleta.foto ||
              'https://s3.glbimg.com/v1/AUTH_58d78b787ec34892b5aaa0c7a146155f/clubes_2026/silhuetas/DEFAULT/140x140.png'
            }
            alt={atleta.nome}
            className={`object-cover shrink-0 ${isReserva ? 'w-7 h-7 bg-white border border-gray-200 rounded-full' : 'w-8 h-8 bg-gray-100 rounded-full'}`}
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-gray-900 leading-tight truncate max-w-[70px] md:max-w-[90px]">
              {nomeFormatado}
            </span>
            <span className="text-[9px] font-semibold text-gray-400 uppercase truncate">
              {nomePosicao}
            </span>
            <span className="text-[12px] font-extrabold text-orange-400">
              C${atleta.preco.toFixed(1)}
            </span>
          </div>
        </div>

        <div
          className={`flex items-center shrink-0 pl-1 ${isReserva ? 'gap-3' : 'gap-1.5'}`}
        >
          {isReserva ? (
            <span className="flex items-center justify-center w-6 h-6 text-white font-bold transition-colors bg-gray-400/80 rounded">
              R
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onSetCapitao)
                  onSetCapitao(capitaoId === atleta.id ? null : atleta.id);
              }}
              title={capitaoId === atleta.id ? 'Remover Capitão' : 'Definir Capitão'}
              className={`flex items-center justify-center w-6 h-6 rounded font-black text-[10px] transition-all cursor-pointer shadow-sm active:scale-90 ${capitaoId === atleta.id ? 'bg-orange-500 text-white border-orange-600' : 'bg-gray-100 text-gray-400 border border-transparent md:opacity-0 md:group-hover:opacity-100 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-200'}`}
            >
              C
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onRemoveJogador) onRemoveJogador(atleta);
            }}
            className="flex items-center justify-center w-6 h-6 text-gray-400 transition-colors border border-gray-200 rounded cursor-pointer md:opacity-0 md:group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 hover:border-red-200 focus:outline-none active:scale-90 bg-gray-50"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Slot Vazio do Reserva
  if (isReserva) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (podeAdicionarReserva && onClickEmptyReserva) {
            onClickEmptyReserva(posicao_id);
          }
        }}
        disabled={!podeAdicionarReserva}
        className={`flex items-center gap-2.5 p-2 border-2 border-dashed rounded-xl transition-all w-full text-left
          ${
            isBuscandoEstaPosicao
              ? 'border-orange-400 bg-orange-50/50 opacity-100 shadow-inner'
              : podeAdicionarReserva
                ? 'border-gray-200 bg-gray-50/50 hover:bg-orange-50 hover:border-orange-200 opacity-100 cursor-pointer'
                : 'border-gray-200 bg-gray-50/30 opacity-50 cursor-not-allowed'
          }`}
      >
        <div
          className={`flex items-center justify-center w-7 h-7 rounded-full shrink-0 transition-colors ${isBuscandoEstaPosicao || podeAdicionarReserva ? 'bg-orange-100 text-orange-500' : 'bg-gray-200/50 text-gray-400'}`}
        >
          <span className="text-[12px] font-black leading-none pb-[1px]">
            {podeAdicionarReserva ? '+' : '?'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide truncate">
            {podeAdicionarReserva ? nomePosicao : nomePosicao}
          </span>
        </div>
      </button>
    );
  }

  // Slot Vazio do Titular
  return (
    <div className="flex items-center gap-2.5 p-2 border border-dashed border-gray-200 bg-gray-50/50 rounded-xl opacity-70">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200/50 shrink-0">
        <span className="text-xs font-bold text-gray-400">?</span>
      </div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide truncate">
        {nomePosicao}
      </span>
    </div>
  );
}
