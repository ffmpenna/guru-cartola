import { useContext } from 'react';
import {
  EscalacaoStateContext,
  EscalacaoDispatchContext,
} from '../contexts/EscalacaoContext';

export const useEscalacaoState = () => {
  const context = useContext(EscalacaoStateContext);
  if (!context)
    throw new Error('useEscalacaoState must be used within EscalacaoProvider');
  return context;
};

export const useEscalacaoDispatch = () => {
  const context = useContext(EscalacaoDispatchContext);
  if (!context)
    throw new Error('useEscalacaoDispatch must be used within EscalacaoProvider');
  return context;
};
