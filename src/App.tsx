import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SmartHeader } from './components/SmartHeader';
import { PositionCarousel } from './components/PositionCarousel';
import { LineupPanel } from './components/LineupPanel';
import { EscalacaoProvider } from './contexts/EscalacaoProvider';
import { useEscalacaoState, useEscalacaoDispatch } from './hooks/useEscalacao';
import { MatchesTicker } from './components/MatchesTicker';
import { PranchetaAoVivo } from './components/PranchetaAoVivo';
import { useAtletas } from './hooks/useAtletas';
import { usePartidas } from './hooks/usePartidas';
import { useMercado } from './hooks/useMercado';
import { usePlayerFilter } from './hooks/usePlayerFilter';
import { PlayerGrid } from './components/dashboard/PlayerGrid';
import { ReserveSearchBanner } from './components/dashboard/ReserveSearchBanner';
import { mapaFormacao } from './hooks/useLineupManager';

const queryClient = new QueryClient();

const nomesPosicoes: Record<number, string> = {
  1: 'Goleiros',
  2: 'Laterais',
  3: 'Zagueiros',
  4: 'Meias',
  5: 'Atacantes',
  6: 'Técnicos',
};

function Dashboard() {
  const { formacao, isMercadoAberto, modoBuscaReserva } = useEscalacaoState();
  const { getPrecoMaximoReserva } = useEscalacaoDispatch();
  const [ordenacao, setOrdenacao] = useState<'ve' | 'margem' | 'pe'>('ve');
  const [termoBusca, setTermoBusca] = useState('');
  const [openMaster] = useState(false);

  const { data: atletas = [], isLoading: isLoadingMercado } = useAtletas();
  const { data: partidas = [], isLoading: isLoadingPartidas } = usePartidas();
  const {
    data: statusMercado = {
      status: 'fechado',
      isAberto: false,
      fechamento: 0,
      rodada_atual: 0,
    },
  } = useMercado();

  const isLoading = isLoadingMercado || isLoadingPartidas;

  const vagasAtuais = mapaFormacao[formacao];
  const posicoesID = [1, 2, 3, 4, 5, 6];

  const precoMaximoReserva =
    modoBuscaReserva !== null ? getPrecoMaximoReserva(modoBuscaReserva) : 0;

  const { isBuscando, jogadoresFiltradosBusca, jogadoresFiltroReserva } = usePlayerFilter(
    {
      atletas,
      termoBusca,
      ordenacao,
      modoBuscaReserva,
      precoMaximoReserva,
    },
  );

  return (
    <div className="min-h-screen font-sans antialiased text-gray-900 bg-gray-50">
      <SmartHeader
        ordenacao={ordenacao}
        termoBusca={termoBusca}
        statusMercado={statusMercado}
        setOrdenacao={setOrdenacao}
        setTermoBusca={setTermoBusca}
      />

      <div className="pt-6 pb-[100px] md:pt-[120px] md:pb-10 max-w-[1400px] mx-auto md:px-12">
        <MatchesTicker partidas={partidas} isLoading={isLoading} />
        {isMercadoAberto || openMaster ? (
          <main className="flex flex-col-reverse items-start gap-8 px-6 md:grid md:grid-cols-[1fr_400px] md:px-0">
            <div className="flex flex-col w-full gap-8 min-w-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 animate-pulse">
                  <div className="w-12 h-12 mb-4 border-4 border-gray-200 rounded-full border-t-orange-500 animate-spin"></div>
                  <p className="font-bold uppercase tracking-wider text-sm">
                    Buscando Mercado...
                  </p>
                </div>
              ) : modoBuscaReserva !== null ? (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <ReserveSearchBanner />
                  <PlayerGrid
                    jogadores={jogadoresFiltroReserva}
                    ordenacao={ordenacao}
                    emptyMessage={`Nenhum ${nomesPosicoes[modoBuscaReserva]} elegível (C$ ${precoMaximoReserva.toFixed(2)} ou menos).`}
                  />
                </div>
              ) : isBuscando ? (
                <div className="flex flex-col gap-4 animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-extrabold tracking-tight text-gray-900 uppercase">
                      Resultados para "{termoBusca}"
                    </h2>
                    <span className="text-xs font-bold text-gray-400">
                      {jogadoresFiltradosBusca.length} encontrados
                    </span>
                  </div>
                  <PlayerGrid jogadores={jogadoresFiltradosBusca} ordenacao={ordenacao} />
                </div>
              ) : (
                posicoesID.map((pos) => {
                  const quantidadeVagas = vagasAtuais[pos];
                  if (quantidadeVagas === 0) return null;

                  const jogadoresDestaPosicao = atletas.filter(
                    (a) => a.posicao_id === pos,
                  );

                  return (
                    <PositionCarousel
                      key={pos}
                      titulo={nomesPosicoes[pos]}
                      vagas={quantidadeVagas}
                      jogadores={jogadoresDestaPosicao}
                      tipoOrdenacao={ordenacao}
                    />
                  );
                })
              )}
            </div>

            <LineupPanel />
          </main>
        ) : (
          <div className="max-w-4xl">
            <PranchetaAoVivo />
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EscalacaoProvider>
        <Dashboard />
      </EscalacaoProvider>
    </QueryClientProvider>
  );
}
