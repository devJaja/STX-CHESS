/**
 * Stack Chess — contract interaction script
 * Usage: node scripts/interact.mjs <command> [args...]
 *
 * Commands (read-only):
 *   get-count
 *   get-game          <gameId>
 *   get-game-status   <gameId>
 *   get-move-count    <gameId>
 *
 * Commands (write — require MNEMONIC env var):
 *   create-game       <opponentAddress>
 *   make-move         <gameId> <move>        e.g. "e2e4"
 *   end-game          <gameId> <white|black>
 *   resign            <gameId>
 *   offer-draw        <gameId>
 *   accept-draw       <gameId>
 *
 * Env vars:
 *   MNEMONIC          — 24-word seed phrase of the sender wallet
 *   CONTRACT_ADDRESS  — deployed principal (default below)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const env = readFileSync(resolve(__dirname, '.env'), 'utf8');
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=');
    if (k?.trim() && v.length) process.env[k.trim()] ??= v.join('=').trim();
  }
} catch {}

import {
  makeContractCall,
  broadcastTransaction,
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  stringAsciiCV,
  standardPrincipalCV,
  AnchorMode,
  PostConditionMode,
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { generateWallet, getStxAddress } from '@stacks/wallet-sdk';
import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first');

// ── Config ───────────────────────────────────────────────────
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS ?? 'SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC';
const CONTRACT_NAME    = 'chess-v2';
const NETWORK          = new StacksMainnet();
const FEE              = 300n;

// ── Helpers ──────────────────────────────────────────────────

async function getSenderKey() {
  const mnemonic = process.env.MNEMONIC;
  if (!mnemonic) throw new Error('MNEMONIC env var is required for write commands');
  const wallet = await generateWallet({ secretKey: mnemonic, password: '' });
  const account = wallet.accounts[0];
  return { privateKey: account.stxPrivateKey, address: getStxAddress({ account, transactionVersion: 0 }) };
}

async function readOnly(functionName, functionArgs) {
  const result = await callReadOnlyFunction({
    network: NETWORK, contractAddress: CONTRACT_ADDRESS, contractName: CONTRACT_NAME,
    functionName, functionArgs, senderAddress: CONTRACT_ADDRESS,
  });
  return cvToJSON(result);
}

async function writeContract(functionName, functionArgs) {
  const { privateKey, address } = await getSenderKey();
  console.log('Sender:', address);
  const tx = await makeContractCall({
    network: NETWORK, contractAddress: CONTRACT_ADDRESS, contractName: CONTRACT_NAME,
    functionName, functionArgs, senderKey: privateKey, fee: FEE,
    anchorMode: AnchorMode.OnChainOnly, postConditionMode: PostConditionMode.Allow,
  });
  const res = await broadcastTransaction(tx, NETWORK);
  if (res.error) throw new Error(res.error + (res.reason ? `: ${res.reason}` : ''));
  console.log('txid:', res.txid);
  console.log(`https://explorer.hiro.so/txid/${res.txid}?chain=mainnet`);
}

// ── Commands ─────────────────────────────────────────────────

const [,, cmd, ...args] = process.argv;

switch (cmd) {
  case 'get-count': {
    const res = await readOnly('get-game-count', []);
    console.log('Total games:', res?.value?.value ?? res?.value);
    break;
  }
  case 'get-game': {
    if (!args[0]) throw new Error('Usage: get-game <gameId>');
    const res = await readOnly('get-game', [uintCV(Number(args[0]))]);
    console.log(JSON.stringify(res, null, 2));
    break;
  }
  case 'get-game-status': {
    if (!args[0]) throw new Error('Usage: get-game-status <gameId>');
    const res = await readOnly('get-game-status', [uintCV(Number(args[0]))]);
    console.log('Status:', res?.value?.value ?? res?.value);
    break;
  }
  case 'get-move-count': {
    if (!args[0]) throw new Error('Usage: get-move-count <gameId>');
    const res = await readOnly('get-move-count', [uintCV(Number(args[0]))]);
    console.log('Moves:', res?.value?.value ?? res?.value);
    break;
  }
  case 'create-game': {
    if (!args[0]) throw new Error('Usage: create-game <opponentAddress>');
    await writeContract('create-game', [standardPrincipalCV(args[0])]);
    break;
  }
  case 'make-move': {
    if (!args[1]) throw new Error('Usage: make-move <gameId> <move>');
    await writeContract('make-move', [uintCV(Number(args[0])), stringAsciiCV(args[1])]);
    break;
  }
  case 'end-game': {
    if (!args[1]) throw new Error('Usage: end-game <gameId> <white|black>');
    await writeContract('end-game', [uintCV(Number(args[0])), stringAsciiCV(args[1])]);
    break;
  }
  case 'resign': {
    if (!args[0]) throw new Error('Usage: resign <gameId>');
    await writeContract('resign', [uintCV(Number(args[0]))]);
    break;
  }
  case 'offer-draw': {
    if (!args[0]) throw new Error('Usage: offer-draw <gameId>');
    await writeContract('offer-draw', [uintCV(Number(args[0]))]);
    break;
  }
  case 'accept-draw': {
    if (!args[0]) throw new Error('Usage: accept-draw <gameId>');
    await writeContract('accept-draw', [uintCV(Number(args[0]))]);
    break;
  }
  default:
    console.log('Commands: get-count | get-game | get-game-status | get-move-count | create-game | make-move | end-game | resign | offer-draw | accept-draw');
}
