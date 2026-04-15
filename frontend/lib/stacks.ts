import { StacksMainnet } from '@stacks/network';
import { callReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions';

// ── Contract config ──────────────────────────────────────────
export const NETWORK          = new StacksMainnet();
export const CONTRACT_ADDRESS = 'SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC';
export const CONTRACT_NAME    = 'chess-v2';

// ── Helpers ──────────────────────────────────────────────────

async function readOnly(functionName: string, functionArgs: unknown[]) {
  const result = await callReadOnlyFunction({
    network: NETWORK,
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName,
    functionArgs: functionArgs as Parameters<typeof callReadOnlyFunction>[0]['functionArgs'],
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
