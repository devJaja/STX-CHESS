'use client';

import { useState, useEffect } from 'react';
import { AppConfig, UserSession } from '@stacks/connect';

interface WalletConnectProps {
  onConnect: (address: string, session: UserSession) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [address, setAddress] = useState<string>('');
  const [userSession] = useState(() => new UserSession({ appConfig: new AppConfig(['store_write', 'publish_data']) }));

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const addr = userData.profile.stxAddress.mainnet;
      setAddress(addr);
      onConnect(addr, userSession);
    }
  }, [userSession, onConnect]);

  const connectWallet = async () => {
    try {
      const response = await (window as any).LeatherProvider?.request('getAddresses');
      if (response?.result?.addresses) {
        const stxAddress = response.result.addresses.find((a: any) => a.type === 'stx')?.address;
        if (stxAddress) {
          setAddress(stxAddress);
          onConnect(stxAddress, userSession);
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = () => {
    setAddress('');
    onConnect('', userSession);
  };

  return (
    <div>
      {!address ? (
        <button onClick={connectWallet} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg">
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center gap-4">
          <div className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
          <button onClick={disconnectWallet} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
