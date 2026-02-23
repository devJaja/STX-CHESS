'use client';

import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { getGame } from '@/lib/stacks';

interface ChessBoardProps {
  gameId: number | null;
  userAddress: string;
  onMove: (move: string) => void;
}

const PIECES: { [key: string]: string } = {
  'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
  'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
};

export default function ChessBoard({ gameId, userAddress, onMove }: ChessBoardProps) {
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  useEffect(() => {
    if (gameId) {
      getGame(gameId).then(data => {
        if (data?.value) {
          const moves = data.value.moves?.value || [];
          const newGame = new Chess();
          moves.forEach((m: any) => {
            const moveStr = m.value;
            newGame.move({ from: moveStr.slice(0, 2), to: moveStr.slice(2, 4) });
          });
          setGame(newGame);
        }
      });
    }
  }, [gameId]);

  const board = game.board();

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
        }
      } catch (e) {
        setSelectedSquare(square);
        const moves = game.moves({ square, verbose: true });
        setLegalMoves(moves.map(m => m.to));
      }
    } else {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves.map(m => m.to));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl transition-colors duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="text-gray-900 dark:text-white">
          <p className="text-sm text-gray-600 dark:text-gray-400">Turn</p>
          <p className="font-bold">{game.turn() === 'w' ? 'White' : 'Black'}</p>
        </div>
        {game.isGameOver() && (
          <div className="bg-red-600 text-white px-4 py-2 rounded-lg">
            {game.isCheckmate() ? 'Checkmate!' : game.isDraw() ? 'Draw!' : 'Game Over'}
          </div>
        )}
      </div>

      <div className="grid grid-cols-8 gap-0 w-full aspect-square max-w-2xl mx-auto border-4 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
        {board.map((row, rowIndex) => 
          row.map((square, colIndex) => {
            const squareName = String.fromCharCode(97 + colIndex) + (8 - rowIndex);
            const isLight = (rowIndex + colIndex) % 2 === 0;
            const isSelected = selectedSquare === squareName;
            const isLegalMove = legalMoves.includes(squareName);
            
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
                className={`
                  flex items-center justify-center cursor-pointer text-5xl
                  ${isLight ? 'bg-amber-100 dark:bg-amber-200' : 'bg-amber-600 dark:bg-amber-700'}
                  ${isSelected ? 'ring-4 ring-blue-500' : ''}
                  ${isLegalMove ? 'ring-4 ring-green-400' : ''}
                  hover:opacity-80 transition
                `}
              >
                {square && PIECES[square.type === 'p' && square.color === 'w' ? 'P' : 
                                  square.type === 'p' && square.color === 'b' ? 'p' :
                                  square.type === 'r' && square.color === 'w' ? 'R' :
                                  square.type === 'r' && square.color === 'b' ? 'r' :
                                  square.type === 'n' && square.color === 'w' ? 'N' :
                                  square.type === 'n' && square.color === 'b' ? 'n' :
                                  square.type === 'b' && square.color === 'w' ? 'B' :
                                  square.type === 'b' && square.color === 'b' ? 'b' :
                                  square.type === 'q' && square.color === 'w' ? 'Q' :
                                  square.type === 'q' && square.color === 'b' ? 'q' :
                                  square.type === 'k' && square.color === 'w' ? 'K' : 'k']}
              </div>
            );
          })
        )}
      </div>

      {game.isCheck() && !game.isGameOver() && (
        <div className="mt-4 bg-yellow-600 text-white text-center py-2 rounded-lg font-bold">
          Check!
        </div>
      )}
    </div>
  );
}
