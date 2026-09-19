import { useState, useEffect } from 'react';
import { useEscalacaoState, useEscalacaoDispatch } from '../hooks/useEscalacao';
import { ConfirmDialog } from './common/ConfirmDialog';
import { LineupSlot } from './lineup/LineupSlot';
import { mapaFormacao } from '../hooks/useLineupManager';

const nomesPosicoes: Record<number, string> = {
  1: 'Goleiro',
  2: 'Lateral',
  3: 'Zagueiro',
  4: 'Meia',
  5: 'Atacante',
  6: 'Técnico',
};

export function LineupPanel() {
  const {
    time,
    reservas,
    formacao,
    cartoletas,
    patrimonioTotal,
    capitao,
    modoBuscaReserva,
  } = useEscalacaoState();
  const {
    setPatrimonioTotal,
    removerJogador,
    removerReserva,
    limparTime,
    setCapitao,
    setModoBuscaReserva,
  } = useEscalacaoDispatch();

  const exigenciaTatica = mapaFormacao[formacao];

  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const [isEditingPatrimonio, setIsEditingPatrimonio] = useState(false);
  const [tempPatrimonio, setTempPatrimonio] = useState(patrimonioTotal.toString());

  const salvarPatrimonio = () => {
    const valorNumerico = parseFloat(tempPatrimonio.replace(',', '.'));
    if (!isNaN(valorNumerico) && valorNumerico > 0) {
      setPatrimonioTotal(valorNumerico);
    } else {
      setTempPatrimonio(patrimonioTotal.toString());
    }
    setIsEditingPatrimonio(false);
  };

  useEffect(() => {
    if (isMobileExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileExpanded]);

  const slotsDaFormacao = [];
  for (let pos = 1; pos <= 6; pos++) {
    const vagas = exigenciaTatica[pos];
    const escaladosNestaPosicao = time.filter((j) => j.posicao_id === pos);

    for (let i = 0; i < vagas; i++) {
      slotsDaFormacao.push({
        posicao_id: pos,
        nomePosicao: nomesPosicoes[pos],
        atleta: escaladosNestaPosicao[i] || null,
      });
    }
  }

  const slotsDoBanco = [];
  for (let pos = 1; pos <= 5; pos++) {
    const vagasTitular = exigenciaTatica[pos] || 0;
    if (vagasTitular > 0) {
      const reservaNestaPosicao = reservas.find((j) => j.posicao_id === pos);
      slotsDoBanco.push({
        posicao_id: pos,
        nomePosicao: nomesPosicoes[pos],
        atleta: reservaNestaPosicao || null,
      });
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isMobileExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileExpanded(false)}
      />

      {showConfirmClear && (
        <ConfirmDialog
          title="Zerar Prancheta?"
          description="Tem certeza que deseja vender todos os jogadores? O valor será estornado ao seu caixa."
          confirmText="Sim, Vender"
          onConfirm={() => {
            limparTime();
            setShowConfirmClear(false);
          }}
          onCancel={() => setShowConfirmClear(false)}
        />
      )}

      <aside className="fixed bottom-0 left-0 w-full z-50 bg-white rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:relative md:w-[400px] md:shadow-sm md:rounded-2xl md:border md:border-gray-200 md:sticky md:top-[95px] md:h-fit md:z-10">
        <div
          className="flex justify-center w-full pt-3 pb-1 cursor-pointer md:hidden"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        >
          <div className="w-10 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        <div
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="flex items-start justify-between px-5 pb-4 pt-1 border-b border-gray-100 md:bg-gray-50/50 md:rounded-t-2xl md:p-5 md:cursor-default"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="m-0 text-base font-bold text-gray-900">Seu Time</h3>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform duration-300 md:hidden ${isMobileExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 15l7-7 7 7"
                ></path>
              </svg>
            </div>
            <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
              {formacao}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 items-end">
            <div className="flex items-center gap-1.5 group">
              {isEditingPatrimonio ? (
                <input
                  type="number"
                  autoFocus
                  className="w-24 px-1 py-0.5 text-lg font-extrabold text-right text-orange-500 bg-orange-50 border border-orange-200 rounded outline-none max-md:text-base max-md:w-20 [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                  value={tempPatrimonio}
                  onChange={(e) => setTempPatrimonio(e.target.value)}
                  onBlur={salvarPatrimonio}
                  onKeyDown={(e) => e.key === 'Enter' && salvarPatrimonio()}
                  step="0.1"
                />
              ) : (
                <div
                  className="flex items-center gap-1 cursor-text"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTempPatrimonio(patrimonioTotal.toString());
                    setIsEditingPatrimonio(true);
                  }}
                  title="Editar Patrimônio Total"
                >
                  <span className="text-lg font-extrabold text-orange-500 leading-none hover:text-orange-600 transition-colors">
                    C$ {cartoletas.toFixed(2)}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-gray-300 cursor-pointer group-hover:text-gray-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <span className="text-[10px] font-semibold text-gray-400">
              {`${time.length}/12 Titulares • ${reservas.length}/${slotsDoBanco.length} Reservas`}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirmClear(true);
              }}
              className="bg-red-500 text-white shadow-md hover:bg-red-600 active:scale-95 cursor-pointer px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wide flex items-center gap-1.5"
            >
              Vender Todos
            </button>
          </div>
        </div>

        <div
          className={`transition-all duration-300 ease-in-out md:max-h-[85vh] overflow-hidden md:overflow-y-auto ${isMobileExpanded ? 'max-h-[75vh] overflow-y-auto' : 'max-h-0'}`}
        >
          <div className="p-3 pb-6 md:pb-4">
            {/* GRID TITULARES */}
            <div className="grid grid-cols-2 grid-rows-6 grid-flow-col gap-2.5 mb-4">
              {slotsDaFormacao.map((slot, index) => (
                <LineupSlot
                  key={`titular-${slot.posicao_id}-${index}`}
                  posicao_id={slot.posicao_id}
                  nomePosicao={slot.nomePosicao}
                  atleta={slot.atleta}
                  capitaoId={capitao}
                  onSetCapitao={setCapitao}
                  onRemoveJogador={removerJogador}
                />
              ))}
            </div>

            {/* BANCO DE RESERVAS */}
            <div className="pt-3 border-t border-gray-100">
              <h4 className="mb-3 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                Banco de Reservas
              </h4>
              <div
                className={`grid grid-cols-2 grid-flow-col gap-2.5 ${slotsDoBanco.length <= 4 ? 'grid-rows-2' : 'grid-rows-3'}`}
              >
                {slotsDoBanco.map((slot, index) => {
                  const titularesDaPosicao = time.filter(
                    (j) => j.posicao_id === slot.posicao_id,
                  );
                  const podeAdicionar = titularesDaPosicao.length > 0;
                  const isBuscandoEstaPosicao = modoBuscaReserva === slot.posicao_id;

                  return (
                    <LineupSlot
                      key={`reserva-${slot.posicao_id}-${index}`}
                      posicao_id={slot.posicao_id}
                      nomePosicao={slot.nomePosicao}
                      atleta={slot.atleta}
                      isReserva={true}
                      isBuscandoEstaPosicao={isBuscandoEstaPosicao}
                      podeAdicionarReserva={podeAdicionar}
                      onRemoveJogador={removerReserva}
                      onClickEmptyReserva={(posId) => {
                        setModoBuscaReserva(posId);
                        setIsMobileExpanded(false);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
