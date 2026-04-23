'use client';

import { useState, useEffect } from 'react';
import { UserSession } from '@stacks/connect';
import ChessBoard from '@/components/ChessBoard';
import WalletConnect from '@/components/WalletConnect';
import GameControls from '@/components/GameControls';
import ThemeToggle from '@/components/ThemeToggle';
import StatusBar from '@/components/StatusBar';
import GameList from '@/components/GameList';
import MoveTimer from '@/components/MoveTimer';
import { ToastContainer } from '@/components/Toast';

export default function Home() {
  const [gameId, setGameId]           = useState<number | null>(null);
  const [userAddress, setUserAddress] = useState('');
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [pendingMove, setPendingMove] = useState('');
  const [flipped, setFlipped]         = useState(false);
  const [turnColor, setTurnColor]     = useState<'w' | 'b'>('w');
  const [gameOver, setGameOver]       = useState(false);

  // Read ?game=N from URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('game');
    if (id && Number(id) > 0) setGameId(Number(id));
  }, []);

  const handleConnect = (address: string, session: UserSession) => {
    setUserAddress(address);
    setUserSession(session);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      <ToastContainer />

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
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1" style={{ color: 'var(--foreground)' }}>
            Play Chess on Bitcoin
          </h1>
          <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
            Every move is recorded on the Stacks blockchain — trustless, permanent, verifiable.
          </p>
          <StatusBar />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2 space-y-3">
            {/* Board flip button */}
            {gameId && (
              <div className="flex justify-end">
                <button
                  onClick={() => setFlipped(f => !f)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-70"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)' }}
                >
                  ⇅ Flip Board
                </button>
              </div>
            )}
            <ChessBoard
              gameId={gameId}
              userAddress={userAddress}
              onMove={setPendingMove}
              onTurnChange={(turn, over) => { setTurnColor(turn); setGameOver(over); }}
              flipped={flipped}
            />
            {gameId && (
              <MoveTimer isActive={!gameOver} turnColor={turnColor} />
            )}
          </div>

          <div className="space-y-4">
            <GameControls
              gameId={gameId}
              setGameId={setGameId}
              userAddress={userAddress}
              userSession={userSession}
              pendingMove={pendingMove}
              setPendingMove={setPendingMove}
            />
            {userAddress && (
              <GameList
                userAddress={userAddress}
                onSelect={setGameId}
                activeGameId={gameId}
              />
            )}
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
