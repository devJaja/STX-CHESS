/**
 * Stack Chess — batch game reader
 * Reads and prints multiple games in a table format.
 * Usage: node scripts/read-games.mjs [startId] [endId]
 * Example: node scripts/read-games.mjs 1 10
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

const countRes = await readOnly('get-game-count');
const total = Number(countRes?.value?.value ?? countRes?.value ?? 0);

const [,, startArg, endArg] = process.argv;
const start = Math.max(1, Number(startArg) || 1);
const end   = Math.min(total, Number(endArg) || total);

console.log(`Games ${start}–${end} of ${total} total\n`);
console.log('ID   Status     Moves  White                                      Black');
console.log('─'.repeat(100));

for (let id = start; id <= end; id++) {
  const res = await readOnly('get-game', [uintCV(id)]);
  const v = res?.value;
  if (!v) { console.log(`${String(id).padEnd(4)} not found`); continue; }
  const status = (v.status?.value ?? '?').padEnd(10);
  const moves  = String(v.moves?.value?.length ?? 0).padEnd(6);
  const white  = (v.white?.value ?? '?').slice(0, 40).padEnd(42);
  const black  = (v.black?.value ?? '?').slice(0, 40);
  console.log(`${String(id).padEnd(4)} ${status} ${moves} ${white} ${black}`);
}
