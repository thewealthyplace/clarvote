import { describe, it, expect, beforeEach } from 'vitest';
import { Clarinet, Tx, Chain, Account, types } from '@hirosystems/clarinet-sdk';

describe('clarvote-override (per-proposal delegation override)', () => {
  let chain: Chain;
  let accounts: Map<string, Account>;
  let deployer: Account;
  let walletA: Account;
  let walletB: Account;

  beforeEach(async () => {
    ({ chain, accounts } = await Clarinet.loadProject('./'));
    deployer = accounts.get('deployer')!;
    walletA  = accounts.get('wallet_1')!;
    walletB  = accounts.get('wallet_2')!;
  });

  describe('set-override', () => {
    it('allows a delegator to set an override for a proposal', async () => {
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-override', 'set-override', [
          types.uint(1),
        ], walletA.address),
      ]);
      block.receipts[0].result.expectOk().expectBool(true);
    });

    it('rejects duplicate override for same proposal', async () => {
      chain.mineBlock([
        Tx.contractCall('clarvote-override', 'set-override', [
          types.uint(1),
        ], walletA.address),
      ]);

      const block = chain.mineBlock([
        Tx.contractCall('clarvote-override', 'set-override', [
          types.uint(1),
        ], walletA.address),
      ]);
      block.receipts[0].result.expectErr().expectUint(450);
    });

    it('allows override on different proposal IDs independently', async () => {
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-override', 'set-override', [types.uint(1)], walletA.address),
        Tx.contractCall('clarvote-override', 'set-override', [types.uint(2)], walletA.address),
      ]);
      block.receipts[0].result.expectOk();
      block.receipts[1].result.expectOk();
    });
  });

  describe('has-override', () => {
    it('returns false when no override is set', async () => {
      const result = chain.callReadOnlyFn(
        'clarvote-override', 'has-override',
        [types.uint(1), types.principal(walletA.address)],
        deployer.address
      );
      result.result.expectOk().expectBool(false);
    });

    it('returns true after override is set', async () => {
      chain.mineBlock([
        Tx.contractCall('clarvote-override', 'set-override', [types.uint(1)], walletA.address),
      ]);
      const result = chain.callReadOnlyFn(
        'clarvote-override', 'has-override',
        [types.uint(1), types.principal(walletA.address)],
        deployer.address
      );
      result.result.expectOk().expectBool(true);
    });
  });

  describe('clear-override', () => {
    it('clears an existing override', async () => {
      chain.mineBlock([
        Tx.contractCall('clarvote-override', 'set-override', [types.uint(1)], walletA.address),
      ]);
      chain.mineBlock([
        Tx.contractCall('clarvote-override', 'clear-override', [types.uint(1)], walletA.address),
      ]);
      const result = chain.callReadOnlyFn(
        'clarvote-override', 'has-override',
        [types.uint(1), types.principal(walletA.address)],
        deployer.address
      );
      result.result.expectOk().expectBool(false);
    });
  });
});
