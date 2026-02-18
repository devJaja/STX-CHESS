'use client';

import { useState } from 'react';
import ChessBoard from '@/components/ChessBoard';
import WalletConnect from '@/components/WalletConnect';
import GameControls from '@/components/GameControls';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [gameId, setGameId] = useState<number | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">♔ Stack Chess</h1>
          <p className="text-gray-700 dark:text-gray-300">Chess on Bitcoin via Stacks Blockchain</p>
        </header>

        <div className="flex justify-between items-center mb-6">
          <ThemeToggle />
          <WalletConnect onConnect={setUserAddress} />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ChessBoard gameId={gameId} userAddress={userAddress} />
          </div>
          
          <div className="space-y-6">
            <GameControls 
              gameId={gameId} 
              setGameId={setGameId}
              userAddress={userAddress}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
