import { useEffect, useRef } from 'react';
import { getGame } from './stacks';

/**
 * Polls get-game every `intervalMs` while a gameId is active.
 * Calls onUpdate with the raw chain data whenever the move list changes.
 * Stops polling automatically when the game is finished/resigned/draw.
 */
export function useGameSync(
  gameId: number | null,
  onUpdate: (data: unknown) => void,
  intervalMs = 12_000,
) {
  const lastMovesRef = useRef<string>('');

  useEffect(() => {
    if (!gameId) return;

    async function poll() {
      const data = await getGame(gameId!);
      if (!data?.value) return;

      const status = (data.value as { status?: { value: string } }).status?.value;
      const movesJson = JSON.stringify((data.value as { moves?: unknown }).moves);

      if (movesJson !== lastMovesRef.current) {
        lastMovesRef.current = movesJson;
        onUpdate(data);
      }

      // Stop polling if game is over
      if (status && status !== 'active') clearInterval(id);
    }

    poll();
    const id = setInterval(poll, intervalMs);
    return () => clearInterval(id);
  }, [gameId, onUpdate, intervalMs]);
}
