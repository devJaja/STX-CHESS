'use client';

import { useState } from 'react';

interface GameControlsProps {
  gameId: number | null;
  setGameId: (id: number) => void;
  userAddress: string;
}

export default function GameControls({ gameId, setGameId, userAddress }: GameControlsProps) {
  const [opponentAddress, setOpponentAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const createGame = async () => {
    if (!userAddress) {
      alert('Please connect your wallet first');
      return;
    }
    if (!opponentAddress) {
      alert('Please enter opponent address');
      return;
    }

    setLoading(true);
    // TODO: Call smart contract to create game
    setTimeout(() => {
      setGameId(1);
      setLoading(false);
      alert('Game created! Game ID: 1');
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl transition-colors duration-300">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Game Controls</h2>

      {!gameId ? (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 mb-2">Opponent Address</label>
            <input
              type="text"
              value={opponentAddress}
              onChange={(e) => setOpponentAddress(e.target.value)}
              placeholder="ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC"
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
            />
          </div>

          <button
            onClick={createGame}
            disabled={loading || !userAddress}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            {loading ? 'Creating...' : 'Create Game'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg transition-colors">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Game ID</p>
            <p className="text-gray-900 dark:text-white text-2xl font-bold">{gameId}</p>
          </div>

          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg transition-colors">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Status</p>
            <p className="text-green-600 dark:text-green-400 font-bold">Active</p>
          </div>

          <button
            onClick={() => setGameId(null)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition"
          >
            Leave Game
          </button>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors">
        <h3 className="text-gray-900 dark:text-white font-bold mb-3">Game Stats</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Total Games:</span>
            <span className="text-gray-900 dark:text-white font-bold">0</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Wins:</span>
            <span className="text-green-600 dark:text-green-400 font-bold">0</span>
          </div>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Losses:</span>
            <span className="text-red-600 dark:text-red-400 font-bold">0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
