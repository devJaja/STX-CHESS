import { describe, it, expect, beforeAll } from 'vitest';
import { initSimnet } from '@hirosystems/clarinet-sdk';
import { Cl } from '@stacks/transactions';

let simnet: Awaited<ReturnType<typeof initSimnet>>;
let wallet1: string;
let wallet2: string;
let wallet3: string;

beforeAll(async () => {
  simnet = await initSimnet();
  const accounts = simnet.getAccounts();
  wallet1 = accounts.get('wallet_1')!;
  wallet2 = accounts.get('wallet_2')!;
  wallet3 = accounts.get('wallet_3')!;
});

// Helper: create a fresh game and return its id
function createGame() {
  const { result } = simnet.callPublicFn('chess', 'create-game', [Cl.principal(wallet2)], wallet1);
  const id = (result as { value: { value: bigint } }).value.value;
  return Number(id);
}

describe('create-game', () => {
  it('returns incrementing game id', () => {
    const before = createGame();
    const after  = createGame();
    expect(after).toBe(before + 1);
  });

  it('rejects creating a game against yourself', () => {
    const { result } = simnet.callPublicFn('chess', 'create-game', [Cl.principal(wallet1)], wallet1);
    expect(result).toBeErr(Cl.uint(105));
  });

  it('stores white and black correctly', () => {
    const id = createGame();
    const { result } = simnet.callReadOnlyFn('chess', 'get-game', [Cl.uint(id)], wallet1);
    expect(result).toBeSome();
  });
});

describe('make-move', () => {
  it('allows white to make the first move', () => {
    const id = createGame();
    const { result } = simnet.callPublicFn('chess', 'make-move', [Cl.uint(id), Cl.stringAscii('e2e4')], wallet1);
    expect(result).toBeOk(Cl.bool(true));
  });

  it('allows black to move after white', () => {
    const id = createGame();
    simnet.callPublicFn('chess', 'make-move', [Cl.uint(id), Cl.stringAscii('e2e4')], wallet1);
    const { result } = simnet.callPublicFn('chess', 'make-move', [Cl.uint(id), Cl.stringAscii('e7e5')], wallet2);
    expect(result).toBeOk(Cl.bool(true));
  });

  it("rejects a move when it is not the caller's turn", () => {
    const id = createGame();
    const { result } = simnet.callPublicFn('chess', 'make-move', [Cl.uint(id), Cl.stringAscii('e7e5')], wallet2);
    expect(result).toBeErr(Cl.uint(103));
  });

  it('rejects a move string shorter than 4 characters', () => {
    const id = createGame();
    const { result } = simnet.callPublicFn('chess', 'make-move', [Cl.uint(id), Cl.stringAscii('e2')], wallet1);
    expect(result).toBeErr(Cl.uint(102));
  });

  it('rejects a move on a finished game', () => {
    const id = createGame();
    simnet.callPublicFn('chess', 'end-game', [Cl.uint(id), Cl.stringAscii('white')], wallet1);
    const { result } = simnet.callPublicFn('chess', 'make-move', [Cl.uint(id), Cl.stringAscii('e2e4')], wallet1);
    expect(result).toBeErr(Cl.uint(104));
  });

  it('rejects a move from a non-participant', () => {
    const id = createGame();
    const { result } = simnet.callPublicFn('chess', 'make-move', [Cl.uint(id), Cl.stringAscii('e2e4')], wallet3);
    expect(result).toBeErr(Cl.uint(103));
  });

  it('cancels a pending draw offer when a move is made', () => {
    const id = createGame();
    simnet.callPublicFn('chess', 'offer-draw', [Cl.uint(id)], wallet1);
    simnet.callPublicFn('chess', 'make-move', [Cl.uint(id), Cl.stringAscii('e2e4')], wallet1);
    const { result } = simnet.callReadOnlyFn('chess', 'get-game', [Cl.uint(id)], wallet1);
    const game = (result as { value: { value: { 'draw-offered-by': { type: string } } } }).value.value;
    expect(game['draw-offered-by'].type).toBe('none');
  });
});

describe('end-game', () => {
  it('allows white to declare themselves winner', () => {
    const id = createGame();
    const { result } = simnet.callPublicFn('chess', 'end-game', [Cl.uint(id), Cl.stringAscii('white')], wallet1);
    expect(result).toBeOk(Cl.bool(true));
  });

  it('allows black to declare themselves winner', () => {
    const id = createGame();
    const { result } = simnet.callPublicFn('chess', 'end-game', [Cl.uint(id), Cl.stringAscii('black')], wallet2);
    expect(result).toBeOk(Cl.bool(true));
  });

  it('rejects end-game from non-participant', () => {
    const id = createGame();
    const { result } = simnet.callPublicFn('chess', 'end-game', [Cl.uint(id), Cl.stringAscii('white')], wallet3);
    expect(result).toBeErr(Cl.uint(100));
  });

  it('rejects double end-game', () => {
    const id = createGame();
    simnet.callPublicFn('chess', 'end-game', [Cl.uint(id), Cl.stringAscii('white')], wallet1);
    const { result } = simnet.callPublicFn('chess', 'end-game', [Cl.uint(id), Cl.stringAscii('black')], wallet2);
    expect(result).toBeErr(Cl.uint(104));
  });
});

