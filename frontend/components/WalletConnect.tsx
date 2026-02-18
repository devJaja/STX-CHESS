'use client';

import { useState } from 'react';
import { showConnect } from '@stacks/connect';
import { AppConfig, UserSession } from '@stacks/connect';

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  const appConfig = new AppConfig(['store_write', 'publish_data']);
  const userSession = new UserSession({ appConfig });

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Stack Chess',
        icon: '/chess-icon.png',
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData();
        const userAddress = userData.profile.stxAddress.testnet;
        setAddress(userAddress);
        setIsConnected(true);
        onConnect(userAddress);
      },
      userSession,
    });
  };

  const disconnectWallet = () => {
    userSession.signUserOut();
    setAddress('');
    setIsConnected(false);
    onConnect('');
  };

  return (
    <div>
      {!isConnected ? (
        <button
          onClick={connectWallet}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <div className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <button
            onClick={disconnectWallet}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
