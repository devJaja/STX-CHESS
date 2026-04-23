'use client';

import { useState, useCallback } from 'react';
import { UserSession } from '@stacks/connect';
import { useLeather } from '@/lib/useLeather';
import { CONTRACT_ADDRESS, CONTRACT_NAME, getGameCount } from '@/lib/stacks';
import { toast } from './Toast';

// ── Types ────────────────────────────────────────────────────

interface GameControlsProps {
  gameId: number | null;
  setGameId: (id: number | null) => void;
  userAddress: string;
  userSession: UserSession | null;
  pendingMove: string;
  setPendingMove: (move: string) => void;
}

type BtnVariant = 'primary' | 'danger' | 'ghost' | 'warning';

// ── Sub-components ───────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>
      {children}
    </p>
  );
}

function Btn({
  onClick, disabled, variant = 'primary', children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: BtnVariant;
  children: React.ReactNode;
}) {
  const styles: Record<BtnVariant, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#fff' },
    danger:  { background: 'transparent', color: '#f87171', border: '1px solid #f87171' },
    ghost:   { background: 'var(--surface-2)', color: 'var(--foreground)', border: '1px solid var(--border)' },
    warning: { background: 'transparent', color: '#facc15', border: '1px solid #facc15' },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
      style={styles[variant]}
    >
      {children}
    </button>
  );
}

function JoinGame({ onJoin }: { onJoin: (id: number) => void }) {
  const [value, setValue] = useState('');
  return (
    <div className="flex gap-2">
      <input
        type="number"
        min={1}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Game ID"
        className="flex-1 text-sm px-3 py-2.5 rounded-lg outline-none"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
      />
      <button
        onClick={() => { const id = parseInt(value); if (id > 0) onJoin(id); }}
        disabled={!value || parseInt(value) < 1}
        className="px-4 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
      >
        Join
      </button>
    </div>
  );
}

// ── Error handler ────────────────────────────────────────────

type AppError = { error?: { code?: number; message?: string }; message?: string };

function handleError(err: unknown) {
  const e = err as AppError;
  if (e?.error?.code === 4001) return; // user rejected
  const msg = e?.error?.message ?? e?.message ?? 'Unknown error';
  toast(`Error: ${msg}`, 'error');
}

// ── Main Component ───────────────────────────────────────────

