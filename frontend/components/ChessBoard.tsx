'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import { getGame } from '@/lib/stacks';
import { useGameSync } from '@/lib/useGameSync';
import CapturedPieces from './CapturedPieces';

// ── Types ────────────────────────────────────────────────────

interface ChessBoardProps {
  gameId: number | null;
  userAddress: string;
  onMove: (move: string) => void;
  onTurnChange?: (turn: 'w' | 'b', isOver: boolean) => void;
  flipped?: boolean;
}

// ── Constants ────────────────────────────────────────────────

const PIECE_GLYPHS: Record<string, string> = {
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
};

const LIGHT_SQ = '#f0d9b5';
const DARK_SQ  = '#b58863';
const SEL_BG   = 'rgba(99,102,241,0.45)';
const DOT_BG   = 'rgba(99,102,241,0.45)';
const RING_CLR = 'rgba(99,102,241,0.6)';
const LAST_BG  = 'rgba(234,179,8,0.25)';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

// ── Helpers ──────────────────────────────────────────────────

function toSquareName(row: number, col: number): Square {
  return (FILES[col] + (8 - row)) as Square;
}

function pieceKey(sq: { type: string; color: string }): string {
  return sq.color === 'w' ? sq.type.toUpperCase() : sq.type;
}

function getCaptured(game: Chess): { white: string[]; black: string[] } {
  const initial: Record<string, number> = { p: 8, r: 2, n: 2, b: 2, q: 1 };
  const onBoard: Record<string, number> = {};
  game.board().flat().forEach(sq => {
    if (!sq) return;
    const key = sq.type;
    onBoard[`${sq.color}${key}`] = (onBoard[`${sq.color}${key}`] ?? 0) + 1;
  });

  const white: string[] = []; // pieces captured by white (black pieces missing)
  const black: string[] = []; // pieces captured by black (white pieces missing)

  Object.entries(initial).forEach(([type, count]) => {
    const bMissing = count - (onBoard[`b${type}`] ?? 0);
    const wMissing = count - (onBoard[`w${type}`] ?? 0);
    for (let i = 0; i < bMissing; i++) white.push(type);
    for (let i = 0; i < wMissing; i++) black.push(type.toUpperCase());
  });

  return { white, black };
}

// ── Component ────────────────────────────────────────────────

