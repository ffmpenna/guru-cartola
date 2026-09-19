// src/hooks/useMercado.ts
import { useQuery } from '@tanstack/react-query';
import { fetchStatusMercado } from '../services/api';

export function useMercado() {
  return useQuery({
    queryKey: ['mercado'],
    queryFn: fetchStatusMercado,
    staleTime: 1000 * 60 * 5, // Fica "fresco" por 5 min
  });
}
