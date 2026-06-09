// Hook untuk akses SwapContext.
//
//   const { state, addSwap } = useSwaps();
//   if (state.kind === 'loading') return <Spinner />;
//   const list = Object.values(state.swaps);

import { useContext } from 'react';
import { SwapContext } from './SwapProvider';

export function useSwaps() {
  const context = useContext(SwapContext);
  if (!context) {
    throw new Error('useSwaps() harus dipakai di dalam <SwapProvider>');
  }
  return context;
}
