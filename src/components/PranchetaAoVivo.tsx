// src/components/PranchetaAoVivo.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEscalacaoState } from '../hooks/useEscalacao';
import { fetchAtletasAoVivo } from '../services/api';
import type { Atleta, Scout } from '../types/Atleta';
import { useMercado } from '../hooks/useMercado';

// ==========================================
// 1. CONSTANTES (Fora do ciclo de renderização)
// ==========================================
const nomesPosicoes: Record<number, string> = {
  1: 'Goleiro',
  2: 'Lateral',
  3: 'Zagueiro',
  4: 'Meia',
  5: 'Atacante',
  6: 'Técnico',
};

const pontuacaoScouts: Record<keyof Scout, number> = {
  G: 8.0,
  A: 5.0,
  FT: 3.0,
  FD: 1.2,
  FF: 0.8,
  FS: 0.5,
  PS: 1.0,
  PP: -4.0,
  I: -0.1,
  DP: 7.0,
  SG: 5.0,
  DE: 1.0,
  DS: 1.2,
  GC: -3.0,
  CV: -3.0,
  CA: -1.0,
  GS: -1.0,
  FC: -0.3,
  PC: -1.0,
};

const nomesScouts: Record<keyof Scout, string> = {
  G: 'Gol',
  A: 'Assistência',
  FT: 'Finalização na trave',
  FD: 'Finalização defendida',
  FF: 'Finalização para fora',
  FS: 'Falta sofrida',
  PS: 'Pênalti sofrido',
  PP: 'Pênalti perdido',
  I: 'Impedimento',
  DP: 'Defesa de pênalti',
  SG: 'Jogo sem sofrer gol',
  DE: 'Defesa (goleiro)',
  DS: 'Desarme',
  GC: 'Gol contra',
  CV: 'Cartão vermelho',
  CA: 'Cartão amarelo',
  GS: 'Gol sofrido',
  FC: 'Falta cometida',
  PC: 'Pênalti cometido',
};

// 👇 NOVO: Dicionário mapeando os plurais
const nomesScoutsPlural: Record<keyof Scout, string> = {
  G: 'Gols',
  A: 'Assistências',
  FT: 'Finalizações na trave',
  FD: 'Finalizações defendidas',
  FF: 'Finalizações para fora',
  FS: 'Faltas sofridas',
  PS: 'Pênaltis sofridos',
  PP: 'Pênaltis perdidos',
  I: 'Impedimentos',
  DP: 'Defesas de pênalti',
  SG: 'Jogos sem sofrer gol',
  DE: 'Defesas (goleiro)',
  DS: 'Desarmes',
  GC: 'Gols contra',
  CV: 'Cartões vermelhos',
  CA: 'Cartões amarelos',
  GS: 'Gols sofridos',
  FC: 'Faltas cometidas',
  PC: 'Pênaltis cometidos',
};

const DEFAULT_LIVE_DATA = { pontuacao: 0, valorizacao: 0, scout: {} };

// ==========================================
// 2. SUB-COMPONENTES
// ==========================================

// 2.1 - Header de Pontuação (Placar)
function PlacarAoVivo({
  pontuacaoTotal,
  patrimonioParcial,
  valorizacaoTotal,
  isMercadoAberto,
  isLoading,
}: any) {
  return (
    <div className="grid grid-cols-2 p-6 text-white bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-lg md:grid-cols-3 gap-4">
      <div className="flex flex-col">
        <h2 className="text-sm font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">
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
        <h2 className="text-sm font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">
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
  );
}

