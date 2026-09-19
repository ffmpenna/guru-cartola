import { createContext } from 'react';
import { useLineupManager } from '../hooks/useLineupManager';

export type EscalacaoState = ReturnType<typeof useLineupManager>['state'];
export type EscalacaoDispatch = ReturnType<typeof useLineupManager>['actions'];

export const EscalacaoStateContext = createContext<EscalacaoState | null>(null);
export const EscalacaoDispatchContext = createContext<EscalacaoDispatch | null>(null);
