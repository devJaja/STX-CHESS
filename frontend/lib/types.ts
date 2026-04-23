import { UserSession } from '@stacks/connect';

export interface GameState {
  gameId: number | null;
  userAddress: string;
  userSession: UserSession | null;
  pendingMove: string;
}

export interface OnChainGame {
  white: { value: string };
  black: { value: string };
  'current-turn': { value: string };
  status: { value: string };
  winner: { type: 'none' } | { type: 'some'; value: { value: string } };
  moves: { value: { value: string }[] };
  'draw-offered-by': { type: 'none' } | { type: 'some'; value: { value: string } };
  'created-at': { value: string };
  'ended-at': { type: 'none' } | { type: 'some'; value: { value: string } };
}
