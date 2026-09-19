import { useState } from 'react';
import type { ReactNode } from 'react';
import { useLineupManager } from '../hooks/useLineupManager';
import { EscalacaoStateContext, EscalacaoDispatchContext } from './EscalacaoContext';

export function EscalacaoProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ texto: string; tipo: 'erro' | 'sucesso' } | null>(
    null,
  );

  const showToast = (texto: string, tipo: 'erro' | 'sucesso' = 'erro') => {
    setToast({ texto, tipo });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const { state, actions } = useLineupManager(showToast);

  return (
    <EscalacaoDispatchContext.Provider value={actions}>
      <EscalacaoStateContext.Provider value={state}>
        {children}
        <div
          className={`fixed md:bottom-10 bottom-35 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl border font-semibold pointer-events-none max-w-[90vw] text-center text-sm md:text-lg
            ${toast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}
            ${toast?.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-500 border-red-200'}
          `}
        >
          {toast?.texto}
        </div>
      </EscalacaoStateContext.Provider>
    </EscalacaoDispatchContext.Provider>
  );
}
