'use client';

import { useEffect, useState } from 'react';

interface MoveTimerProps {
  isActive: boolean;
  turnColor: 'w' | 'b';
}

export default function MoveTimer({ isActive, turnColor }: MoveTimerProps) {
  const [whiteSeconds, setWhiteSeconds] = useState(0);
  const [blackSeconds, setBlackSeconds] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      if (turnColor === 'w') setWhiteSeconds(s => s + 1);
      else setBlackSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isActive, turnColor]);

  function fmt(s: number) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  }

  const active = (color: 'w' | 'b') => isActive && turnColor === color;

  return (
    <div className="flex gap-2">
      {(['b', 'w'] as const).map(color => (
        <div
          key={color}
          className="flex-1 flex items-center justify-between px-3 py-2 rounded-lg text-sm font-mono"
          style={{
            background: active(color) ? 'var(--accent)' : 'var(--surface-2)',
            border: `1px solid ${active(color) ? 'var(--accent)' : 'var(--border)'}`,
            color: active(color) ? '#fff' : 'var(--foreground)',
            transition: 'all 0.2s',
          }}
        >
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: color === 'w' ? '#f0d9b5' : '#3d2b1f', border: '1.5px solid var(--border)' }}
            />
            {color === 'w' ? 'White' : 'Black'}
          </span>
          <span>{fmt(color === 'w' ? whiteSeconds : blackSeconds)}</span>
        </div>
      ))}
    </div>
  );
}
