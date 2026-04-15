import { UserSession } from '@stacks/connect';

export interface GameState {
  gameId: number | null;
  userAddress: string;
  userSession: UserSession | null;
  pendingMove: string;
}
