import { PlayerCard } from '../PlayerCard';
import type { Atleta } from '../../types/Atleta';

interface PlayerGridProps {
  jogadores: Atleta[];
  ordenacao: 've' | 'margem' | 'pe';
  emptyMessage?: string;
}

export function PlayerGrid({
  jogadores,
  ordenacao,
  emptyMessage = 'Nenhum jogador encontrado.',
}: PlayerGridProps) {
  if (jogadores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-12 bg-white border border-dashed border-gray-200 rounded-xl text-gray-400">
        <p className="m-0 text-sm font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 justify-items-center md:justify-items-start">
      {jogadores.map((atleta, index) => (
        <div key={atleta.id} className="flex justify-center w-full">
          <PlayerCard atleta={atleta} tipoOrdenacao={ordenacao} index={index} />
        </div>
      ))}
    </div>
  );
}
