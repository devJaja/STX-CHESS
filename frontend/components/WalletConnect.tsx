'use client';

import { useState, useEffect, useCallback } from 'react';
import { AppConfig, UserSession } from '@stacks/connect';
import { NETWORK } from '@/lib/stacks';

interface WalletConnectProps {
  onConnect: (address: string, session: UserSession) => void;
}

const appConfig  = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [address, setAddress] = useState('');

  // Restore session on mount if already signed in via legacy flow
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const stxAddresses = userSession.loadUserData().profile.stxAddress;
      const addr = NETWORK.isMainnet() ? stxAddresses.mainnet : stxAddresses.testnet;
      setAddress(addr);
      onConnect(addr, userSession);
    }
  }, [onConnect]);

  const connect = useCallback(async () => {
    try {
      const res = await (window as Window & { LeatherProvider?: { request: (method: string) => Promise<{ result?: { addresses?: { type: string; address: string }[] } }> } }).LeatherProvider?.request('getAddresses');
      const addr = res?.result?.addresses?.find((a: { type: string; address: string }) => a.type === 'stx')?.address;
      if (addr) {
        setAddress(addr);
        onConnect(addr, userSession);
      }
    } catch (err) {
      console.error('[WalletConnect] connect failed:', err);
    }
  }, [onConnect]);

  const disconnect = useCallback(() => {
    setAddress('');
    onConnect('', userSession);
  }, [onConnect]);

  if (!address) {
    return (
      <button
        onClick={connect}
        className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
        style={{ background: 'var(--accent)', color: '#fff' }}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
      >
        <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
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
