'use client';

import { useEffect, useState, useCallback } from 'react';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK, getGameCount } from '@/lib/stacks';

export default function StatusBar() {
  const isMainnet = NETWORK.isMainnet();
  const network = isMainnet ? 'Mainnet' : 'Testnet';
  const [gameCount, setGameCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!CONTRACT_ADDRESS) return;
    setLoading(true);
    getGameCount()
      .then(res => { if (res?.value != null) setGameCount(Number(res.value)); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <div
      className="flex items-center gap-4 px-4 py-2 rounded-xl text-xs font-mono"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)' }}
    >
      <span className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse"
          style={{ background: isMainnet ? '#4ade80' : '#facc15' }}
        />
        {network}
      </span>
      <span className="opacity-30">|</span>
      <span className="truncate">
        {CONTRACT_ADDRESS
          ? `${CONTRACT_ADDRESS.slice(0, 8)}…${CONTRACT_ADDRESS.slice(-4)}.${CONTRACT_NAME}`
          : <span style={{ color: '#f87171' }}>⚠ Set NEXT_PUBLIC_CONTRACT_ADDRESS</span>
        }
      </span>
      {gameCount !== null && (
        <>
          <span className="opacity-30">|</span>
          <span>{gameCount} game{gameCount !== 1 ? 's' : ''} on-chain</span>
        </>
      )}
      <button
        onClick={refresh}
        disabled={loading}
        aria-label="Refresh game count"
        className="opacity-50 hover:opacity-100 transition-opacity disabled:opacity-20 ml-auto"
      >
        ↻
      </button>
    </div>
  );
}
