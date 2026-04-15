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
      const addr = userSession.loadUserData().profile.stxAddress.mainnet;
      setAddress(addr);
      onConnect(addr, userSession);
    }
  }, [userSession, onConnect]);

  const connectWallet = async () => {
    try {
      const response = await (window as any).LeatherProvider?.request('getAddresses');
      const stxAddress = response?.result?.addresses?.find((a: any) => a.type === 'stx')?.address;
      if (stxAddress) {
        setAddress(stxAddress);
        onConnect(stxAddress, userSession);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnect = () => {
    setAddress('');
    onConnect('', userSession);
  };

  if (!address) {
    return (
      <button
        onClick={connectWallet}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
      >
        <span
          className="w-2 h-2 rounded-full bg-green-400 inline-block"
        />
        <span className="font-mono">{address.slice(0, 6)}…{address.slice(-4)}</span>
      </div>
      <button
        onClick={disconnect}
        className="text-sm px-3 py-2 rounded-lg transition-opacity hover:opacity-70"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)' }}
      >
        Disconnect
      </button>
    </div>
  );
}
