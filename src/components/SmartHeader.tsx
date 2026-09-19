import { useEscalacaoState, useEscalacaoDispatch } from '../hooks/useEscalacao';
import { useMarketTimer } from '../hooks/useMarketTimer';
import type { MercadoStatus } from '../types/Mercado';

interface SmartHeaderProps {
  ordenacao: 've' | 'margem' | 'pe';
  termoBusca: string;
  statusMercado: MercadoStatus;
  setOrdenacao: (val: 've' | 'margem' | 'pe') => void;
  setTermoBusca: (val: string) => void;
}

export function SmartHeader({
  ordenacao,
  termoBusca,
  statusMercado,
  setOrdenacao,
  setTermoBusca,
}: SmartHeaderProps) {
  const { formacao, isMercadoAberto } = useEscalacaoState();
  const { setFormacao, setIsMercadoAberto } = useEscalacaoDispatch();

  // 👇 1. Extraindo as novas propriedades tipadas corretamente
  const { fechamento, isAberto: isAbertoAPI, status, rodada_atual } = statusMercado;

  const tempoRestante = useMarketTimer({
    fechamento,
    isAbertoAPI, // 👈 Passando o booleano claro para o Hook
    isMercadoAberto,
    setIsMercadoAberto,
  });

  const formatar = (num: number) => num.toString().padStart(2, '0');

  return (
    <header className="relative md:fixed top-0 left-0 z-30 w-full px-6 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm md:px-12">
      <div className="max-w-[1400px] mx-auto flex flex-wrap md:flex-nowrap items-center justify-between gap-y-4 md:gap-8 w-full">
        {/* LOGO */}
        <div className="flex items-center gap-3 shrink-0 order-1">
          <div className="flex items-center justify-center w-10 h-10 text-white bg-gray-900 rounded-xl shadow-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </div>
          <div className="flex flex-col">
            <h1 className="m-0 text-xl font-black tracking-tighter leading-none text-gray-900">
              Mercado<span className="text-orange-500">PRO</span>
            </h1>
            <span className="mt-0.5 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
              {rodada_atual ? `Rodada ${rodada_atual} • 2026` : 'Scout Avançado'}
            </span>
          </div>
        </div>

        {/* NAVEGAÇÃO E CRONÔMETRO */}
        <div className="flex items-center shrink-0 order-2 md:flex-1 md:justify-center gap-3 w-full md:w-auto">
          <div className="flex p-1 bg-gray-100 rounded-xl border border-gray-200/60 shadow-inner">
            <button
              onClick={() => setIsMercadoAberto(true)}
              disabled={tempoRestante.fechado}
              className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                isMercadoAberto
                  ? 'bg-white text-orange-500 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              } ${tempoRestante.fechado ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              Escalar
            </button>
            <button
              onClick={() => setIsMercadoAberto(false)}
              className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                !isMercadoAberto
                  ? 'bg-white text-emerald-500 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 cursor-pointer'
              }`}
            >
              Ao Vivo
            </button>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm transition-colors duration-300 ${
              tempoRestante.fechado
                ? status === 'manutencao'
                  ? 'bg-amber-50 border-amber-200 text-amber-700' // Visual amarelo se estiver em manutenção
                  : 'bg-red-50 border-red-200 text-red-600' // Visual vermelho se fechado
                : 'bg-orange-50 border-orange-200 text-orange-700' // Visual laranja se rodando
            }`}
          >
            {tempoRestante.fechado ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                {/* 👇 2. Renderização Inteligente baseada no texto do status real da Globo */}
                <span className="font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
                  {status === 'manutencao' ? 'Manutenção' : 'Fechado'}
                </span>
              </>
            ) : (
              <>
                <svg
                  className="animate-pulse shrink-0"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <div className="flex flex-col whitespace-nowrap">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-600/70 leading-none mb-0.5">
                    Fecha em
                  </span>
                  <span className="font-black text-[13px] leading-none tabular-nums tracking-tight">
                    {tempoRestante.dias > 0 && `${tempoRestante.dias}d `}
                    {formatar(tempoRestante.horas)}:{formatar(tempoRestante.minutos)}:
                    {formatar(tempoRestante.segundos)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* TOOLBAR */}
        {isMercadoAberto && (
          <div className="flex flex-col w-full gap-3 md:w-auto md:shrink-0 md:flex-row md:items-center md:justify-end order-3 animate-fade-in">
            <div className="relative flex flex-col gap-1.5 md:w-[280px] lg:w-[320px]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                className="w-full py-2.5 pl-10 pr-4 text-sm font-semibold text-gray-900 transition-colors bg-gray-100 border-2 border-transparent shadow-sm rounded-xl outline-none focus:bg-white focus:border-orange-500 placeholder:text-gray-400"
                placeholder="Buscar jogador ou time..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:flex md:w-auto">
              <div className="flex flex-col gap-1.5">
                <select
                  className="w-full md:w-[180px] px-3.5 py-2.5 text-sm font-semibold text-gray-900 bg-gray-100 border-2 border-transparent rounded-xl appearance-none outline-none transition-colors focus:border-orange-500 focus:bg-white shadow-sm cursor-pointer bg-no-repeat bg-[position:right_12px_center]"
                  value={ordenacao}
                  onChange={(e) => setOrdenacao(e.target.value as 've' | 'margem' | 'pe')}
                >
                  <option value="ve">Val. Esperada</option>
                  <option value="margem">Margem de Seg.</option>
                  <option value="pe">Pont. Esperada</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <select
                  className="w-full md:w-[120px] px-3.5 py-2.5 text-sm font-semibold text-gray-900 bg-gray-100 border-2 border-transparent rounded-xl appearance-none outline-none transition-colors focus:border-orange-500 focus:bg-white shadow-sm cursor-pointer bg-no-repeat bg-[position:right_12px_center]"
                  value={formacao}
                  onChange={(e) => setFormacao(e.target.value)}
                >
                  <option value="4-3-3">4-3-3</option>
                  <option value="4-4-2">4-4-2</option>
                  <option value="3-4-3">3-4-3</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
