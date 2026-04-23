import { NETWORK, CONTRACT_ADDRESS, CONTRACT_NAME } from '@/lib/stacks';

interface CallContractOptions {
  functionName: string;
  functionArgs: string[];
}

interface LeatherResponse {
  result?: { txid?: string; value?: number; addresses?: { type: string; address: string }[] };
}

type LeatherProvider = {
  request: (method: string, params?: unknown) => Promise<LeatherResponse>;
};

function getLeatherProvider(): LeatherProvider | null {
  if (typeof window === 'undefined') return null;
  return (window as Window & { LeatherProvider?: LeatherProvider }).LeatherProvider ?? null;
}

/**
 * Thin wrapper around the Leather wallet provider.
 * Throws a descriptive error if the extension is not installed.
 */
export function useLeather() {
  const provider = getLeatherProvider();

  async function callContract({ functionName, functionArgs }: CallContractOptions) {
    if (!provider) {
      throw new Error('Leather wallet not detected. Install it at leather.io');
    }
    return provider.request('stx_callContract', {
      contract: `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`,
      functionName,
      functionArgs,
      network: NETWORK.isMainnet() ? 'mainnet' : 'testnet',
    });
  }

  return { provider, callContract, isInstalled: provider !== null };
}
