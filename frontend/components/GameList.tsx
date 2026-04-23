'use client';

import { useEffect, useState } from 'react';
import { getGame } from '@/lib/stacks';

interface GameListProps {
  userAddress: string;
  onSelect: (id: number) => void;
  activeGameId: number | null;
}

interface GameRow {
  id: number;
  status: string;
  isWhite: boolean;
  moveCount: number;
}

export default function GameList({ userAddress, onSelect, activeGameId }: GameListProps) {
  const [games, setGames] = useState<GameRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userAddress) return;
    setLoading(true);

    async function load() {
      // Fetch last 50 games and filter by player
      const { getGameCount } = await import('@/lib/stacks');
      const countRes = await getGameCount();
      const total = countRes?.value ? Number(countRes.value) : 0;
      const start = Math.max(1, total - 49);
      const ids = Array.from({ length: total - start + 1 }, (_, i) => start + i);

      const rows: GameRow[] = [];
      await Promise.all(ids.map(async id => {
        const data = await getGame(id);
        const v = (data as { value?: { white?: { value: string }; black?: { value: string }; status?: { value: string }; moves?: { value: unknown[] } } })?.value;
        if (!v) return;
        if (v.white?.value !== userAddress && v.black?.value !== userAddress) return;
        rows.push({
          id,
          status: v.status?.value ?? 'unknown',
          isWhite: v.white?.value === userAddress,
          moveCount: v.moves?.value?.length ?? 0,
        });
      }));

      rows.sort((a, b) => b.id - a.id);
      setGames(rows);
      setLoading(false);
    }

    load();
  }, [userAddress]);

  if (!userAddress) return null;

  const statusColor = (s: string) => {
    if (s === 'active') return '#4ade80';
    if (s === 'draw') return '#facc15';
    return 'var(--muted)';
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
        Your Games
      </h2>

      {loading && <p className="text-xs" style={{ color: 'var(--muted)' }}>Loading…</p>}

      {!loading && games.length === 0 && (
        <p className="text-xs" style={{ color: 'var(--muted)' }}>No games found.</p>
      )}

      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {games.map(g => (
          <button
            key={g.id}
            onClick={() => onSelect(g.id)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-opacity hover:opacity-80"
            style={{
              background: activeGameId === g.id ? 'var(--accent)' : 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: activeGameId === g.id ? '#fff' : 'var(--foreground)',
            }}
          >
            <span className="font-mono">#{g.id}</span>
            <span className="text-xs" style={{ color: activeGameId === g.id ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>
              {g.isWhite ? 'White' : 'Black'} · {g.moveCount} moves
            </span>
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.15)', color: statusColor(g.status) }}
            >
              {g.status}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
