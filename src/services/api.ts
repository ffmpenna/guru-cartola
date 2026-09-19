// src/services/api.ts
import type { Atleta, AtletasPontuadosResponse } from '../types/Atleta';
import type { MercadoStatus, StatusMercadoType } from '../types/Mercado';
import type { Partida } from '../types/Partida';

const API_URL =
  'https://pb89hpsof3.execute-api.us-east-1.amazonaws.com/prod/escalar/rodadas_anteriores_novo/10';
const PARTIDAS_URL = '/api-cartola/partidas';
const ATLETAS_PONTUADOS_URL =
  'https://pb89hpsof3.execute-api.us-east-1.amazonaws.com/prod/atletas-pontuados';
const STATUS_MERCADO_URL = '/api-cartola/mercado/status';

const MAPA_STATUS_MERCADO: Record<number, StatusMercadoType> = {
  0: 'manutencao',
  1: 'aberto',
  2: 'fechado',
};

export const fetchStatusMercado = async (): Promise<MercadoStatus> => {
  const response = await fetch(STATUS_MERCADO_URL);

  if (!response.ok) {
    throw new Error('Erro ao buscar o status do mercado');
  }

  const data = await response.json();

  // Traduz o número mágico para uma string semântica
  const statusTraduzido = MAPA_STATUS_MERCADO[data.status_mercado] || 'desconhecido';

  return {
    status: statusTraduzido,
    isAberto: data.status_mercado === 1, // Facilita muito lá no useMercado()
    fechamento: data.fechamento.timestamp,
    rodada_atual: data.rodada_atual,
  };
};

export const fetchAtletasAoVivo = async (): Promise<AtletasPontuadosResponse> => {
  const response = await fetch(ATLETAS_PONTUADOS_URL);
  if (!response.ok) {
    throw new Error('Erro ao buscar a pontuação ao vivo');
  }

  return response.json();
};

export async function fetchPartidas(): Promise<Partida[]> {
  try {
    const response = await fetch(PARTIDAS_URL);
    if (!response.ok) throw new Error('Erro ao carregar partidas');

    const data = await response.json();
    const partidasArray = data.partidas || [];
    const clubesDic = data.clubes || {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const partidasFormatadas: Partida[] = partidasArray.map((p: any) => {
      const clubeCasa = clubesDic[p.clube_casa_id];
      const clubeVisitante = clubesDic[p.clube_visitante_id];

      // Formata a data (Ex: "2026-09-05 16:00:00" vira "05/09 - 16:00")
      const dateObj = new Date(p.partida_data.replace(' ', 'T'));
      const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const diaSemana = diasDaSemana[dateObj.getDay()];
      const dia = String(dateObj.getDate()).padStart(2, '0');
      const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
      const hora = String(dateObj.getHours()).padStart(2, '0');
      const min = String(dateObj.getMinutes()).padStart(2, '0');

      return {
        id: p.partida_id,
        clubeCasaId: p.clube_casa_id,
        clubeCasaEscudo: clubeCasa?.escudos?.['45x45'] || '',
        clubeCasaSigla: clubeCasa?.abreviacao || '---',
        clubeVisitanteId: p.clube_visitante_id,
        clubeVisitanteEscudo: clubeVisitante?.escudos?.['45x45'] || '',
        clubeVisitanteSigla: clubeVisitante?.abreviacao || '---',
        placarCasa: p.placar_oficial_mandante,
        placarVisitante: p.placar_oficial_visitante,
        dataStr: `${diaSemana}, ${dia}/${mes} - ${hora}:${min}`,
        valida: p.valida,
        status: p.status_transmissao_tr || 'CRIADA', // 👈 Puxando a string nativa do Cartola
        periodo: p.periodo_tr || '',
        inicioCronometro: p.inicio_cronometro_tr || null,
      };
    });

    return partidasFormatadas;
  } catch (error) {
    console.error('Erro no fetchPartidas:', error);
    return [];
  }
}
export async function fetchAtletas(): Promise<Atleta[]> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Erro ao carregar os dados da API');

    const data = await response.json();
    const jogadoresDic = data.jogadores || {};
    const clubesDic = data.clubes || {};

    // 1. Transforma o dicionário de jogadores em um array comum
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jogadoresArray = Object.values(jogadoresDic) as any[];
    const provaveis = jogadoresArray.filter((j) => j.st === 7);

    // 3. Traduz as chaves da API para a nossa Interface Atleta
    const mercadoFormatado: Atleta[] = provaveis.map((j) => {
      // Ajusta a URL da foto substituindo 'FORMATO' pelo tamanho que usamos
      let fotoFormatada = j.ft || '';
      if (fotoFormatada.includes('FORMATO')) {
        fotoFormatada = fotoFormatada.replace('FORMATO', '140x140');
      }

      // O parseFloat extrai magicamente apenas o "6.0" de bizarrices como "6.0JS:6"
      const minimoParse = typeof j.pm === 'string' ? parseFloat(j.pm) : j.pm || 0;
      const pontuacaoEsperadaParse =
        typeof j.pe === 'string' ? parseFloat(j.pe) : j.pe || 0;
      const media10 = j.m10g || 0;

      // Pega o nome do clube pelo ID e extrai as 3 primeiras letras (Ex: "Flamengo" -> "FLA")
      const clubeMandanteObj = clubesDic[j.ca];
      const clubeVisitanteObj = clubesDic[j.cb];
      const siglaMandante = clubeMandanteObj
        ? clubeMandanteObj.nm.substring(0, 3).toUpperCase()
        : '---';
      const siglaVisitante = clubeVisitanteObj
        ? clubeVisitanteObj.nm.substring(0, 3).toUpperCase()
        : '---';

      // Calcula a margem de segurança (Média - Mínimo)
      const margemCalculada = Number((media10 - minimoParse).toFixed(2));

      return {
        id: j.id,
        nome: j.ap,
        posicao_id: j.ps,
        foto: fotoFormatada,
        preco: j.pr || 0,
        pontuacaoEsperada: pontuacaoEsperadaParse,
        media: media10,
        minimo: minimoParse,
        jogos10: j.m10gj || 0,
        clubeMandante: siglaMandante,
        clubeVisitante: siglaVisitante,
        local: j.lc,
        valorizacaoEsperada: j.ve || 0,
        margem: margemCalculada,
      };
    });

    // Ordena os jogadores do mais caro para o mais barato por padrão
    return mercadoFormatado.sort((a, b) => b.preco - a.preco);
  } catch (error) {
    console.error('Erro no fetchMercado:', error);
    return [];
  }
}