export default function GameControls({
  gameId, setGameId, userAddress, userSession, pendingMove, setPendingMove,
}: GameControlsProps) {
  const [opponentAddress, setOpponentAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { callContract } = useLeather();

  const createGame = useCallback(async () => {
    if (!userAddress || !userSession) return toast('Connect your wallet first', 'error');
    if (!opponentAddress.trim()) return toast('Enter opponent address', 'error');
    setLoading(true);
    try {
      const res = await callContract({ functionName: 'create-game', functionArgs: [`'${opponentAddress.trim()}`] });
      if (res?.result?.txid) {
        toast(`Game created! TX: ${res.result.txid.slice(0, 10)}…`, 'success');
        await new Promise(r => setTimeout(r, 5000));
        const countRes = await getGameCount();
        const id = countRes?.value ? Number(countRes.value) : 1;
        setGameId(id);
      }
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  }, [userAddress, userSession, opponentAddress, callContract, setGameId]);

  const submitMove = useCallback(async () => {
    if (!userAddress || !userSession || !gameId || !pendingMove) return;
    setLoading(true);
    try {
      const res = await callContract({ functionName: 'make-move', functionArgs: [`u${gameId}`, `"${pendingMove}"`] });
      if (res?.result?.txid) {
        toast(`Move submitted! TX: ${res.result.txid.slice(0, 10)}…`, 'success');
        setPendingMove('');
      }
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  }, [userAddress, userSession, gameId, pendingMove, callContract, setPendingMove]);

  const endGame = useCallback(async (winnerColor: 'white' | 'black') => {
    if (!userAddress || !userSession || !gameId) return;
    if (!confirm(`Declare ${winnerColor} as winner?`)) return;
    setLoading(true);
    try {
      const res = await callContract({ functionName: 'end-game', functionArgs: [`u${gameId}`, `"${winnerColor}"`] });
      if (res?.result?.txid) {
        toast(`Game ended! TX: ${res.result.txid.slice(0, 10)}…`, 'success');
        setGameId(null);
      }
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  }, [userAddress, userSession, gameId, callContract, setGameId]);

  const resign = useCallback(async () => {
    if (!userAddress || !userSession || !gameId) return;
    if (!confirm('Resign this game?')) return;
    setLoading(true);
    try {
      const res = await callContract({ functionName: 'resign', functionArgs: [`u${gameId}`] });
      if (res?.result?.txid) {
        toast(`Resigned. TX: ${res.result.txid.slice(0, 10)}…`, 'info');
        setGameId(null);
      }
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  }, [userAddress, userSession, gameId, callContract, setGameId]);

  const offerDraw = useCallback(async () => {
    if (!userAddress || !userSession || !gameId) return;
    setLoading(true);
    try {
      const res = await callContract({ functionName: 'offer-draw', functionArgs: [`u${gameId}`] });
      if (res?.result?.txid) toast('Draw offered!', 'info');
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  }, [userAddress, userSession, gameId, callContract]);

  const acceptDraw = useCallback(async () => {
    if (!userAddress || !userSession || !gameId) return;
    setLoading(true);
    try {
      const res = await callContract({ functionName: 'accept-draw', functionArgs: [`u${gameId}`] });
      if (res?.result?.txid) {
        toast('Draw accepted!', 'success');
        setGameId(null);
      }
    } catch (err) { handleError(err); }
    finally { setLoading(false); }
  }, [userAddress, userSession, gameId, callContract, setGameId]);

  const copyGameLink = useCallback(() => {
    if (!gameId) return;
    const url = `${window.location.origin}?game=${gameId}`;
    navigator.clipboard.writeText(url).then(() => toast('Game link copied!', 'success'));
  }, [gameId]);

  return (
    <div
      className="rounded-2xl p-5 space-y-5"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div>
        <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>Game Controls</h2>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
          {gameId ? `Active game #${gameId}` : 'No active game'}
        </p>
      </div>

      <hr style={{ borderColor: 'var(--border)' }} />

      {!gameId ? (
        <div className="space-y-4">
          <div>
            <Label>New Game</Label>
            <input
              type="text"
              value={opponentAddress}
              onChange={e => setOpponentAddress(e.target.value)}
              placeholder="Opponent STX address"
              className="w-full text-sm px-3 py-2.5 rounded-lg outline-none mb-3"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            />
            <Btn onClick={createGame} disabled={loading || !userAddress}>
              {loading ? 'Creating…' : 'Create Game'}
            </Btn>
          </div>
          <div>
            <Label>Join Existing Game</Label>
            <JoinGame onJoin={setGameId} />
          </div>
        </div>
      ) : (
        <>
          {pendingMove && (
            <div>
              <Label>Pending Move</Label>
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-mono"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              >
                <span>{pendingMove}</span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>not on-chain yet</span>
              </div>
            </div>
          )}

          <div>
            <Label>Actions</Label>
            <div className="space-y-2">
              <Btn onClick={submitMove} disabled={loading || !pendingMove}>
                {loading ? 'Submitting…' : 'Submit Move On-Chain'}
              </Btn>
              <Btn onClick={() => endGame('white')} disabled={loading} variant="ghost">Declare White Wins</Btn>
              <Btn onClick={() => endGame('black')} disabled={loading} variant="ghost">Declare Black Wins</Btn>
              <Btn onClick={offerDraw} disabled={loading} variant="warning">Offer Draw</Btn>
              <Btn onClick={acceptDraw} disabled={loading} variant="warning">Accept Draw</Btn>
              <Btn onClick={resign} disabled={loading} variant="danger">Resign</Btn>
            </div>
          </div>

          <div>
            <Label>Share</Label>
            <Btn onClick={copyGameLink} variant="ghost">Copy Game Link</Btn>
          </div>

          <Btn onClick={() => setGameId(null)} variant="danger">Leave Game</Btn>
        </>
      )}

      <div className="pt-1">
        <hr style={{ borderColor: 'var(--border)', marginBottom: '0.75rem' }} />
        <Label>Contract</Label>
        <p className="text-xs font-mono break-all" style={{ color: 'var(--muted)' }}>
          {CONTRACT_ADDRESS}.{CONTRACT_NAME}
        </p>
      </div>
    </div>
  );
}
