export interface Partida {
  id: number;
  clubeCasaId: number;
  clubeCasaEscudo: string;
  clubeCasaSigla: string;
  clubeVisitanteId: number;
  clubeVisitanteEscudo: string;
  clubeVisitanteSigla: string;
  placarCasa: number | null;
  placarVisitante: number | null;
  dataStr: string;
  valida: boolean;
  status: string;
  periodo: string;
  inicioCronometro: string | null;
}
