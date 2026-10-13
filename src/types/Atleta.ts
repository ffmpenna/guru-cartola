// src/types/Atleta.ts

// 1. As siglas de pontuação do jogo
export interface Scout {
  G?: number; // Gol
  A?: number; // Assistência
  FT?: number; // Finalização na trave
  FD?: number; // Finalização defendida
  FF?: number; // Finalização pra fora
  FS?: number; // Falta sofrida
  PS?: number; // Penalti sofrido
  PP?: number; // Penalti perdido
  I?: number; // Impedimento
  DP?: number; // Defesa de penalti
  SG?: number; // Jogo sem sofrer gol
  DE?: number; // Defesa
  DS?: number; // Desarme
  GC?: number; // Gol contra
  CV?: number; // Cartão Vermelho
  CA?: number; // Cartão amarelo
  GS?: number; // Gol sofrido
  FC?: number; // Falta cometida
  PC?: number; // Penalti cometido
  // Adicione outras siglas se necessário
}

// 2. A sua interface base (já existente no seu projeto)
export interface Atleta {
  id: number;
  nome: string;
  apelido?: string;
  foto?: string;
  preco: number;
  posicao_id: number;
  clubeMandante?: string;
  clubeVisitante?: string;
  local?: 'Casa' | 'Fora';
  media: number;
  jogos10: number;
  minimo: number;
  pontuacaoEsperada: number;
  valorizacaoEsperada: number;
  margem: number;
  posicao?: { abreviacao: string };
  clube?: { nome: string };
}

// 3. A extensão para o modo "Ao Vivo" (Herda de Atleta e adiciona os 3 campos novos)
export interface AtletaPontuado extends Atleta {
  pontuacao: number;
  valorizacao: number;
  scout: Scout;
  entrou_em_campo?: boolean;
}

// 4. O TIPO FINAL que você pediu!
// Ele diz que a resposta é um objeto cujas chaves são strings (os IDs) e os valores são 'AtletaPontuado'
export type AtletasPontuadosResponse = Record<string, AtletaPontuado>;
