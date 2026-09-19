import { useMemo } from 'react';
import type { Atleta } from '../types/Atleta';

interface FilterProps {
  atletas: Atleta[];
  termoBusca: string;
  ordenacao: 've' | 'margem' | 'pe';
  modoBuscaReserva: number | null;
  precoMaximoReserva: number;
}

export function usePlayerFilter({
  atletas,
  termoBusca,
  ordenacao,
  modoBuscaReserva,
  precoMaximoReserva,
}: FilterProps) {
  const termoFormatado = termoBusca.toLowerCase().trim();
  const isBuscando = termoFormatado.length > 0;

  const jogadoresFiltradosBusca = useMemo(() => {
    if (!isBuscando) return [];

    const sortFn = (a: Atleta, b: Atleta) => {
      if (ordenacao === 've') return b.valorizacaoEsperada - a.valorizacaoEsperada;
      if (ordenacao === 'pe') return b.pontuacaoEsperada - a.pontuacaoEsperada;
      return b.margem - a.margem;
    };

    return atletas
      .filter((a) => a.nome.toLowerCase().includes(termoFormatado))
      .sort(sortFn);
  }, [atletas, termoFormatado, isBuscando, ordenacao]);

  const jogadoresFiltroReserva = useMemo(() => {
    if (modoBuscaReserva === null) return [];

    const sortFn = (a: Atleta, b: Atleta) => {
      if (ordenacao === 've') return b.valorizacaoEsperada - a.valorizacaoEsperada;
      if (ordenacao === 'pe') return b.pontuacaoEsperada - a.pontuacaoEsperada;
      return b.margem - a.margem;
    };

    return atletas
      .filter((a) => a.posicao_id === modoBuscaReserva && a.preco <= precoMaximoReserva)
      .sort(sortFn);
  }, [atletas, modoBuscaReserva, precoMaximoReserva, ordenacao]);

  return {
    isBuscando,
    jogadoresFiltradosBusca,
    jogadoresFiltroReserva,
  };
}
