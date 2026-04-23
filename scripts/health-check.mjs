/**
 * Stack Chess — health check script
 * Verifies the contract is reachable and returns basic stats.
 * Usage: node scripts/health-check.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first');

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const env = readFileSync(resolve(__dirname, '.env'), 'utf8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k?.trim() && v.length) process.env[k.trim()] ??= v.join('=').trim();
  }
} catch {}

import { callReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS ?? 'SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC';
const CONTRACT_NAME    = 'chess-v2';
const NETWORK          = new StacksMainnet();

async function readOnly(fn, args = []) {
  const res = await callReadOnlyFunction({
    network: NETWORK, contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME, functionName: fn,
    functionArgs: args, senderAddress: CONTRACT_ADDRESS,
  });
  return cvToJSON(res);
}

console.log('Stack Chess — Health Check');
console.log('Contract:', `${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
console.log('Network: Mainnet\n');

try {
  const countRes = await readOnly('get-game-count');
  const count = Number(countRes?.value?.value ?? countRes?.value ?? 0);
  console.log(`✓ Contract reachable`);
  console.log(`✓ Total games on-chain: ${count}`);

  if (count > 0) {
    const gameRes = await readOnly('get-game', [uintCV(count)]);
    const status = gameRes?.value?.status?.value ?? 'unknown';
    console.log(`✓ Latest game (#${count}) status: ${status}`);
  }

  console.log('\n✅ All checks passed');
} catch (err) {
  console.error('✕ Health check failed:', err.message);
  process.exit(1);
}
