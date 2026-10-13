import { useEscalacaoState, useEscalacaoDispatch } from '../hooks/useEscalacao';
import { useMarketTimer } from '../hooks/useMarketTimer';
import { useTheme } from '../hooks/useTheme';
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
  const { theme, toggleTheme } = useTheme();

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
    <header className="relative md:fixed top-0 left-0 z-30 w-full px-6 py-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm md:px-12 transition-colors duration-300">
      {/* 👇 1. Adicionamos 'relative' aqui para ancorar o botão no mobile */}
      <div className="relative max-w-[1400px] mx-auto flex flex-wrap md:flex-nowrap items-center justify-between gap-y-4 md:gap-8 w-full">
        {/* LOGO */}
        <div className="flex items-center gap-3 shrink-0 order-1">
          <div className="flex items-center justify-center w-10 h-10 text-white bg-gray-800 rounded-xl shadow-sm">
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
            <h1 className="m-0 text-xl font-black tracking-tighter leading-none text-gray-900 dark:text-gray-100">
              Mercado<span className="text-orange-500">PRO</span>
            </h1>
            <span className="mt-0.5 text-[10px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase">
              {rodada_atual ? `Rodada ${rodada_atual} • 2026` : 'Scout Avançado'}
            </span>
          </div>
        </div>

        {/* NAVEGAÇÃO E CRONÔMETRO */}
        <div className="flex items-center shrink-0 order-2 md:flex-1 md:justify-center gap-3 w-full md:w-auto">
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/60 shadow-inner">
            <button
              onClick={() => setIsMercadoAberto(true)}
              disabled={tempoRestante.fechado}
              className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                isMercadoAberto
                  ? 'bg-white dark:bg-gray-700 text-orange-500 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              } ${tempoRestante.fechado ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              Escalar
            </button>
            <button
              onClick={() => setIsMercadoAberto(false)}
              className={`px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                !isMercadoAberto
                  ? 'bg-white dark:bg-gray-700 text-emerald-500 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer'
              }`}
            >
              Ao Vivo
            </button>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm transition-colors duration-300 ${
              tempoRestante.fechado
                ? status === 'manutencao'
                  ? 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                  : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                : 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300'
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
                className="w-full py-2.5 pl-10 pr-4 text-sm font-semibold text-gray-900 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:placeholder:text-gray-500 bg-gray-100 border-2 border-transparent shadow-sm rounded-xl outline-none dark:focus:bg-gray-900 focus:bg-white focus:border-orange-500 placeholder:text-gray-400"
                placeholder="Buscar jogador ou time..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 md:flex md:w-auto">
              <div className="flex flex-col gap-1.5">
                <select
                  className="w-full md:w-[180px] px-3.5 py-2.5 text-sm font-semibold text-gray-900 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-2 border-transparent rounded-xl appearance-none outline-none transition-colors dark:focus:border-orange-500 dark:focus:bg-gray-900 focus:border-orange-500 focus:bg-white shadow-sm cursor-pointer bg-no-repeat bg-[position:right_12px_center]"
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
                  className="w-full md:w-[120px] px-3.5 py-2.5 text-sm font-semibold text-gray-900 dark:bg-gray-800 dark:text-gray-300 bg-gray-100 border-2 border-transparent rounded-xl appearance-none outline-none transition-colors dark:focus:border-orange-500 dark:focus:bg-gray-900 focus:border-orange-500 focus:bg-white shadow-sm cursor-pointer bg-no-repeat bg-[position:right_12px_center]"
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

        {/* 👇 2. BOTÃO DE TEMA (Flutuante no mobile, na linha da Toolbar no desktop) */}
        <button
          onClick={toggleTheme}
          className="absolute top-0.5 right-0 md:static md:order-4 flex items-center justify-center w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200/60 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer shrink-0 z-10"
          title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        >
          {theme === 'dark' ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
