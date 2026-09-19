import { useState, useEffect, useCallback } from 'react';
import type { Atleta } from '../types/Atleta';

export const mapaFormacao: Record<string, Record<number, number>> = {
  '4-3-3': { 1: 1, 2: 2, 3: 2, 4: 3, 5: 3, 6: 1 },
  '4-4-2': { 1: 1, 2: 2, 3: 2, 4: 4, 5: 2, 6: 1 },
  '3-4-3': { 1: 1, 2: 0, 3: 3, 4: 4, 5: 3, 6: 1 },
};

export function useLineupManager(
  showToast: (texto: string, tipo?: 'erro' | 'sucesso') => void,
) {
  const [modoBuscaReserva, setModoBuscaReserva] = useState<number | null>(null);
  const [isMercadoAberto, setIsMercadoAberto] = useState<boolean>(true);

  const [time, setTime] = useState<Atleta[]>(() => {
    const saved = localStorage.getItem('@GuruStats:time');
    return saved ? JSON.parse(saved) : [];
  });

  const [reservas, setReservas] = useState<Atleta[]>(() => {
    const saved = localStorage.getItem('@GuruStats:reservas');
    return saved ? JSON.parse(saved) : [];
  });

  const [formacao, setFormacao] = useState<string>(() => {
    const saved = localStorage.getItem('@GuruStats:formacao');
    return saved ? JSON.parse(saved) : '4-3-3';
  });

  const [capitao, setCapitao] = useState<number | null>(() => {
    const capitaoSalvo = localStorage.getItem('@MercadoPro:capitao');
    return capitaoSalvo ? JSON.parse(capitaoSalvo) : null;
  });

  const [patrimonioTotal, setPatrimonioTotal] = useState<number>(() => {
    const saved = localStorage.getItem('@GuruStats:patrimonioTotal');
    return saved ? JSON.parse(saved) : 100.0;
  });

  useEffect(() => {
    if (capitao !== null) {
      localStorage.setItem('@MercadoPro:capitao', JSON.stringify(capitao));
    } else {
      localStorage.removeItem('@MercadoPro:capitao');
    }
    localStorage.setItem('@GuruStats:time', JSON.stringify(time));
    localStorage.setItem('@GuruStats:reservas', JSON.stringify(reservas));
    localStorage.setItem('@GuruStats:formacao', JSON.stringify(formacao));
    localStorage.setItem('@GuruStats:patrimonioTotal', JSON.stringify(patrimonioTotal));
  }, [time, reservas, formacao, capitao, patrimonioTotal]);

  const custoDoTime = time.reduce((total, atleta) => total + atleta.preco, 0);
  const cartoletas = patrimonioTotal - custoDoTime;

  const getPrecoMaximoReserva = useCallback(
    (posicaoId: number) => {
      const titularesDaPosicao = time.filter((j) => j.posicao_id === posicaoId);
      if (titularesDaPosicao.length === 0) return 0;
      return Math.min(...titularesDaPosicao.map((j) => j.preco));
    },
    [time],
  );

  const isEscalado = useCallback(
    (atletaId: number) => time.some((j) => j.id === atletaId),
    [time],
  );
  const isReserva = useCallback(
    (atletaId: number) => reservas.some((j) => j.id === atletaId),
    [reservas],
  );

  const isPosicaoCheia = useCallback(
    (posicaoId: number) => {
      const vagasTotais = mapaFormacao[formacao][posicaoId] || 0;
      const jogadoresNestaPosicao = time.filter((j) => j.posicao_id === posicaoId).length;
      return jogadoresNestaPosicao >= vagasTotais;
    },
    [formacao, time],
  );

  const adicionarJogador = useCallback(
    (atleta: Atleta) => {
      if (isEscalado(atleta.id) || isReserva(atleta.id)) {
        showToast('Jogador já está no time ou banco!', 'erro');
        return;
      }

      if (cartoletas < atleta.preco) {
        showToast('Cartoletas insuficientes, cartoleiro!', 'erro');
        return;
      }

      const vagasTotaisDaPosicao = mapaFormacao[formacao][atleta.posicao_id];
      const jogadoresNestaPosicao = time.filter(
        (j) => j.posicao_id === atleta.posicao_id,
      ).length;

      if (jogadoresNestaPosicao >= vagasTotaisDaPosicao) {
        showToast('Lotação máxima para esta posição!', 'erro');
        return;
      }

      setTime((prev) => [...prev, atleta]);
    },
    [isEscalado, isReserva, cartoletas, formacao, time, showToast],
  );

  const adicionarReserva = useCallback(
    (atleta: Atleta) => {
      setModoBuscaReserva(null);
      if (isEscalado(atleta.id) || isReserva(atleta.id)) {
        showToast('Jogador já está no time ou banco!', 'erro');
        return;
      }

      const titularesDaPosicao = time.filter((j) => j.posicao_id === atleta.posicao_id);
      if (titularesDaPosicao.length === 0) {
        showToast('Escale um titular nesta posição primeiro!', 'erro');
        return;
      }

      const reservaExistente = reservas.find((r) => r.posicao_id === atleta.posicao_id);
      if (reservaExistente) {
        showToast('Você já tem um reserva para esta posição!', 'erro');
        return;
      }

      const precoTitularMaisBarato = Math.min(...titularesDaPosicao.map((j) => j.preco));
      if (atleta.preco > precoTitularMaisBarato) {
        showToast(
          `O reserva não pode ser mais caro que C$ ${precoTitularMaisBarato.toFixed(2)}!`,
          'erro',
        );
        return;
      }

      setReservas((prev) => [...prev, atleta]);
    },
    [isEscalado, isReserva, time, reservas, showToast],
  );

  const removerJogador = useCallback(
    (atleta: Atleta) => {
      setTime((prev) => prev.filter((j) => j.id !== atleta.id));
      if (capitao === atleta.id) setCapitao(null);

      const restantesNestaPosicao = time.filter(
        (j) => j.posicao_id === atleta.posicao_id && j.id !== atleta.id,
      );
      if (restantesNestaPosicao.length === 0) {
        setReservas((prev) => prev.filter((r) => r.posicao_id !== atleta.posicao_id));
      }
    },
    [capitao, time],
  );

  const removerReserva = useCallback((atleta: Atleta) => {
    setReservas((prev) => prev.filter((j) => j.id !== atleta.id));
  }, []);

  const limparTime = useCallback(() => {
    setTime([]);
    setReservas([]);
    setCapitao(null);
  }, []);

  const handleSetFormacao = useCallback(
    (novaFormacao: string) => {
      setFormacao(novaFormacao);

      const exigenciaTatica = mapaFormacao[novaFormacao];
      let novoTime: Atleta[] = [];
      let valorReembolsado = 0;

      for (let pos = 1; pos <= 6; pos++) {
        const limite = exigenciaTatica[pos] || 0;
        const jogadoresNestaPosicao = time.filter((j) => j.posicao_id === pos);

        const jogadoresQueFicam = jogadoresNestaPosicao.slice(0, limite);
        const jogadoresQueSaem = jogadoresNestaPosicao.slice(limite);

        novoTime = [...novoTime, ...jogadoresQueFicam];
        jogadoresQueSaem.forEach((j) => {
          valorReembolsado += j.preco;
        });
      }

      let novasReservas = [...reservas];
      novasReservas = novasReservas.filter((r) => {
        const limite = exigenciaTatica[r.posicao_id] || 0;
        if (limite === 0) {
          valorReembolsado += r.preco;
          return false;
        }
        return true;
      });

      setTime(novoTime);
      setReservas(novasReservas);

      if (valorReembolsado > 0) {
        showToast(
          `Formação atualizada! C$ ${valorReembolsado.toFixed(2)} reembolsados.`,
          'sucesso',
        );
      }
    },
    [time, reservas, showToast],
  );

  return {
    state: {
      time,
      reservas,
      formacao,
      cartoletas,
      patrimonioTotal,
      capitao,
      isMercadoAberto,
      modoBuscaReserva,
    },
    actions: {
      setModoBuscaReserva,
      getPrecoMaximoReserva,
      setIsMercadoAberto,
      setPatrimonioTotal,
      adicionarJogador,
      removerJogador,
      adicionarReserva,
      removerReserva,
      isEscalado,
      isReserva,
      isPosicaoCheia,
      setFormacao: handleSetFormacao,
      limparTime,
      setCapitao,
    },
  };
}
