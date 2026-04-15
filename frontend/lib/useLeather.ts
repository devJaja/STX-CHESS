import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from '@/lib/stacks';

interface CallContractOptions {
  functionName: string;
  functionArgs: string[];
}

/**
 * Thin wrapper around the Leather wallet provider.
 * Returns null if the extension is not installed.
 */
export function useLeather() {
  const provider = typeof window !== 'undefined' ? (window as any).LeatherProvider : null;

  async function callContract({ functionName, functionArgs }: CallContractOptions) {
    if (!provider) throw new Error('Leather wallet not detected. Please install the extension.');
    return provider.request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName,
      functionArgs,
      network: NETWORK.isMainnet() ? 'mainnet' : 'testnet',
    });
  }

  return { provider, callContract };
}
