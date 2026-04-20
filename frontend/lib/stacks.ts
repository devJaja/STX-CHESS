import { StacksMainnet, StacksTestnet } from '@stacks/network';
import { callReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions';

// ── Config (env vars with fallbacks) ────────────────────────
const isMainnet = process.env.NEXT_PUBLIC_NETWORK !== 'testnet';

export const NETWORK          = isMainnet ? new StacksMainnet() : new StacksTestnet();
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '';
export const CONTRACT_NAME    = process.env.NEXT_PUBLIC_CONTRACT_NAME    ?? 'chess-v2';

// ── Internal helper ──────────────────────────────────────────

async function readOnly(
  functionName: string,
  functionArgs: Parameters<typeof callReadOnlyFunction>[0]['functionArgs'],
) {
  const result = await callReadOnlyFunction({
    network: NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs,
    senderAddress: CONTRACT_ADDRESS,
  });
  return cvToJSON(result);
}

// ── Public API ───────────────────────────────────────────────

export async function getGame(gameId: number) {
  try {
    return await readOnly('get-game', [uintCV(gameId)]);
  } catch (err) {
    console.error('[stacks] getGame failed:', err);
    return null;
  }
}

export async function getGameCount() {
  try {
    return await readOnly('get-game-count', []);
  } catch (err) {
    console.error('[stacks] getGameCount failed:', err);
    return null;
  }
}
