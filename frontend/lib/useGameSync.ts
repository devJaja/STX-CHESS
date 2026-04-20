import { useEffect, useRef } from 'react';
import { getGame } from './stacks';

/**
 * Polls get-game every `intervalMs` while a gameId is active.
 * Calls onUpdate with the raw chain data whenever it changes.
 */
export function useGameSync(
  gameId: number | null,
  onUpdate: (data: unknown) => void,
  intervalMs = 15_000,
) {
  const lastMovesRef = useRef<string>('');

  useEffect(() => {
    if (!gameId) return;

    async function poll() {
      const data = await getGame(gameId!);
      if (!data?.value) return;
      const movesJson = JSON.stringify(data.value.moves);
      if (movesJson !== lastMovesRef.current) {
        lastMovesRef.current = movesJson;
        onUpdate(data);
      }
    }

    poll();
    const id = setInterval(poll, intervalMs);
    return () => clearInterval(id);
  }, [gameId, onUpdate, intervalMs]);
}
