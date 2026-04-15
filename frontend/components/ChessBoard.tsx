'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { getGame } from '@/lib/stacks';

interface ChessBoardProps {
  gameId: number | null;
  userAddress: string;
  onMove: (move: string) => void;
}

const PIECE_MAP: Record<string, string> = {
  P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔',
  p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚',
};

export default function ChessBoard({ gameId, userAddress, onMove }: ChessBoardProps) {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  useEffect(() => {
    if (!gameId) return;
    getGame(gameId).then(data => {
      if (data?.value) {
        const moves = data.value.moves?.value || [];
        const newGame = new Chess();
        moves.forEach((m: any) => {
          const s = m.value;
          newGame.move({ from: s.slice(0, 2), to: s.slice(2, 4) });
        });
        setGame(newGame);
      }
    });
  }, [gameId]);

  const handleSquareClick = (row: number, col: number) => {
    const square = String.fromCharCode(97 + col) + (8 - row);
    if (selectedSquare) {
      try {
        const move = game.move({ from: selectedSquare, to: square });
        if (move) {
          onMove(selectedSquare + square);
          setGame(new Chess(game.fen()));
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }
      } catch {}
    }
    setSelectedSquare(square);
    setLegalMoves(game.moves({ square, verbose: true }).map((m: any) => m.to));
  };

  const board = game.board();
  const turnLabel = game.turn() === 'w' ? 'White' : 'Black';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Board header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b text-sm"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ background: game.turn() === 'w' ? '#f8f9fb' : '#1e2330', border: '1.5px solid var(--border)' }}
          />
          <span style={{ color: 'var(--muted)' }}>
            {game.isGameOver() ? 'Game over' : `${turnLabel}'s turn`}
          </span>
        </div>
        <div className="flex gap-2">
          {game.isCheck() && !game.isGameOver() && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
              Check
            </span>
          )}
          {game.isGameOver() && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              {game.isCheckmate() ? 'Checkmate' : 'Draw'}
            </span>
          )}
        </div>
      </div>

      {/* Board */}
      <div className="p-4">
        {/* Rank labels + board */}
        <div className="flex gap-1">
          {/* Rank numbers */}
          <div className="flex flex-col justify-around pr-1">
            {[8,7,6,5,4,3,2,1].map(n => (
              <span key={n} className="text-xs w-3 text-center leading-none" style={{ color: 'var(--muted)' }}>{n}</span>
            ))}
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-8 w-full aspect-square rounded-lg overflow-hidden" style={{ border: '2px solid var(--border)' }}>
              {board.map((row, rowIndex) =>
                row.map((sq, colIndex) => {
                  const squareName = String.fromCharCode(97 + colIndex) + (8 - rowIndex);
                  const isLight = (rowIndex + colIndex) % 2 === 0;
                  const isSelected = selectedSquare === squareName;
                  const isLegal = legalMoves.includes(squareName);
                  const pieceKey = sq ? (sq.color === 'w' ? sq.type.toUpperCase() : sq.type) : null;

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleSquareClick(rowIndex, colIndex)}
                      className="flex items-center justify-center cursor-pointer select-none relative transition-colors"
                      style={{
                        background: isSelected
                          ? 'rgba(99,102,241,0.45)'
                          : isLight ? '#f0d9b5' : '#b58863',
                        fontSize: 'clamp(16px, 4vw, 38px)',
                        lineHeight: 1,
                      }}
                    >
                      {isLegal && (
                        <span
                          className="absolute rounded-full pointer-events-none"
                          style={{
                            width: sq ? '88%' : '30%',
                            height: sq ? '88%' : '30%',
                            background: sq ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.45)',
                            border: sq ? '3px solid rgba(99,102,241,0.6)' : 'none',
                          }}
                        />
                      )}
                      {pieceKey && (
                        <span className="relative z-10 drop-shadow-sm">{PIECE_MAP[pieceKey]}</span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* File labels */}
            <div className="grid grid-cols-8 mt-1">
              {['a','b','c','d','e','f','g','h'].map(f => (
                <span key={f} className="text-xs text-center" style={{ color: 'var(--muted)' }}>{f}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
