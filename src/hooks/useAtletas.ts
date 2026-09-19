import { useQuery } from '@tanstack/react-query';
import { fetchAtletas } from '../services/api';

export function useAtletas() {
  return useQuery({
    queryKey: ['atletas'],
    queryFn: fetchAtletas,
    staleTime: 1000 * 60 * 15, // 15 minutos: tempo em que o cache é considerado "fresco"
  });
}
