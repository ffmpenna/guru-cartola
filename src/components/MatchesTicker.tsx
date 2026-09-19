// src/components/MatchesTicker.tsx
import { useRef, useState, useEffect } from 'react';
import type { Partida } from '../types/Partida';

interface MatchesTickerProps {
  partidas: Partida[];
  isLoading: boolean;
}

export function MatchesTicker({ partidas, isLoading }: MatchesTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 60000);
    return () => clearInterval(intervalo);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[90px] bg-gray-200/50 animate-pulse rounded-2xl mb-8 flex items-center justify-center">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Carregando Jogos...
        </span>
      </div>
    );
  }

  if (partidas.length === 0) return null;

  // 👇 1. LÓGICA DE ORDENAÇÃO: Ao Vivo > Em Breve > Finalizada
  const partidasOrdenadas = [...partidas].sort((a, b) => {
    const getPesoStatus = (status: string) => {
      // Se não está ENCERRADA nem CRIADA, assumimos que está rolando (Ao Vivo)
      if (status !== 'ENCERRADA' && status !== 'CRIADA') return 1;
      // Jogos que ainda vão acontecer
      if (status === 'CRIADA') return 2;
      // Jogos já finalizados ficam por último
      return 3;
    };

    return getPesoStatus(a.status) - getPesoStatus(b.status);
  });

  return (
    <div className="w-full mb-8 relative px-6 md:px-0">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-extrabold text-gray-900 tracking-tight uppercase">
          Rodada Atual
        </h2>
      </div>

      <div
        ref={containerRef}
        className="flex overflow-x-auto gap-3 px-6 pb-6 pr-[64px] snap-x md:px-0 md:pr-[80px] max-md:[&::-webkit-scrollbar]:hidden max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:block md:[&::-webkit-scrollbar]:h-1.5 md:[&::-webkit-scrollbar-track]:bg-transparent md:[&::-webkit-scrollbar-thumb]:bg-gray-300 md:[&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {/* 👇 2. RENDERIZANDO O ARRAY ORDENADO */}
        {partidasOrdenadas.map((p) => {
          const temPlacar = p.placarCasa !== null && p.placarVisitante !== null;

          const isFinalizada = p.status === 'ENCERRADA';
          const isEmBreve = p.status === 'CRIADA';
          const isAoVivo = !isFinalizada && !isEmBreve;

          // 👇 2. A Matemática do Cronômetro (Zera no 2º Tempo)
          let textoStatusAoVivo = 'Ao Vivo';

          if (isAoVivo) {
            if (p.periodo === 'INTERVALO') {
              textoStatusAoVivo = 'Intervalo';
            } else if (
              p.inicioCronometro &&
              (p.periodo === 'PRIMEIRO_TEMPO' || p.periodo === 'SEGUNDO_TEMPO')
            ) {
              const inicioTime = new Date(p.inicioCronometro).getTime();

              // A diferença em minutos rolando DESDE O APITO daquele tempo específico
              const diferencaMinutos = Math.floor((agora.getTime() - inicioTime) / 60000);
              const minutosCorridos = diferencaMinutos > 0 ? diferencaMinutos : 1;

              const sufixoTempo = p.periodo === 'PRIMEIRO_TEMPO' ? '1T' : '2T';

              // Regra universal para ambos os tempos (zera no 2º tempo)
              if (minutosCorridos > 45) {
                const acrescimo = minutosCorridos - 45;
                textoStatusAoVivo = `45+${acrescimo}' ${sufixoTempo}`;
              } else {
                textoStatusAoVivo = `${minutosCorridos}' ${sufixoTempo}`;
              }
            }
          }

          return (
            <article
              key={p.id}
              className={`flex-none snap-start bg-white border rounded-xl py-3 px-5 shadow-sm flex flex-col items-center justify-between min-w-[150px] transition-colors ${!p.valida ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}
            >
              <div className="flex justify-between items-center w-full mb-2.5">
                <div className="flex items-center gap-1">
                  {isAoVivo && (
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      isFinalizada
                        ? 'text-gray-400'
                        : isEmBreve
                          ? 'text-blue-500'
                          : 'text-red-500'
                    }`}
                  >
                    {isFinalizada
                      ? 'Finalizada'
                      : isEmBreve
                        ? 'Em Breve'
                        : textoStatusAoVivo}
                  </span>
                </div>

                {!p.valida && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                    Inválida
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center gap-3 w-full">
                <img
                  src={p.clubeCasaEscudo}
                  alt={p.clubeCasaSigla}
                  className={`w-10 h-10 object-contain ${!p.valida ? 'opacity-70 grayscale' : ''}`}
                />

                <div className="flex flex-col items-center justify-center min-w-[40px]">
                  {temPlacar ? (
                    <span className="text-md font-extrabold text-gray-900 tracking-tighter">
                      {p.placarCasa} - {p.placarVisitante}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-gray-300">X</span>
                  )}
                </div>

                <img
                  src={p.clubeVisitanteEscudo}
                  alt={p.clubeVisitanteSigla}
                  className={`w-10 h-10 object-contain ${!p.valida ? 'opacity-70 grayscale' : ''}`}
                />
              </div>

              <div className="mt-2.5 pt-2 border-t border-dashed border-gray-100 w-full text-center">
                <span
                  className={`text-[10px] font-semibold ${!p.valida ? 'text-red-400' : 'text-gray-400'}`}
                >
                  {p.dataStr}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
