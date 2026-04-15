'use client';

import { useState } from 'react';
import { UserSession } from '@stacks/connect';
import ChessBoard from '@/components/ChessBoard';
import WalletConnect from '@/components/WalletConnect';
import GameControls from '@/components/GameControls';
import ThemeToggle from '@/components/ThemeToggle';
import StatusBar from '@/components/StatusBar';

export default function Home() {
  const [gameId, setGameId]         = useState<number | null>(null);
  const [userAddress, setUserAddress] = useState('');
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [pendingMove, setPendingMove] = useState('');

  const handleConnect = (address: string, session: UserSession) => {
    setUserAddress(address);
    setUserSession(session);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>

      {/* ── Navbar ── */}
      <nav
        className="sticky top-0 z-50 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl leading-none">♟</span>
            <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--foreground)' }}>
              Stack Chess
            </span>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full hidden sm:inline"
              style={{ background: 'var(--surface-2)', color: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              Bitcoin L2
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <WalletConnect onConnect={handleConnect} />
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">

        {/* Hero */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--foreground)' }}>
            Play Chess on Bitcoin
          </h1>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
            Every move is recorded on the Stacks blockchain — trustless, permanent, verifiable.
          </p>
          <StatusBar />
        </div>

        {/* Board + controls */}
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

      {/* ── Footer ── */}
      <footer className="border-t py-5" style={{ borderColor: 'var(--border)' }}>
        <div
          className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs"
          style={{ color: 'var(--muted)' }}
        >
          <span>Stack Chess — built on Stacks / Bitcoin</span>
          <a
            href="https://docs.stacks.co"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-opacity hover:opacity-80"
            style={{ color: 'var(--accent)' }}
          >
            Stacks Docs ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
