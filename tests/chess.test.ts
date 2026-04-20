import { describe, it, expect } from 'vitest';
import { initSimnet } from '@hirosystems/clarinet-sdk';
import { Cl } from '@stacks/transactions';

const simnet = await initSimnet();
const accounts = simnet.getAccounts();
const wallet1 = accounts.get('wallet_1')!;
const wallet2 = accounts.get('wallet_2')!;

describe('chess contract', () => {
  it('creates a new game and returns game id 1', () => {
    const { result } = simnet.callPublicFn(
      'chess',
      'create-game',
      [Cl.principal(wallet2)],
      wallet1,
    );
    expect(result).toBeOk(Cl.uint(1));
  });

  it('allows white to make the first move', () => {
    simnet.callPublicFn('chess', 'create-game', [Cl.principal(wallet2)], wallet1);
    const { result } = simnet.callPublicFn(
      'chess',
      'make-move',
      [Cl.uint(1), Cl.stringAscii('e2e4')],
      wallet1,
    );
    expect(result).toBeOk(Cl.bool(true));
  });

  it('rejects a move when it is not the caller\'s turn', () => {
    simnet.callPublicFn('chess', 'create-game', [Cl.principal(wallet2)], wallet1);
    const { result } = simnet.callPublicFn(
      'chess',
      'make-move',
      [Cl.uint(1), Cl.stringAscii('e7e5')],
      wallet2, // black tries to move first
    );
    expect(result).toBeErr(Cl.uint(103));
  });

  it('rejects creating a game against yourself', () => {
    const { result } = simnet.callPublicFn(
      'chess',
      'create-game',
      [Cl.principal(wallet1)],
      wallet1,
    );
    expect(result).toBeErr(Cl.uint(105));
  });

  it('returns game state via get-game', () => {
    simnet.callPublicFn('chess', 'create-game', [Cl.principal(wallet2)], wallet1);
    const { result } = simnet.callReadOnlyFn('chess', 'get-game', [Cl.uint(1)], wallet1);
    expect(result).toBeSome();
  });

  it('rejects a move on a finished game', () => {
    simnet.callPublicFn('chess', 'create-game', [Cl.principal(wallet2)], wallet1);
    simnet.callPublicFn('chess', 'end-game', [Cl.uint(1), Cl.stringAscii('white')], wallet1);
    const { result } = simnet.callPublicFn(
      'chess',
      'make-move',
      [Cl.uint(1), Cl.stringAscii('e2e4')],
      wallet1,
    );
    expect(result).toBeErr(Cl.uint(104));
  });
});
