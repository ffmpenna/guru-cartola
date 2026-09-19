import { useQuery } from '@tanstack/react-query';
import { useEscalacaoState } from '../hooks/useEscalacao';
import { fetchAtletasAoVivo } from '../services/api';
import type { Atleta } from '../types/Atleta';
import { useMercado } from '../hooks/useMercado';

export function PranchetaAoVivo() {
  const { time, reservas, capitao, patrimonioTotal } = useEscalacaoState();

  const { data: statusMercado = { status: 'fechado', isAberto: false } } = useMercado();
  const isMercadoAberto = statusMercado.isAberto;

  const nomesPosicoes: Record<number, string> = {
    1: 'Goleiro',
    2: 'Lateral',
    3: 'Zagueiro',
    4: 'Meia',
    5: 'Atacante',
    6: 'Técnico',
  };

  const { data: dadosAoVivo = {}, isLoading } = useQuery({
    queryKey: ['atletasAoVivo'],
    queryFn: fetchAtletasAoVivo,
    refetchInterval: isMercadoAberto ? false : 60000,
  });

  const defaultData = { pontuacao: 0, valorizacao: 0, scout: {} };

  const timeAtualizado = time.map((titular) => {
    const liveData = isMercadoAberto ? undefined : dadosAoVivo[String(titular.id)];
    const isCapitao = titular.id === capitao;

    return {
      titular,
      liveData: liveData || defaultData,
      isCapitao,
    };
  });

  const pontuacaoTotal = timeAtualizado.reduce((total, item) => {
    const pontos = item.liveData.pontuacao;
    return total + (item.isCapitao ? pontos * 1.5 : pontos);
  }, 0);

  const valorizacaoTotal = timeAtualizado.reduce(
    (total, item) => total + item.liveData.valorizacao,
    0,
  );
  const patrimonioParcial = patrimonioTotal + valorizacaoTotal;

  if (time.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <p className="font-semibold text-gray-500">Seu time está vazio.</p>
        <p className="text-sm text-gray-400">
          Abra o mercado para escalar seus jogadores antes de acompanhar a rodada.
        </p>
      </div>
    );
  }

  const renderCardJogador = (
    atleta: Atleta,
    liveData: { pontuacao: number; valorizacao: number; scout?: Record<string, number> },
    isCapitao: boolean,
  ) => {
    const pontosFinais = isCapitao ? liveData.pontuacao * 1.5 : liveData.pontuacao;
    const isValPositiva = liveData.valorizacao > 0;
    const isValNegativa = liveData.valorizacao < 0;
    const scoutsEntries = Object.entries(liveData.scout || {});

    return (
      <div className="relative flex flex-col p-4 transition-transform bg-white border border-gray-100 rounded-xl gap-4 shadow-sm hover:-translate-y-1">
        <div className="flex items-start justify-between w-full mt-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={atleta.foto || 'https://via.placeholder.com/150'}
                alt={atleta.apelido}
                className="object-cover w-16 h-16 bg-gray-100 border-2 border-gray-100 rounded-full"
              />
              {isCapitao && (
                <div className="absolute flex items-center justify-center w-8 h-8 text-xs font-black text-white bg-orange-500 border-2 border-white rounded-full shadow-sm -bottom-2 -right-2">
                  C
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-bold leading-tight text-gray-900">
                {atleta.apelido || atleta.nome}
              </h3>
              <span className="mt-0.5 text-xs font-bold tracking-widest text-gray-400 uppercase">
                {nomesPosicoes[atleta.posicao_id]}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end justify-center min-w-[90px] md:min-w-[120px]">
            {isCapitao && (
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[11px] md:text-sm font-bold text-gray-400 line-through decoration-gray-300">
                  {liveData.pontuacao.toFixed(2)}
                </span>
                <span className="px-1.5 py-0.5 md:px-2 md:py-1 text-[9px] md:text-[11px] font-black text-orange-600 bg-orange-100 border border-orange-200 rounded text-center leading-none tracking-wider">
                  x1.5
                </span>
              </div>
            )}
            <span
              className={`text-2xl md:text-4xl font-black leading-none tracking-tighter ${pontosFinais >= 0 ? 'text-emerald-500' : pontosFinais === 0 ? 'text-gray-900' : 'text-red-500'}`}
            >
              {pontosFinais.toFixed(2)}
            </span>
            <div
              className={`flex items-center gap-0.5 md:gap-1 mt-1.5 text-[11px] md:text-sm font-bold ${isValPositiva ? 'text-emerald-500' : isValNegativa ? 'text-red-500' : 'text-gray-400'}`}
            >
              <span>C$</span>
              <span>
                {isValPositiva ? '+' : ''}
                {liveData.valorizacao.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap w-full gap-2 pt-3 mt-1 border-t border-gray-100/50">
          {scoutsEntries.length > 0 ? (
            scoutsEntries.map(([sigla, valor]) => (
              <span
                key={sigla}
                className="px-2.5 py-1 text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-100 rounded-md"
              >
                {sigla}: {valor as React.ReactNode}
              </span>
            ))
          ) : (
            <span className="text-[11px] font-bold text-gray-400">
              {isMercadoAberto ? 'Rodada não iniciada.' : 'Sem ações registradas.'}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full gap-6 px-6 md:px-0 animate-fade-in">
      <div className="grid grid-cols-2 p-6 text-white bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-lg md:grid-cols-3 gap-4">
        <div className="flex flex-col">
          <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase">
            Pontuação
          </h2>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl md:text-4xl font-black">
              {pontuacaoTotal.toFixed(2)}
            </span>
            <span className="text-lg font-medium text-gray-400">pts</span>
          </div>
        </div>
        <div className="flex flex-col md:items-center">
          <h2 className="text-sm font-bold tracking-widest text-gray-400 uppercase">
            Patrimônio
          </h2>
          <div className="flex items-center flex-wrap gap-2 mt-1">
            <span className="text-xl md:text-2xl font-bold text-white">
              C$ {patrimonioParcial.toFixed(2)}
            </span>
            <span
              className={`flex items-center text-xs font-black px-1.5 py-0.5 rounded ${valorizacaoTotal > 0 ? 'bg-emerald-500/20 text-emerald-400' : valorizacaoTotal < 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-600/50 text-gray-300'}`}
            >
              {valorizacaoTotal > 0 ? '↗' : valorizacaoTotal < 0 ? '↘' : '–'}{' '}
              {Math.abs(valorizacaoTotal).toFixed(2)}
            </span>
          </div>
        </div>
        <div className="col-span-2 text-right md:col-span-1 md:flex md:flex-col md:items-end md:justify-center">
          <div className="flex items-center justify-end gap-2 mt-1">
            <span
              className={`flex w-3 h-3 rounded-full ${isMercadoAberto ? 'bg-gray-400' : isLoading ? 'bg-orange-500 animate-spin' : 'bg-emerald-500 animate-pulse'}`}
            ></span>
            <span
              className={`text-sm font-bold ${isMercadoAberto ? 'text-gray-400' : isLoading ? 'text-orange-400' : 'text-emerald-400'}`}
            >
              {isMercadoAberto
                ? 'Aguardando Início'
                : isLoading
                  ? 'Atualizando...'
                  : 'Ao Vivo'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {timeAtualizado.map((item) => (
          <div key={item.titular.id}>
            {renderCardJogador(item.titular, item.liveData, item.isCapitao)}
          </div>
        ))}
      </div>

      {reservas.length > 0 && (
        <div className="flex flex-col gap-3 pt-6 mt-2 border-t border-gray-200 border-dashed animate-fade-in">
          <h3 className="text-[10px] font-black tracking-widest text-gray-400 uppercase ml-1">
            Banco de Reservas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reservas.map((reserva) => {
              const liveData = isMercadoAberto
                ? undefined
                : dadosAoVivo[String(reserva.id)];
              const safeLiveData = liveData || {
                pontuacao: 0,
                valorizacao: 0,
                scout: {},
              };
              const isValPositiva = safeLiveData.valorizacao > 0;
              const isValNegativa = safeLiveData.valorizacao < 0;

              return (
                <div
                  key={reserva.id}
                  className="flex items-center justify-between p-3 bg-gray-100/50 border border-gray-200 rounded-xl opacity-80 grayscale-[20%] transition-opacity hover:opacity-100 hover:grayscale-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={reserva.foto || 'https://via.placeholder.com/150'}
                        alt={reserva.apelido}
                        className="w-10 h-10 bg-white border border-gray-200 rounded-full object-cover shrink-0"
                      />
                      <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-4 h-4 bg-gray-500 border border-white rounded-[4px] text-white text-[8px] font-black shadow-sm">
                        R
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-700 truncate max-w-[100px]">
                        {reserva.apelido || reserva.nome}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        {nomesPosicoes[reserva.posicao_id]}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end min-w-[70px]">
                    <span
                      className={`text-base font-black leading-none ${safeLiveData.pontuacao > 0 ? 'text-emerald-600/70' : safeLiveData.pontuacao < 0 ? 'text-red-600/70' : 'text-gray-400'}`}
                    >
                      {safeLiveData.pontuacao.toFixed(2)}
                    </span>
                    <div
                      className={`flex items-center gap-0.5 mt-0.5 text-[10px] font-bold ${isValPositiva ? 'text-emerald-600/70' : isValNegativa ? 'text-red-600/70' : 'text-gray-400'}`}
                    >
                      <span>
                        C$ {isValPositiva ? '+' : ''}
                        {safeLiveData.valorizacao.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
