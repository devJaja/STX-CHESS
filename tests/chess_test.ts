import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.5.4/index.ts';

Clarinet.test({
    name: "Can create a new game",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('chess', 'create-game', [types.principal(wallet2.address)], wallet1.address)
        ]);
        
        block.receipts[0].result.expectOk().expectUint(1);
    },
});

Clarinet.test({
    name: "Can make a move",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('chess', 'create-game', [types.principal(wallet2.address)], wallet1.address),
            Tx.contractCall('chess', 'make-move', [types.uint(1), types.ascii("e2e4")], wallet1.address)
        ]);
        
        block.receipts[1].result.expectOk().expectBool(true);
    },
});

Clarinet.test({
    name: "Cannot move out of turn",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('chess', 'create-game', [types.principal(wallet2.address)], wallet1.address),
            Tx.contractCall('chess', 'make-move', [types.uint(1), types.ascii("e7e5")], wallet2.address)
        ]);
        
        block.receipts[1].result.expectErr().expectUint(103);
    },
});
