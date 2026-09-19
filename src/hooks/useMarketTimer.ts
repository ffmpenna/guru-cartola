import { useState, useEffect } from 'react';

interface MarketTimerProps {
  fechamento?: number;
  isAbertoAPI: boolean; // 👈 Atualizado para refletir o novo modelo de dados
  isMercadoAberto: boolean;
  setIsMercadoAberto: (val: boolean) => void;
}

export function useMarketTimer({
  fechamento,
  isAbertoAPI,
  isMercadoAberto,
  setIsMercadoAberto,
}: MarketTimerProps) {
  const [tempoRestante, setTempoRestante] = useState(() => {
    // Agora a leitura fica super semântica
    if (!isAbertoAPI) {
      return { dias: 0, horas: 0, minutos: 0, segundos: 0, fechado: true };
    }
    return { dias: 0, horas: 0, minutos: 0, segundos: 0, fechado: false };
  });

  useEffect(() => {
    // CASO 1: API oficial diz que fechou ou está em manutenção
    if (!isAbertoAPI) {
      setTempoRestante({ dias: 0, horas: 0, minutos: 0, segundos: 0, fechado: true });
      if (isMercadoAberto) setIsMercadoAberto(false);
      return;
    }

    if (!fechamento) return;

    const atualizarCronometro = () => {
      const agora = Date.now();
      const dataFechamento = fechamento * 1000;
      const diferenca = dataFechamento - agora;

      // CASO 2: O tempo esgotou localmente
      if (diferenca <= 0) {
        setTempoRestante({ dias: 0, horas: 0, minutos: 0, segundos: 0, fechado: true });
        if (isMercadoAberto) setIsMercadoAberto(false);
        return;
      }

      // CASO 3: Relógio rodando
      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
      const minutos = Math.floor((diferenca / 1000 / 60) % 60);
      const segundos = Math.floor((diferenca / 1000) % 60);

      setTempoRestante({ dias, horas, minutos, segundos, fechado: false });

      if (!isMercadoAberto) setIsMercadoAberto(true);
    };

    atualizarCronometro();
    const intervalo = setInterval(atualizarCronometro, 1000);

    return () => clearInterval(intervalo);
  }, [fechamento, isAbertoAPI, isMercadoAberto, setIsMercadoAberto]);

  return tempoRestante;
}
