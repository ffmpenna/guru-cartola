// src/components/PositionCarousel.tsx
import { useState, useRef, useEffect } from 'react';
import type { Atleta } from '../types/Atleta';
import { PlayerCard } from './PlayerCard';

interface PositionCarouselProps {
  titulo: string;
  vagas: number;
  jogadores: Atleta[];
  tipoOrdenacao: 've' | 'margem' | 'pe';
}

export function PositionCarousel({
  titulo,
  vagas,
  jogadores,
  tipoOrdenacao,
}: PositionCarouselProps) {
  const [filtroMando, setFiltroMando] = useState<'todos' | 'Casa' | 'Fora'>('todos');

  // 👇 1. Criamos a referência para a div do carrossel
  const carrosselRef = useRef<HTMLDivElement>(null);

  // 👇 Sempre que a ordenação ou o filtro mudar, voltamos o scroll para o começo instantaneamente
  useEffect(() => {
    if (carrosselRef.current) {
      // Passar apenas as coordenadas (X, Y) faz a rolagem ser imediata
      carrosselRef.current.scrollTo(0, 0);
    }
  }, [tipoOrdenacao, filtroMando]);
  const jogadoresFiltrados = jogadores.filter((j) => {
    if (filtroMando === 'todos') return true;
    return j.local === filtroMando;
  });

  // 2. Atualize a lógica do .sort()
  const jogadoresOrdenados = [...jogadoresFiltrados].sort((a, b) => {
    if (tipoOrdenacao === 've') {
      return b.valorizacaoEsperada - a.valorizacaoEsperada;
    }
    if (tipoOrdenacao === 'pe') {
      return b.pontuacaoEsperada - a.pontuacaoEsperada; // 👈 Nova matemática
    }
    return b.margem - a.margem;
  });

  return (
    // 👇 1. Removemos todas aquelas classes after: gigantes daqui
    <div className="relative w-full">
      <section>
        <div className="flex items-center justify-start gap-3 mb-4">
          <div className="flex items-baseline gap-2">
            <h2 className="m-0 text-lg font-bold tracking-tight">{titulo}</h2>
            <span className="text-[13px] font-medium text-gray-400">({vagas} vagas)</span>
          </div>

          <select
            className="w-auto px-3 py-2 pr-8 text-[13px] font-semibold text-gray-900 bg-gray-100 border-2 border-transparent rounded-xl appearance-none outline-none cursor-pointer transition-colors focus:border-orange-500 focus:bg-white bg-white bg-no-repeat bg-[position:right_10px_center] shadow-sm"
            value={filtroMando}
            onChange={(e) => setFiltroMando(e.target.value as 'todos' | 'Casa' | 'Fora')}
          >
            <option value="todos">Todos</option>
            <option value="Casa">Em Casa</option>
            <option value="Fora">Fora</option>
          </select>
        </div>

        {/* 👇 Adicionamos a ref e a classe [overflow-anchor:none] no final */}
        <div
          ref={carrosselRef}
          className="flex overflow-x-auto gap-4 px-6 pb-6 pr-[64px] snap-x md:px-0 md:pr-[80px] max-md:[&::-webkit-scrollbar]:hidden max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:block md:[&::-webkit-scrollbar]:h-2 md:[&::-webkit-scrollbar-track]:bg-gray-100 md:[&::-webkit-scrollbar-track]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-gray-400 md:[&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {jogadoresOrdenados.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full py-8 px-6 bg-white border border-dashed border-gray-200 rounded-xl text-gray-400 text-center mr-10 md:mr-0">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mb-3"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <p className="m-0 text-sm font-medium">
                Nenhum atleta listado como provável.
              </p>
            </div>
          ) : (
            jogadoresOrdenados.map((atleta, index) => (
              <PlayerCard
                key={atleta.id}
                atleta={atleta}
                tipoOrdenacao={tipoOrdenacao}
                index={index}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
