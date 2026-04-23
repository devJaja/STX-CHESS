/**
 * Stack Chess — 30+ mainnet interactions
 * 
 * Runs: 5 games, each with ~5 moves + end-game = 30+ txs total
 * 
 * Requires two funded mainnet wallets:
 *   MNEMONIC_WHITE=<24 words>
 *   MNEMONIC_BLACK=<24 words>
 * 
 * Usage: node scripts/run-interactions.mjs
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env from scripts folder
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

const CONTRACT_ADDRESS = 'SP19PS42C7R7BR4VCX2YN8KPHXSB0ZC19K6PFEKTC';
const CONTRACT_NAME    = 'chess-v2';
const NETWORK          = new StacksMainnet();
const FEE              = 300n; // microSTX per tx

// 7 games × (1 create + 6 moves + 1 end) = 56 transactions total
// (accounts for partial runs from previous attempts)
const GAMES = [
  { moves: ['e2e4','e7e5','g1f3','b8c6','f1c4','f8c5'], winner: 'white' },
  { moves: ['d2d4','d7d5','c2c4','e7e6','b1c3','g8f6'], winner: 'black' },
  { moves: ['e2e4','c7c5','g1f3','d7d6','d2d4','c5d4'], winner: 'white' },
  { moves: ['e2e4','e7e6','d2d4','d7d5','b1c3','g8f6'], winner: 'black' },
  { moves: ['g1f3','d7d5','g2g3','g8f6','f1g2','e7e6'], winner: 'white' },
  { moves: ['e2e4','c7c6','d2d4','d7d5','b1c3','d5e4'], winner: 'black' },
  { moves: ['d2d4','g8f6','c2c4','e7e6','g1f3','d7d5'], winner: 'white' },
];

async function deriveAccount(mnemonic) {
  const wallet = await generateWallet({ secretKey: mnemonic, password: '' });
  const account = wallet.accounts[0];
  return {
    privateKey: account.stxPrivateKey,
    address: getStxAddress({ account, transactionVersion: 0 }),
  };
}

async function readOnly(functionName, functionArgs, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await callReadOnlyFunction({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName,
        functionArgs,
        senderAddress: CONTRACT_ADDRESS,
      });
      return cvToJSON(res);
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(3000);
    }
  }
}

async function sendTx(functionName, functionArgs, senderKey, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      const tx = await makeContractCall({
        network: NETWORK,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName,
        functionArgs,
        senderKey,
        fee: FEE,
        anchorMode: AnchorMode.OnChainOnly,
        postConditionMode: PostConditionMode.Allow,
      });
      const res = await broadcastTransaction(tx, NETWORK);
      if (res.error) throw new Error(`${res.error}: ${res.reason ?? ''}`);
      return res.txid;
    } catch (e) {
      if (i === retries - 1) throw e;
      await sleep(3000);
    }
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function waitForTx(txid, retries = 20) {
  const url = `https://api.hiro.so/extended/v1/tx/${txid}`;
  for (let i = 0; i < retries; i++) {
    await sleep(10000);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) }).then(r => r.json());
      if (res.tx_status === 'success') return true;
      if (res.tx_status === 'abort_by_response' || res.tx_status === 'abort_by_post_condition') {
        throw new Error(`Tx ${txid} aborted: ${res.tx_status}`);
      }
    } catch (e) {
      if (e.message?.includes('aborted')) throw e;
      // network hiccup — retry
    }
    process.stdout.write('.');
  }
  throw new Error(`Tx ${txid} not confirmed after ${retries} retries`);
}

// ── Main ─────────────────────────────────────────────────────

const mnemonicWhite = process.env.MNEMONIC_WHITE;
const mnemonicBlack = process.env.MNEMONIC_BLACK;
if (!mnemonicWhite || !mnemonicBlack) {
  console.error('Set MNEMONIC_WHITE and MNEMONIC_BLACK env vars');
  process.exit(1);
}

const white = await deriveAccount(mnemonicWhite);
const black = await deriveAccount(mnemonicBlack);

console.log('White:', white.address);
console.log('Black:', black.address);

let totalTxs = 0;

for (let g = 0; g < GAMES.length; g++) {
  const { moves, winner } = GAMES[g];
  console.log(`\n── Game ${g + 1} ──`);

  // 1. create-game (white creates, black is opponent)
  process.stdout.write('  create-game... ');
  const createTxid = await sendTx('create-game', [standardPrincipalCV(black.address)], white.privateKey);
  console.log(createTxid);
  await waitForTx(createTxid);
  totalTxs++;

  // get the new game-id
  const countRes = await readOnly('get-game-count', []);
  const gameId = Number(countRes?.value?.value ?? countRes?.value);
  console.log(`  game-id: ${gameId}`);

  // 2. moves (alternating white/black)
  for (let m = 0; m < moves.length; m++) {
    const isWhiteTurn = m % 2 === 0;
    const senderKey   = isWhiteTurn ? white.privateKey : black.privateKey;
    process.stdout.write(`  move ${m + 1} (${isWhiteTurn ? 'white' : 'black'}) ${moves[m]}... `);
    const txid = await sendTx('make-move', [uintCV(gameId), stringAsciiCV(moves[m])], senderKey);
    console.log(txid);
    await waitForTx(txid);
    totalTxs++;
  }

  // 3. end-game
  const enderKey = winner === 'white' ? white.privateKey : black.privateKey;
  process.stdout.write(`  end-game (${winner} wins)... `);
  const endTxid = await sendTx('end-game', [uintCV(gameId), stringAsciiCV(winner)], enderKey);
  console.log(endTxid);
  await waitForTx(endTxid);
  totalTxs++;

  // 4. verify final state
  const gameState = await readOnly('get-game', [uintCV(gameId)]);
  const status = gameState?.value?.status?.value;
  console.log(`  status: ${status} ✓`);
}

console.log(`\n✅ Done — ${totalTxs} transactions submitted on mainnet`);
console.log(`Explorer: https://explorer.hiro.so/address/${CONTRACT_ADDRESS}?chain=mainnet`);