// 2.2 - Card do Jogador (Isolado)
function CardJogadorAoVivo({
  atleta,
  liveData,
  isCapitao,
  isExpanded,
  onToggle,
  isMercadoAberto,
}: any) {
  const pontosFinais = isCapitao ? liveData.pontuacao * 1.5 : liveData.pontuacao;
  const isValPositiva = liveData.valorizacao > 0;
  const isValNegativa = liveData.valorizacao < 0;
  const scoutsEntries = Object.entries(liveData.scout || {});

  return (
    <div className="relative flex flex-col p-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl gap-4 shadow-sm transition-all">
      <div className="flex items-start justify-between w-full mt-2">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={atleta.foto || 'https://via.placeholder.com/150'}
              alt={atleta.apelido}
              className="object-cover w-16 h-16 bg-gray-100 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-800 rounded-full"
            />
            {isCapitao && (
              <div className="absolute flex items-center justify-center w-8 h-8 text-xs font-black text-white bg-orange-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm -bottom-2 -right-2">
                C
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold leading-tight text-gray-900 dark:text-gray-100">
              {atleta.apelido || atleta.nome}
            </h3>
            <span className="mt-0.5 text-xs font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">
              {nomesPosicoes[atleta.posicao_id]}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end justify-center min-w-[90px] md:min-w-[120px]">
          {isCapitao && (
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px] md:text-sm font-bold text-gray-400 dark:text-gray-500 line-through decoration-gray-300 dark:decoration-gray-600">
                {liveData.pontuacao.toFixed(2)}
              </span>
              <span className="px-1.5 py-0.5 md:px-2 md:py-1 text-[9px] md:text-[11px] font-black text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900 border border-orange-200 dark:border-orange-800 rounded text-center leading-none tracking-wider">
                x1.5
              </span>
            </div>
          )}
          <span
            className={`text-2xl md:text-4xl font-black leading-none tracking-tighter ${pontosFinais > 0 ? 'text-emerald-500' : pontosFinais === 0 ? 'text-gray-900 dark:text-gray-100' : 'text-red-500'}`}
          >
            {pontosFinais.toFixed(2)}
          </span>
          <div
            className={`flex items-center gap-0.5 md:gap-1 mt-1.5 text-[11px] md:text-sm font-bold ${isValPositiva ? 'text-emerald-500' : isValNegativa ? 'text-red-500' : 'text-gray-400'}`}
          >
            <span>
              C$ {isValPositiva ? '+' : ''}
              {liveData.valorizacao.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap w-full gap-2 pt-3 mt-1 border-t border-gray-100/50 dark:border-gray-700/50 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {scoutsEntries.length > 0 ? (
            scoutsEntries.map(([sigla, valor]) => {
              const isNegativo = (pontuacaoScouts[sigla as keyof Scout] || 0) < 0;
              return (
                <span
                  key={sigla}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md border transition-colors ${isNegativo ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60' : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'}`}
                >
                  {sigla}: {valor as React.ReactNode}
                </span>
              );
            })
          ) : (
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500">
              {isMercadoAberto ? 'Rodada não iniciada.' : 'Sem ações registradas.'}
            </span>
          )}
        </div>

        {scoutsEntries.length > 0 && (
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-auto cursor-pointer"
          >
            <span>{isExpanded ? 'Ocultar detalhes' : 'Ver scouts detalhados'}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}
      </div>

      {isExpanded && scoutsEntries.length > 0 && (
        <ScoutsDetalhes scoutsEntries={scoutsEntries} isCapitao={isCapitao} />
      )}
    </div>
  );
}

// 2.3 - Detalhamento dos Scouts
function ScoutsDetalhes({ scoutsEntries, isCapitao }: any) {
  return (
    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2.5 animate-fade-in">
      <div className="flex items-center justify-between pb-1">
        <span className="text-[11px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500">
          Detalhamento dos Scouts
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {scoutsEntries.map(([sigla, valor]: any) => {
          const peso = pontuacaoScouts[sigla as keyof Scout];
          const isNegativo = peso !== undefined && peso < 0;
          const totalScout = peso !== undefined ? Number(valor) * peso : 0;

          // 👇 Verifica se a quantidade é maior que 1 para usar o plural
          const isPlural = Number(valor) > 1;
          const nomeScout = isPlural
            ? nomesScoutsPlural[sigla as keyof Scout] || sigla
            : nomesScouts[sigla as keyof Scout] || sigla;

          return (
            <div
              key={sigla}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-semibold ${isNegativo ? 'bg-red-50/70 dark:bg-red-950/30 border-red-200/80 dark:border-red-900/40 text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'}`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-7 h-5 flex items-center justify-center text-[10px] font-black rounded ${isNegativo ? 'bg-red-200/70 dark:bg-red-900/60 text-red-800 dark:text-red-200' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300'}`}
                >
                  {sigla}
                </span>

                {/* 👇 Agora exibe o nome formatado bonitinho */}
                <span className="truncate">{`${valor} ${nomeScout} (${peso?.toFixed(2) || ''})`}</span>
              </div>
              <span
                className={`font-black min-w-[45px] text-right ${isNegativo ? 'text-red-600 dark:text-red-400' : totalScout > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}
              >
                {totalScout.toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
      {isCapitao && (
        <div className="flex items-center justify-between px-3 py-1.5 mt-1 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 rounded-lg text-xs font-bold text-orange-700 dark:text-orange-400">
          <span>Multiplicador de Capitão</span>
          <span>x1.5</span>
        </div>
      )}
    </div>
  );
}

// 2.4 - Banco de Reservas
function BancoReservasAoVivo({ reservas, dadosAoVivo, isMercadoAberto }: any) {
  if (reservas.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 pt-6 mt-2 border-t border-gray-200 dark:border-gray-700 border-dashed animate-fade-in">
      <h3 className="text-[10px] font-black tracking-widest text-gray-400 dark:text-gray-500 uppercase ml-1">
        Banco de Reservas
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {reservas.map((reserva: Atleta) => {
          const liveData = !isMercadoAberto ? dadosAoVivo[String(reserva.id)] : undefined;
          const safeLiveData = liveData || DEFAULT_LIVE_DATA;
          const isValPositiva = safeLiveData.valorizacao > 0;

          return (
            <div
              key={reserva.id}
              className="flex items-center justify-between p-3 bg-gray-100/50 border border-gray-200 rounded-xl opacity-80 transition-opacity hover:opacity-100 dark:bg-gray-800/50 dark:border-gray-700"
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
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
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
                  className={`flex items-center gap-0.5 mt-0.5 text-[10px] font-bold ${isValPositiva ? 'text-emerald-600/70' : safeLiveData.valorizacao < 0 ? 'text-red-600/70' : 'text-gray-400'}`}
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
  );
}

// ==========================================
// 3. COMPONENTE PRINCIPAL (Agora limpo e focado no estado)
// ==========================================
export function PranchetaAoVivo() {
  const { time, reservas, capitao, patrimonioTotal } = useEscalacaoState();
  const [expandedJogadores, setExpandedJogadores] = useState<Record<number, boolean>>({});

  const { data: statusMercado = { status: 'fechado', isAberto: false } } = useMercado();
  const isMercadoAberto = statusMercado.isAberto;

  const { data: dadosAoVivo = {}, isLoading } = useQuery({
    queryKey: ['atletasAoVivo'],
    queryFn: fetchAtletasAoVivo,
    refetchInterval: isMercadoAberto ? false : 60000,
  });

  const toggleAccordion = (id: number) => {
    setExpandedJogadores((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const timeAtualizado = time.map((titular) => ({
    titular,
    liveData:
      (!isMercadoAberto ? dadosAoVivo[String(titular.id)] : undefined) ||
      DEFAULT_LIVE_DATA,
    isCapitao: titular.id === capitao,
  }));

  const pontuacaoTotal = timeAtualizado.reduce(
    (total, item) =>
      total + (item.isCapitao ? item.liveData.pontuacao * 1.5 : item.liveData.pontuacao),
    0,
  );
  const valorizacaoTotal = timeAtualizado.reduce(
    (total, item) => total + item.liveData.valorizacao,
    0,
  );

  if (time.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
        <p className="font-semibold text-gray-500 dark:text-gray-400">
          Seu time está vazio.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Abra o mercado para escalar seus jogadores antes de acompanhar a rodada.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full gap-6 px-6 md:px-0 animate-fade-in">
      <PlacarAoVivo
        pontuacaoTotal={pontuacaoTotal}
        patrimonioParcial={patrimonioTotal + valorizacaoTotal}
        valorizacaoTotal={valorizacaoTotal}
        isMercadoAberto={isMercadoAberto}
        isLoading={isLoading}
      />

      <div className="flex flex-col gap-3">
        {timeAtualizado.map((item) => (
          <CardJogadorAoVivo
            key={item.titular.id}
            atleta={item.titular}
            liveData={item.liveData}
            isCapitao={item.isCapitao}
            isExpanded={!!expandedJogadores[item.titular.id]}
            onToggle={() => toggleAccordion(item.titular.id)}
            isMercadoAberto={isMercadoAberto}
          />
        ))}
      </div>

      <BancoReservasAoVivo
        reservas={reservas}
        dadosAoVivo={dadosAoVivo}
        isMercadoAberto={isMercadoAberto}
      />
    </div>
  );
}
