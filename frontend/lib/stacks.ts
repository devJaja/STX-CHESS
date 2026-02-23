import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { callReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions';

export const NETWORK = new StacksMainnet();
export const CONTRACT_ADDRESS = 'SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC';
export const CONTRACT_NAME = 'chess-v2';

export async function getGame(gameId: number) {
  try {
    const result = await callReadOnlyFunction({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-game',
      functionArgs: [uintCV(gameId)],
      senderAddress: CONTRACT_ADDRESS,
    });
    return cvToJSON(result);
  } catch (error) {
    console.error('Error fetching game:', error);
    return null;
  }
}

export async function getGameCount() {
  try {
    const result = await callReadOnlyFunction({
      network: NETWORK,
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-game-count',
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
    });
    return cvToJSON(result);
  } catch (error) {
    console.error('Error fetching game count:', error);
    return null;
  }
}
