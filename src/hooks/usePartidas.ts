import { useQuery } from '@tanstack/react-query';
import { fetchPartidas } from '../services/api';

export function usePartidas() {
  return useQuery({
    queryKey: ['partidas'],
    queryFn: fetchPartidas,
    staleTime: 1000 * 60 * 15, // 15 minutos sem precisar bater na API de novo
  });
}
