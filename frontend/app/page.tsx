'use client';

import { useState } from 'react';
import ChessBoard from '@/components/ChessBoard';
import WalletConnect from '@/components/WalletConnect';
import GameControls from '@/components/GameControls';
import ThemeToggle from '@/components/ThemeToggle';
import { UserSession } from '@stacks/connect';

export default function Home() {
  const [gameId, setGameId] = useState<number | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [pendingMove, setPendingMove] = useState<string>('');

  const handleConnect = (address: string, session: UserSession) => {
    setUserAddress(address);
    setUserSession(session);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">♟</span>
            <div>
              <span className="font-semibold text-base tracking-tight" style={{ color: 'var(--foreground)' }}>
                Stack Chess
              </span>
              <span
                className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                Bitcoin Layer 2
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <WalletConnect onConnect={handleConnect} />
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--foreground)' }}>
            Play Chess on Bitcoin
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Every move is recorded on the Stacks blockchain — trustless, permanent, verifiable.
          </p>
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <ChessBoard gameId={gameId} userAddress={userAddress} onMove={setPendingMove} />
          </div>
          <div>
            <GameControls
              gameId={gameId}
              setGameId={setGameId}
              userAddress={userAddress}
              userSession={userSession}
              pendingMove={pendingMove}
              setPendingMove={setPendingMove}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-6" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs" style={{ color: 'var(--muted)' }}>
          <span>Stack Chess — built on Stacks / Bitcoin</span>
          <a
            href="https://docs.stacks.co"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Stacks Docs ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