export default function ChessBoard({ gameId, onMove, onTurnChange, flipped = false }: ChessBoardProps) {
  const [game, setGame]               = useState(() => new Chess());
  const [selected, setSelected]       = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [lastMove, setLastMove]       = useState<[Square, Square] | null>(null);

  function applyChainData(data: unknown) {
    const d = data as { value?: { moves?: { value: { value: string }[] } } };
    if (!d?.value) return;
    const moves = d.value.moves?.value ?? [];
    const g = new Chess();
    moves.forEach((m: { value: string }) => {
      const s = m.value;
      try {
        g.move({ from: s.slice(0, 2) as Square, to: s.slice(2, 4) as Square, promotion: s[4] || undefined });
      } catch { /* skip invalid stored move */ }
    });
    setGame(g);
    setMoveHistory(g.history());
    const hist = g.history({ verbose: true });
    if (hist.length > 0) {
      const last = hist[hist.length - 1];
      setLastMove([last.from as Square, last.to as Square]);
    }
    onTurnChange?.(g.turn(), g.isGameOver());
  }

  // applyChainData is intentionally excluded — it's defined inline and stable
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!gameId) {
      setGame(new Chess());
      setMoveHistory([]);
      setSelected(null);
      setLegalTargets([]);
      setLastMove(null);
      return;
    }
    getGame(gameId).then(applyChainData);
  }, [gameId]);

  useGameSync(gameId, applyChainData);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setSelected(null); setLegalTargets([]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSquareClick = useCallback((row: number, col: number) => {
    const sq = toSquareName(row, col);

    if (selected) {
      try {
        const copy = new Chess(game.fen());
        const piece = copy.get(selected);
        const toRank = sq[1];
        const isPromotion = piece?.type === 'p' && (toRank === '8' || toRank === '1');
        const result = copy.move({ from: selected, to: sq, promotion: isPromotion ? 'q' : undefined });
        if (result) {
          setGame(copy);
          setMoveHistory(copy.history());
          setLastMove([selected, sq]);
          setSelected(null);
          setLegalTargets([]);
          onMove(selected + sq + (isPromotion ? 'q' : ''));
          onTurnChange?.(copy.turn(), copy.isGameOver());
          return;
        }
      } catch { /* illegal move — fall through to re-select */ }
    }

    setSelected(sq);
    setLegalTargets(game.moves({ square: sq, verbose: true }).map(m => m.to as Square));
  }, [game, selected, onMove, onTurnChange]);

  const ranks = flipped ? [...RANKS].reverse() : RANKS;
  const files = flipped ? [...FILES].reverse() : FILES;
  const board  = game.board();
  const turnLabel = game.turn() === 'w' ? 'White' : 'Black';
  const isOver    = game.isGameOver();
  const captured  = getCaptured(game);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Screen reader live region */}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {isOver
          ? game.isCheckmate() ? `Checkmate. ${turnLabel === 'White' ? 'Black' : 'White'} wins.` : 'Draw.'
          : `${turnLabel}'s turn.${game.isCheck() ? ' Check.' : ''}`
        }
      </p>

      {/* ── Status bar ── */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b text-sm"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: game.turn() === 'w' ? '#f0d9b5' : '#3d2b1f', border: '1.5px solid var(--border)' }}
          />
          <span style={{ color: 'var(--muted)' }}>
            {isOver ? 'Game over' : `${turnLabel}'s turn`}
          </span>
        </div>
        <div className="flex gap-2">
          {game.isCheck() && !isOver && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(234,179,8,0.1)', color: '#eab308', border: '1px solid rgba(234,179,8,0.2)' }}>
              Check
            </span>
          )}
          {isOver && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
              {game.isCheckmate() ? 'Checkmate' : 'Draw'}
            </span>
          )}
        </div>
      </div>

      {/* ── Board + coordinates ── */}
      <div className="p-4">
        <div className="flex gap-1">
          <div className="flex flex-col justify-around pr-1 select-none">
            {ranks.map(n => (
              <span key={n} className="text-xs w-3 text-center leading-none" style={{ color: 'var(--muted)' }}>
                {n}
              </span>
            ))}
          </div>

          <div className="flex-1 min-w-0">
            <div
              className="grid grid-cols-8 w-full aspect-square rounded-lg overflow-hidden"
              style={{ border: '2px solid var(--border)' }}
            >
              {ranks.map((rank) =>
                files.map((file) => {
                  const row  = 8 - rank;
                  const col  = FILES.indexOf(file);
                  const name = toSquareName(row, col);
                  const sq   = board[row][col];
                  const isLight   = (row + col) % 2 === 0;
                  const isSel     = selected === name;
                  const isLegal   = legalTargets.includes(name);
                  const isLast    = lastMove?.includes(name) ?? false;
                  const glyph     = sq ? PIECE_GLYPHS[pieceKey(sq)] : null;

                  return (
                    <div
                      key={name}
                      onClick={() => handleSquareClick(row, col)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSquareClick(row, col); }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Square ${name}${sq ? ` — ${sq.color === 'w' ? 'white' : 'black'} ${sq.type}` : ''}`}
                      aria-pressed={selected === name}
                      className="flex items-center justify-center cursor-pointer select-none relative focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      style={{
                        background: isSel ? SEL_BG : isLast ? LAST_BG : isLight ? LIGHT_SQ : DARK_SQ,
                        fontSize: 'clamp(14px, 3.5vw, 36px)',
                        lineHeight: 1,
                      }}
                    >
                      {isLegal && (
                        <span
                          aria-hidden
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            width:      sq ? '88%' : '30%',
                            height:     sq ? '88%' : '30%',
                            background: sq ? 'rgba(99,102,241,0.2)' : DOT_BG,
                            border:     sq ? `3px solid ${RING_CLR}` : 'none',
                          }}
                        />
                      )}
                      {glyph && <span className="relative z-10 drop-shadow-sm">{glyph}</span>}
                    </div>
                  );
                })
              )}
            </div>

            <div className="grid grid-cols-8 mt-1 select-none">
              {files.map(f => (
                <span key={f} className="text-xs text-center" style={{ color: 'var(--muted)' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Captured pieces ── */}
      <CapturedPieces captured={captured} />

      {/* ── Move history ── */}
      {moveHistory.length > 0 && (
        <div className="px-5 pb-4">
          <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>
            Move History
          </p>
          <div
            className="flex flex-wrap gap-1 max-h-20 overflow-y-auto text-xs font-mono"
            style={{ color: 'var(--foreground)' }}
          >
            {moveHistory.map((m, i) => (
              <span
                key={i}
                className="px-1.5 py-0.5 rounded"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                {i % 2 === 0 && <span style={{ color: 'var(--muted)' }}>{Math.floor(i / 2) + 1}. </span>}
                {m}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