describe('resign', () => {
  it('allows white to resign — black wins', () => {
    const id = createGame();
    const { result } = simnet.callPublicFn('chess', 'resign', [Cl.uint(id)], wallet1);
    expect(result).toBeOk(Cl.bool(true));
  });

  it('allows black to resign — white wins', () => {
    const id = createGame();
    const { result } = simnet.callPublicFn('chess', 'resign', [Cl.uint(id)], wallet2);
    expect(result).toBeOk(Cl.bool(true));
  });

  it('rejects resign from non-participant', () => {
    const id = createGame();
    const { result } = simnet.callPublicFn('chess', 'resign', [Cl.uint(id)], wallet3);
    expect(result).toBeErr(Cl.uint(100));
  });

  it('rejects resign on finished game', () => {
    const id = createGame();
    simnet.callPublicFn('chess', 'end-game', [Cl.uint(id), Cl.stringAscii('white')], wallet1);
    const { result } = simnet.callPublicFn('chess', 'resign', [Cl.uint(id)], wallet2);
    expect(result).toBeErr(Cl.uint(104));
  });
});

describe('draw offer / accept', () => {
  it('allows a player to offer a draw', () => {
    const id = createGame();
    const { result } = simnet.callPublicFn('chess', 'offer-draw', [Cl.uint(id)], wallet1);
    expect(result).toBeOk(Cl.bool(true));
  });

  it('rejects a second draw offer while one is pending', () => {
    const id = createGame();
    simnet.callPublicFn('chess', 'offer-draw', [Cl.uint(id)], wallet1);
    const { result } = simnet.callPublicFn('chess', 'offer-draw', [Cl.uint(id)], wallet2);
    expect(result).toBeErr(Cl.uint(107));
  });

  it('allows the other player to accept a draw', () => {
    const id = createGame();
    simnet.callPublicFn('chess', 'offer-draw', [Cl.uint(id)], wallet1);
    const { result } = simnet.callPublicFn('chess', 'accept-draw', [Cl.uint(id)], wallet2);
    expect(result).toBeOk(Cl.bool(true));
  });

  it('rejects the offerer accepting their own draw', () => {
    const id = createGame();
    simnet.callPublicFn('chess', 'offer-draw', [Cl.uint(id)], wallet1);
    const { result } = simnet.callPublicFn('chess', 'accept-draw', [Cl.uint(id)], wallet1);
    expect(result).toBeErr(Cl.uint(100));
  });

  it('rejects accept-draw when no offer is pending', () => {
    const id = createGame();
    const { result } = simnet.callPublicFn('chess', 'accept-draw', [Cl.uint(id)], wallet2);
    expect(result).toBeErr(Cl.uint(106));
  });
});

describe('read-only helpers', () => {
  it('get-game-count returns total games', () => {
    const before = simnet.callReadOnlyFn('chess', 'get-game-count', [], wallet1);
    createGame();
    const after = simnet.callReadOnlyFn('chess', 'get-game-count', [], wallet1);
    const b = Number((before.result as { value: { value: bigint } }).value.value);
    const a = Number((after.result as { value: { value: bigint } }).value.value);
    expect(a).toBe(b + 1);
  });

  it('get-game-status returns active for new game', () => {
    const id = createGame();
    const { result } = simnet.callReadOnlyFn('chess', 'get-game-status', [Cl.uint(id)], wallet1);
    expect(result).toBeOk(Cl.stringAscii('active'));
  });

  it('get-move-count returns 0 for new game', () => {
    const id = createGame();
    const { result } = simnet.callReadOnlyFn('chess', 'get-move-count', [Cl.uint(id)], wallet1);
    expect(result).toBeOk(Cl.uint(0));
  });

  it('get-move-count increments after a move', () => {
    const id = createGame();
    simnet.callPublicFn('chess', 'make-move', [Cl.uint(id), Cl.stringAscii('e2e4')], wallet1);
    const { result } = simnet.callReadOnlyFn('chess', 'get-move-count', [Cl.uint(id)], wallet1);
    expect(result).toBeOk(Cl.uint(1));
  });

  it('get-game returns none for non-existent game', () => {
    const { result } = simnet.callReadOnlyFn('chess', 'get-game', [Cl.uint(99999)], wallet1);
    expect(result).toBeNone();
  });
});
