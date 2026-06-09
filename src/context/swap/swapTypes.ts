// State + action types untuk SwapContext.
//
// Mirip pattern ShiftContext: discriminated union state ('loading' | 'ready').
// Shape data: Record<id, SwapRecord> — keyed by swap id (bukan tanggal),
// karena 1 user bisa punya banyak swap untuk shift yang sama.

import type { SwapRecord, SwapStatus } from '@/types/swap';

export type SwapMap = Record<string, SwapRecord>;

export type SwapState =
  | { kind: 'loading' }
  | { kind: 'ready'; swaps: SwapMap };

export type SwapAction =
  | { type: 'SWAPS_LOADED'; payload: SwapMap }
  | { type: 'SWAP_ADDED'; payload: SwapRecord }
  | { type: 'SWAP_STATUS_UPDATED'; payload: { id: string; status: SwapStatus } }
  | { type: 'SWAP_MARKED_APPLIED'; payload: { id: string } }
  | { type: 'SWAP_REMOVED'; payload: { id: string } }
  | { type: 'SWAPS_CLEARED' };
