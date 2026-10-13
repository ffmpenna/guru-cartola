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

  // 👇 1. Estados para controlar a visibilidade das setas
  const [podeHolarEsquerda, setPodeHolarEsquerda] = useState(false);
  const [podeHolarDireita, setPodeHolarDireita] = useState(true);

  const carrosselRef = useRef<HTMLDivElement>(null);

  // 👇 2. Função inteligente que verifica onde o scroll está
  const checarLimitesScroll = () => {
    if (carrosselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carrosselRef.current;
      setPodeHolarEsquerda(scrollLeft > 0);
      // Math.ceil evita bugs de arredondamento em telas com zoom
      setPodeHolarDireita(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  // Executa a checagem ao rolar e ao redimensionar a tela
  useEffect(() => {
    checarLimitesScroll();
    window.addEventListener('resize', checarLimitesScroll);
    return () => window.removeEventListener('resize', checarLimitesScroll);
  }, [jogadores, filtroMando]);

  // 👇 3. Função de navegação por clique (Scroll Suave)
  const navegar = (direcao: 'esquerda' | 'direita') => {
    if (carrosselRef.current) {
      // Rola cerca de 70% da tela visível para manter o contexto visual
      const deslocamento = carrosselRef.current.clientWidth * 0.7;
      carrosselRef.current.scrollBy({
        left: direcao === 'esquerda' ? -deslocamento : deslocamento,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (carrosselRef.current) {
      carrosselRef.current.scrollTo(0, 0);
    }
  }, [tipoOrdenacao, filtroMando]);

  const jogadoresFiltrados = jogadores.filter((j) => {
    if (filtroMando === 'todos') return true;
    return j.local === filtroMando;
  });

  const jogadoresOrdenados = [...jogadoresFiltrados].sort((a, b) => {
    if (tipoOrdenacao === 've') return b.valorizacaoEsperada - a.valorizacaoEsperada;
    if (tipoOrdenacao === 'pe') return b.pontuacaoEsperada - a.pontuacaoEsperada;
    return b.margem - a.margem;
  });

  return (
    <div className="relative w-full">
      <section>
        <div className="flex items-center justify-start gap-3 mb-4">
          <div className="flex items-baseline gap-2">
            <h2 className="m-0 text-lg font-bold tracking-tight">{titulo}</h2>
            <span className="text-[13px] font-medium text-gray-400 dark:text-gray-500">
              ({vagas} vagas)
            </span>
          </div>

          <select
            className="w-auto px-3 py-2 pr-8 text-[13px] font-semibold text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border-2 border-transparent rounded-xl appearance-none outline-none cursor-pointer transition-colors focus:border-orange-500 focus:bg-white dark:focus:bg-gray-700 bg-white dark:bg-gray-800 bg-no-repeat bg-[position:right_10px_center] shadow-sm"
            value={filtroMando}
            onChange={(e) => setFiltroMando(e.target.value as 'todos' | 'Casa' | 'Fora')}
          >
            <option value="todos">Todos</option>
            <option value="Casa">Em Casa</option>
            <option value="Fora">Fora</option>
          </select>
        </div>

        {/* 👇 4. Wrapper relativo para posicionar as setas sobre o carrossel */}
        <div className="relative group">
          {/* Botão Esquerda (Fica oculto no mobile e quando está no início) */}
          <button
            onClick={() => navegar('esquerda')}
            disabled={!podeHolarEsquerda}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-10 hidden md:flex items-center justify-center w-10 h-10 dark:bg-gray-800 bg-white border dark:border-gray-400 border-gray-200 rounded-full shadow-lg text-gray-600 hover:text-orange-500 hover:border-orange-400 hover:cursor-pointer transition-all ${
              podeHolarEsquerda
                ? 'opacity-0 group-hover:opacity-100'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div
            ref={carrosselRef}
            onScroll={checarLimitesScroll} // Atualiza as setas quando arrasta manualmente
            className="flex overflow-x-auto gap-4 px-6 pb-6 pr-[64px] snap-x md:px-0 scroll-smooth max-md:[&::-webkit-scrollbar]:hidden max-md:[-ms-overflow-style:none] max-md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:block md:[&::-webkit-scrollbar]:h-2 md:[&::-webkit-scrollbar-track]:bg-gray-100 md:dark:[&::-webkit-scrollbar-track]:bg-gray-800 md:[&::-webkit-scrollbar-track]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-gray-400 md:dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 md:[&::-webkit-scrollbar-thumb]:rounded-full"
          >
            {jogadoresOrdenados.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full py-8 px-6 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 dark:text-gray-500 text-center mr-10 md:mr-0">
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

          {/* Botão Direita */}
          <button
            onClick={() => navegar('direita')}
            disabled={!podeHolarDireita}
            className={`absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-10 hidden md:flex items-center justify-center w-10 h-10 dark:bg-gray-800 bg-white border dark:border-gray-400 border-gray-200 rounded-full shadow-lg text-gray-600 hover:text-orange-500 hover:border-orange-400 hover:cursor-pointer transition-all ${
              podeHolarDireita
                ? 'opacity-0 group-hover:opacity-100'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
}
