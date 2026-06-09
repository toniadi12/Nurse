// Pure reducer untuk SwapContext.

import type { SwapAction, SwapMap, SwapState } from './swapTypes';

export const initialSwapState: SwapState = { kind: 'loading' };

export function swapReducer(
  state: SwapState,
  action: SwapAction,
): SwapState {
  switch (action.type) {
    case 'SWAPS_LOADED':
      return { kind: 'ready', swaps: action.payload };

    case 'SWAP_ADDED': {
      if (state.kind === 'loading') return state;
      return {
        kind: 'ready',
        swaps: { ...state.swaps, [action.payload.id]: action.payload },
      };
    }

    case 'SWAP_STATUS_UPDATED': {
      if (state.kind === 'loading') return state;
      const existing = state.swaps[action.payload.id];
      if (!existing) return state;
      return {
        kind: 'ready',
        swaps: {
          ...state.swaps,
          [action.payload.id]: {
            ...existing,
            status: action.payload.status,
            resolvedAt: Date.now(),
          },
        },
      };
    }

    case 'SWAP_MARKED_APPLIED': {
      if (state.kind === 'loading') return state;
      const existing = state.swaps[action.payload.id];
      if (!existing) return state;
      return {
        kind: 'ready',
        swaps: {
          ...state.swaps,
          [action.payload.id]: { ...existing, applied: true },
        },
      };
    }

    case 'SWAP_REMOVED': {
      if (state.kind === 'loading') return state;
      const { [action.payload.id]: _removed, ...rest } = state.swaps;
      return { kind: 'ready', swaps: rest };
    }

    case 'SWAPS_CLEARED':
      return { kind: 'ready', swaps: {} };

    default:
      return state;
  }
}
