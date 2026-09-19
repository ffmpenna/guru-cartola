export type StatusMercadoType = 'manutencao' | 'aberto' | 'fechado' | 'desconhecido';

export interface MercadoStatus {
  status: StatusMercadoType;
  isAberto: boolean; // 👈 Atalho de ouro para o React
  fechamento: number;
  rodada_atual: number;
}
