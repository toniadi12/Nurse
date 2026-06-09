// SwapProvider — sumber riwayat tukar shift.
//
// Di-wrap di app/_layout.tsx (root level), sejajar dengan ShiftProvider.
// Alasan: Tab Tukar (F8) butuh akses, dan wizard /swap/new.tsx juga butuh.

import React, {
  createContext,
  useCallback,
  useEffect,
  useReducer,
} from 'react';
import { storage } from '@/lib/storage';
import type { SwapRecord, SwapStatus } from '@/types/swap';
import { initialSwapState, swapReducer } from './swapReducer';
import type { SwapMap, SwapState } from './swapTypes';

const STORAGE_KEY = 'jaga:swaps:v1';

interface SwapContextValue {
  state: SwapState;
  addSwap: (swap: SwapRecord) => void;
  updateSwapStatus: (id: string, status: SwapStatus) => void;
  markSwapApplied: (id: string) => void;
  removeSwap: (id: string) => void;
  clearSwaps: () => void;
}

export const SwapContext = createContext<SwapContextValue | null>(null);

export function SwapProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(swapReducer, initialSwapState);

  useEffect(() => {
    storage.get<SwapMap>(STORAGE_KEY).then((loaded) => {
      dispatch({ type: 'SWAPS_LOADED', payload: loaded ?? {} });
    });
  }, []);

  useEffect(() => {
    if (state.kind === 'ready') {
      storage.set(STORAGE_KEY, state.swaps);
    }
  }, [state]);

  const addSwap = useCallback((swap: SwapRecord) => {
    dispatch({ type: 'SWAP_ADDED', payload: swap });
  }, []);

  const updateSwapStatus = useCallback((id: string, status: SwapStatus) => {
    dispatch({ type: 'SWAP_STATUS_UPDATED', payload: { id, status } });
  }, []);

  const markSwapApplied = useCallback((id: string) => {
    dispatch({ type: 'SWAP_MARKED_APPLIED', payload: { id } });
  }, []);

  const removeSwap = useCallback((id: string) => {
    dispatch({ type: 'SWAP_REMOVED', payload: { id } });
  }, []);

  const clearSwaps = useCallback(() => {
    dispatch({ type: 'SWAPS_CLEARED' });
  }, []);

  return (
    <SwapContext.Provider
      value={{
        state,
        addSwap,
        updateSwapStatus,
        markSwapApplied,
        removeSwap,
        clearSwaps,
      }}
    >
      {children}
    </SwapContext.Provider>
  );
}
