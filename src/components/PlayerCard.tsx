import type { Atleta } from '../types/Atleta';
import { useEscalacaoState, useEscalacaoDispatch } from '../hooks/useEscalacao';

interface PlayerCardProps {
  atleta: Atleta;
  tipoOrdenacao: 've' | 'margem' | 'pe';
  index?: number;
}

export function PlayerCard({ atleta, tipoOrdenacao, index = 0 }: PlayerCardProps) {
  const { time, reservas, cartoletas } = useEscalacaoState();
  const {
    adicionarJogador,
    removerJogador,
    adicionarReserva,
    removerReserva,
    isEscalado,
    isReserva,
    isPosicaoCheia,
  } = useEscalacaoDispatch();

  const formatarNumero = (num: number) => Number(num).toFixed(2);

  let heroLabel: string;
  let heroValue: string;

  if (tipoOrdenacao === 've') {
    heroLabel = 'Val. Esperada';
    heroValue = `C$ ${formatarNumero(atleta.valorizacaoEsperada)}`;
  } else if (tipoOrdenacao === 'pe') {
    heroLabel = 'Pont. Esperada';
    heroValue = `${formatarNumero(atleta.pontuacaoEsperada)} pts`;
  } else {
    heroLabel = 'Margem de Seg.';
    heroValue = `${formatarNumero(atleta.margem)} pts`;
  }

  const isCasa = atleta.local === 'Casa';
  const delay = index < 6 ? `${index * 0.05}s` : '0s';

  const escaladoTitular = isEscalado(atleta.id);
  const escaladoReserva = isReserva(atleta.id);

  const isPosicaoLotada = isPosicaoCheia(atleta.posicao_id);
  const isSemSaldoTitular = cartoletas < atleta.preco;
  const botaoTitularBloqueado =
    !escaladoTitular && (isPosicaoLotada || isSemSaldoTitular);

  const titularesDaPosicao = time.filter((j) => j.posicao_id === atleta.posicao_id);
  const temTitularNestaPosicao = titularesDaPosicao.length > 0;
  const jaTemReservaNestaPosicao = reservas.some(
    (r) => r.posicao_id === atleta.posicao_id,
  );

  const precoTitularMaisBarato = temTitularNestaPosicao
    ? Math.min(...titularesDaPosicao.map((j) => j.preco))
    : 0;

  const isMaisCaroQueTitular = atleta.preco > precoTitularMaisBarato;

  const botaoReservaBloqueado =
    !temTitularNestaPosicao || jaTemReservaNestaPosicao || isMaisCaroQueTitular;

  const getTextoBotaoTitular = () => {
    if (escaladoTitular) return 'Remover';
    if (isSemSaldoTitular) return 'Sem Saldo';
    if (isPosicaoLotada) return 'Cheio';
    return 'Escalar';
  };

  const borderColor = escaladoTitular
    ? 'border-orange-500'
    : escaladoReserva
      ? 'border-gray-400'
      : 'border-black/5';
  const bgColor = escaladoTitular
    ? 'bg-orange-50/20'
    : escaladoReserva
      ? 'bg-gray-50/50'
      : 'bg-white';

  return (
    <article
      className={`flex-none w-[calc(85vw-48px)] max-w-[310px] snap-start rounded-[20px] p-5 shadow-sm border-5 flex flex-col justify-between gap-4 animate-fade-slide-up transition-colors duration-200 ${borderColor} ${bgColor}`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-center gap-3.5">
        <img
          src={
            atleta.foto ||
            'https://s3.glbimg.com/v1/AUTH_58d78b787ec34892b5aaa0c7a146155f/clubes_2026/silhuetas/VAS/FORMATO.png'
          }
          className="object-cover w-14 h-14 bg-gray-100 rounded-full shrink-0"
          alt={atleta.nome}
          loading="lazy"
        />
        <div className="flex flex-col items-start w-full gap-1">
          <h3 className="m-0 text-base font-bold leading-tight text-gray-900">
            {atleta.nome}
          </h3>
          <div className="flex flex-col items-start mt-1 gap-1.5">
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[9px] font-bold uppercase rounded-md tracking-[0.02em]">
              {atleta.clubeMandante} x {atleta.clubeVisitante}
            </span>
            <span
              className={`px-2 py-1 text-[9px] font-extrabold uppercase rounded-md tracking-[0.05em] ${isCasa ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}
            >
              {atleta.local}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 py-4 border-y border-dashed border-gray-100">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold text-gray-400">Preço</span>
          <span
            className={`text-sm font-bold ${isSemSaldoTitular && !escaladoTitular && !escaladoReserva ? 'text-red-500' : 'text-gray-900'}`}
          >
            C$ {formatarNumero(atleta.preco)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold text-gray-400">Média</span>
          <span className="text-sm font-bold text-gray-900">
            {formatarNumero(atleta.media)}
          </span>
          <span className="mt-[1px] text-[9px] font-semibold text-gray-400">
            {atleta.jogos10} jogo(s)
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold text-gray-400">Mínimo</span>
          <span className="text-sm font-bold text-gray-900">
            {formatarNumero(atleta.minimo)}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold text-gray-400">Pts Esper.</span>
          <span className="text-sm font-bold text-gray-900">
            {formatarNumero(atleta.pontuacaoEsperada)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1 mt-auto gap-2">
        <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
          <span className="text-lg md:text-xl font-extrabold leading-none tracking-tight text-orange-500 truncate w-full">
            {heroValue}
          </span>
          <span className="text-[9px] md:text-[10px] font-bold text-orange-500/60 uppercase tracking-widest truncate w-full">
            {heroLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!escaladoTitular &&
            (escaladoReserva ? (
              <button
                onClick={() => removerReserva(atleta)}
                className="px-3.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 h-10 shrink-0 bg-gray-700 text-white shadow-md hover:bg-gray-600 active:scale-95 cursor-pointer"
              >
                <>
                  <svg
                    width="14"
                    height="14"
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
                  Reserva
                </>
              </button>
            ) : (
              <button
                onClick={() => adicionarReserva(atleta)}
                disabled={botaoReservaBloqueado}
                title={
                  botaoReservaBloqueado ? 'Reserva Indisponível' : 'Adicionar ao Banco'
                }
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all shadow-sm active:scale-95 shrink-0 cursor-pointer ${
                  botaoReservaBloqueado
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                    : 'bg-white border-2 border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50'
                }`}
              >
                <span className="text-sm font-black">R</span>
              </button>
            ))}

          {!escaladoReserva && (
            <button
              onClick={() =>
                escaladoTitular ? removerJogador(atleta) : adicionarJogador(atleta)
              }
              disabled={botaoTitularBloqueado}
              className={`px-3.5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-1.5 h-10 shrink-0
                ${
                  escaladoTitular
                    ? 'bg-red-500 text-white shadow-md hover:bg-red-600 active:scale-95 cursor-pointer'
                    : botaoTitularBloqueado
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-70'
                      : 'bg-orange-500 text-white shadow-md hover:bg-orange-600 active:scale-95 cursor-pointer'
                }`}
            >
              {escaladoTitular ? (
                <>
                  <svg
                    width="14"
                    height="14"
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
                  Remover
                </>
              ) : (
                <>{getTextoBotaoTitular()}</>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
