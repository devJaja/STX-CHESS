'use client';

import { useState, useEffect, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import { getGame } from '@/lib/stacks';
import { useGameSync } from '@/lib/useGameSync';

// ── Types ────────────────────────────────────────────────────

interface ChessBoardProps {
  gameId: number | null;
  userAddress: string;
  onMove: (move: string) => void;
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

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

// ── Helpers ──────────────────────────────────────────────────

function toSquareName(row: number, col: number): Square {
  return (FILES[col] + (8 - row)) as Square;
}

function pieceKey(sq: { type: string; color: string }): string {
  return sq.color === 'w' ? sq.type.toUpperCase() : sq.type;
}

// ── Component ────────────────────────────────────────────────

export default function ChessBoard({ gameId, onMove }: ChessBoardProps) {
  const [game, setGame]               = useState(() => new Chess());
  const [selected, setSelected]       = useState<Square | null>(null);
  const [legalTargets, setLegalTargets] = useState<Square[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  function applyChainData(data: unknown) {
    const d = data as { value?: { moves?: { value: { value: string }[] } } };
    if (!d?.value) return;
    const moves = d.value.moves?.value ?? [];
    const g = new Chess();
    moves.forEach((m: { value: string }) => {
      const s = m.value;
      try { g.move({ from: s.slice(0, 2) as Square, to: s.slice(2, 4) as Square, promotion: s[4] || undefined }); }
      catch { /* skip invalid stored move */ }
    });
    setGame(g);
    setMoveHistory(g.history());
  }

  // Initial load when gameId changes
  useEffect(() => {
    if (!gameId) {
      setGame(new Chess());
      setMoveHistory([]);
      setSelected(null);
      setLegalTargets([]);
      return;
    }
    getGame(gameId).then(applyChainData);
  }, [gameId]);

  // Periodic sync while game is active
  useGameSync(gameId, applyChainData);

  const handleSquareClick = useCallback((row: number, col: number) => {
    const sq = toSquareName(row, col);

    if (selected) {
      try {
        const copy = new Chess(game.fen());
        // Detect pawn promotion: pawn moving to rank 1 or 8
        const piece = copy.get(selected);
        const toRank = sq[1];
        const isPromotion = piece?.type === 'p' && (toRank === '8' || toRank === '1');
        const result = copy.move({ from: selected, to: sq, promotion: isPromotion ? 'q' : undefined });
        if (result) {
          setGame(copy);
          setMoveHistory(copy.history());
          setSelected(null);
          setLegalTargets([]);
          onMove(selected + sq + (isPromotion ? 'q' : ''));
          return;
        }
      } catch { /* illegal move — fall through to re-select */ }
    }

    setSelected(sq);
    setLegalTargets(
      game.moves({ square: sq, verbose: true }).map(m => m.to as Square)
    );
  }, [game, selected, onMove]);

  const board     = game.board();
  const turnLabel = game.turn() === 'w' ? 'White' : 'Black';
  const isOver    = game.isGameOver();

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* ── Status bar ── */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b text-sm"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              background: game.turn() === 'w' ? '#f0d9b5' : '#3d2b1f',
              border: '1.5px solid var(--border)',
            }}
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
          {/* Rank labels */}
          <div className="flex flex-col justify-around pr-1 select-none">
            {RANKS.map(n => (
              <span key={n} className="text-xs w-3 text-center leading-none" style={{ color: 'var(--muted)' }}>
                {n}
              </span>
            ))}
          </div>

          <div className="flex-1 min-w-0">
            {/* Squares */}
            <div
              className="grid grid-cols-8 w-full aspect-square rounded-lg overflow-hidden"
              style={{ border: '2px solid var(--border)' }}
            >
              {board.map((row, ri) =>
                row.map((sq, ci) => {
                  const name      = toSquareName(ri, ci);
                  const isLight   = (ri + ci) % 2 === 0;
                  const isSel     = selected === name;
                  const isLegal   = legalTargets.includes(name);
                  const glyph     = sq ? PIECE_GLYPHS[pieceKey(sq)] : null;

                  return (
                    <div
                      key={name}
                      onClick={() => handleSquareClick(ri, ci)}
                      role="button"
                      aria-label={`Square ${name}${sq ? ` — ${sq.color === 'w' ? 'white' : 'black'} ${sq.type}` : ''}`}
                      className="flex items-center justify-center cursor-pointer select-none relative"
                      style={{
                        background: isSel ? SEL_BG : isLight ? LIGHT_SQ : DARK_SQ,
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
                      {glyph && (
                        <span className="relative z-10 drop-shadow-sm">{glyph}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* File labels */}
            <div className="grid grid-cols-8 mt-1 select-none">
              {FILES.map(f => (
                <span key={f} className="text-xs text-center" style={{ color: 'var(--muted)' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

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
