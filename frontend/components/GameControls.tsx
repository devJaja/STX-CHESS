'use client';

import { useState } from 'react';
import { principalCV, stringAsciiCV, uintCV, serializeCV } from '@stacks/transactions';
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

export default function GameControls({ gameId, setGameId, userAddress, userSession, pendingMove, setPendingMove }: GameControlsProps) {
  const [opponentAddress, setOpponentAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const createGame = async () => {
    if (!userAddress || !userSession) {
      alert('Please connect your wallet first');
      return;
    }
    if (!opponentAddress) {
      alert('Please enter opponent address');
      return;
    }

    if (!(window as any).LeatherProvider) {
      alert('Leather wallet not detected. Please install Leather wallet extension.');
      return;
    }

    setLoading(true);
    try {
      const response = await (window as any).LeatherProvider.request('stx_callContract', {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: 'create-game',
        functionArgs: [`0x${serializeCV(principalCV(opponentAddress)).toString('hex')}`],
        network: NETWORK.isMainnet() ? 'mainnet' : 'testnet',
      });
      
      console.log('Response:', response);
      if (response?.result?.txid) {
        alert(`Game created! TX: ${response.result.txid}`);
        setGameId(1);
      }
    } catch (error: any) {
      console.error('Full error:', error);
      const errorMsg = error?.error?.message || error?.message || JSON.stringify(error) || 'Unknown error';
      if (error?.error?.code !== 4001) {
        alert(`Failed to create game: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const submitMove = async () => {
    if (!userAddress || !userSession || !gameId || !pendingMove) return;

    if (!(window as any).LeatherProvider) {
      alert('Leather wallet not detected. Please install Leather wallet extension.');
      return;
    }

    setLoading(true);
    try {
      const response = await (window as any).LeatherProvider.request('stx_callContract', {
        contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
        functionName: 'make-move',
        functionArgs: [
          `0x${serializeCV(uintCV(gameId)).toString('hex')}`,
          `0x${serializeCV(stringAsciiCV(pendingMove)).toString('hex')}`
        ],
        network: NETWORK.isMainnet() ? 'mainnet' : 'testnet',
      });
      
      console.log('Response:', response);
      if (response?.result?.txid) {
        alert(`Move submitted! TX: ${response.result.txid}`);
        setPendingMove('');
      }
    } catch (error: any) {
      console.error('Full error:', error);
      const errorMsg = error?.error?.message || error?.message || JSON.stringify(error) || 'Unknown error';
      if (error?.error?.code !== 4001) {
        alert(`Failed to make move: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
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
              placeholder="SP2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC"
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

          {pendingMove && (
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pending Move</p>
              <p className="text-gray-900 dark:text-white font-bold">{pendingMove}</p>
            </div>
          )}

          <button
            onClick={submitMove}
            disabled={loading || !pendingMove}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            {loading ? 'Submitting...' : 'Submit Move to Blockchain'}
          </button>

          <button
            onClick={() => setGameId(null)}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition"
          >
            Leave Game
          </button>
        </div>
      )}
    </div>
  );
}
