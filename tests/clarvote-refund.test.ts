import { describe, it, expect, beforeEach } from 'vitest';
import { Clarinet, Tx, Chain, Account, types } from '@hirosystems/clarinet-sdk';

describe('clarvote-refund', () => {
  let chain: Chain;
  let accounts: Map<string, Account>;
  let deployer: Account;
  let proposer: Account;

  beforeEach(async () => {
    ({ chain, accounts } = await Clarinet.loadProject('./'));
    deployer = accounts.get('deployer')!;
    proposer = accounts.get('wallet_1')!;
  });

  describe('get-deposit', () => {
    it('returns none when no deposit is locked', async () => {
      const result = chain.callReadOnlyFn(
        'clarvote-refund', 'get-deposit',
        [types.principal(proposer.address)], deployer.address
      );
      result.result.expectOk().expectNone();
    });
  });

  describe('refund-deposit', () => {
    it('reverts if no deposit exists for proposer', async () => {
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-refund', 'refund-deposit', [
          types.principal(proposer.address),
        ], deployer.address),
      ]);
      block.receipts[0].result.expectErr().expectUint(410);
    });
  });
});
