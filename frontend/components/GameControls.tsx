'use client';

import { useState } from 'react';
import { UserSession } from '@stacks/connect';
import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from '@/lib/stacks';

interface GameControlsProps {
  gameId: number | null;
  setGameId: (id: number | null) => void;
  userAddress: string;
  userSession: UserSession | null;
  pendingMove: string;
  setPendingMove: (move: string) => void;
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest mb-1.5" style={{ color: 'var(--muted)' }}>
        {label}
      </p>
      {children}
    </div>
  );
}

function Btn({
  onClick, disabled, variant = 'primary', children,
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'ghost';
  children: React.ReactNode;
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#fff' },
    danger: { background: 'transparent', color: '#f87171', border: '1px solid #f87171' },
    ghost: { background: 'var(--surface-2)', color: 'var(--foreground)', border: '1px solid var(--border)' },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
      style={styles[variant]}
    >
      {children}
    </button>
  );
}

export default function GameControls({
  gameId, setGameId, userAddress, userSession, pendingMove, setPendingMove,
}: GameControlsProps) {
  const [opponentAddress, setOpponentAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const createGame = async () => {
    if (!userAddress || !userSession) return alert('Connect your wallet first');
    if (!opponentAddress) return alert('Enter opponent address');
    if (!(window as any).LeatherProvider) return alert('Leather wallet not detected');

    setLoading(true);
    try {
      const response = await (window as any).LeatherProvider.request('stx_callContract', {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: 'create-game',
        functionArgs: [`'${opponentAddress}`],
        network: NETWORK.isMainnet() ? 'mainnet' : 'testnet',
      });
      if (response?.result?.txid) {
        alert(`Game created! TX: ${response.result.txid}`);
        setGameId(1);
      }
    } catch (error: any) {
      if (error?.error?.code !== 4001) alert(`Error: ${error?.error?.message || error?.message || 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const submitMove = async () => {
    if (!userAddress || !userSession || !gameId || !pendingMove) return;
    if (!(window as any).LeatherProvider) return alert('Leather wallet not detected');

    setLoading(true);
    try {
      const response = await (window as any).LeatherProvider.request('stx_callContract', {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: 'make-move',
        functionArgs: [`u${gameId}`, `"${pendingMove}"`],
        network: NETWORK.isMainnet() ? 'mainnet' : 'testnet',
      });
      if (response?.result?.txid) {
        alert(`Move submitted! TX: ${response.result.txid}`);
        setPendingMove('');
      }
    } catch (error: any) {
      if (error?.error?.code !== 4001) alert(`Error: ${error?.error?.message || error?.message || 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

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

      <div className="border-t" style={{ borderColor: 'var(--border)' }} />

      {!gameId ? (
        <Section label="New Game">
          <input
            type="text"
            value={opponentAddress}
            onChange={e => setOpponentAddress(e.target.value)}
            placeholder="Opponent STX address"
            className="w-full text-sm px-3 py-2.5 rounded-lg outline-none mb-3 transition-colors"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
            }}
          />
          <Btn onClick={createGame} disabled={loading || !userAddress}>
            {loading ? 'Creating…' : 'Create Game'}
          </Btn>
        </Section>
      ) : (
        <>
          {pendingMove && (
            <Section label="Pending Move">
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-mono"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              >
                <span>{pendingMove}</span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>not yet on-chain</span>
              </div>
            </Section>
          )}

          <Section label="Actions">
            <div className="space-y-2">
              <Btn onClick={submitMove} disabled={loading || !pendingMove}>
                {loading ? 'Submitting…' : 'Submit Move On-Chain'}
              </Btn>
              <Btn onClick={() => setGameId(null)} variant="danger">
                Leave Game
              </Btn>
            </div>
          </Section>
        </>
      )}

      {/* Contract info */}
      <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs mb-1 font-medium uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Contract</p>
        <p className="text-xs font-mono break-all" style={{ color: 'var(--muted)' }}>
          {CONTRACT_ADDRESS}.{CONTRACT_NAME}
        </p>
      </div>
    </div>
  );
}
