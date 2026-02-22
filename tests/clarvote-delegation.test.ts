import { describe, it, expect, beforeEach } from 'vitest';
import { Clarinet, Tx, Chain, Account, types } from '@hirosystems/clarinet-sdk';

describe('clarvote-delegation', () => {
  let chain: Chain;
  let accounts: Map<string, Account>;
  let deployer: Account;
  let walletA: Account;
  let walletB: Account;
  let walletC: Account;

  beforeEach(async () => {
    ({ chain, accounts } = await Clarinet.loadProject('./'));
    deployer = accounts.get('deployer')!;
    walletA  = accounts.get('wallet_1')!;
    walletB  = accounts.get('wallet_2')!;
    walletC  = accounts.get('wallet_3')!;
  });

  // ── delegate ────────────────────────────────────────────────────────

  describe('delegate', () => {
    it('allows A to delegate to B', async () => {
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'delegate', [
          types.principal(walletB.address),
        ], walletA.address),
      ]);
      block.receipts[0].result.expectOk().expectBool(true);
    });

    it('rejects self-delegation', async () => {
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'delegate', [
          types.principal(walletA.address),
        ], walletA.address),
      ]);
      block.receipts[0].result.expectErr().expectUint(400);
    });

    it('rejects circular delegation A→B→A', async () => {
      // A delegates to B
      chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'delegate', [
          types.principal(walletB.address),
        ], walletA.address),
      ]);

      // B tries to delegate back to A (cycle)
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'delegate', [
          types.principal(walletA.address),
        ], walletB.address),
      ]);
      block.receipts[0].result.expectErr().expectUint(401);
    });

    it('allows a 3-level chain A→B→C', async () => {
      chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'delegate', [
          types.principal(walletB.address),
        ], walletA.address),
      ]);

      const block = chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'delegate', [
          types.principal(walletC.address),
        ], walletB.address),
      ]);
      block.receipts[0].result.expectOk().expectBool(true);
    });

    it('emits a delegation-set event', async () => {
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'delegate', [
          types.principal(walletB.address),
        ], walletA.address),
      ]);
      const events = block.receipts[0].events;
      expect(events.some((e: any) => e.type === 'print_event')).toBe(true);
    });
  });

  // ── undelegate ──────────────────────────────────────────────────────

  describe('undelegate', () => {
    it('allows A to remove their delegation', async () => {
      chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'delegate', [
          types.principal(walletB.address),
        ], walletA.address),
      ]);

      const block = chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'undelegate', [], walletA.address),
      ]);
      block.receipts[0].result.expectOk().expectBool(true);
    });

    it('rejects undelegate when not delegating', async () => {
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'undelegate', [], walletA.address),
      ]);
      block.receipts[0].result.expectErr().expectUint(403);
    });

    it('emits delegation-removed event on undelegate', async () => {
      chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'delegate', [
          types.principal(walletB.address),
        ], walletA.address),
      ]);
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'undelegate', [], walletA.address),
      ]);
      const events = block.receipts[0].events;
      expect(events.some((e: any) => e.type === 'print_event')).toBe(true);
    });
  });

  // ── get-delegate ────────────────────────────────────────────────────

  describe('get-delegate', () => {
    it('returns none when not delegating', async () => {
      const result = chain.callReadOnlyFn(
        'clarvote-delegation', 'get-delegate',
        [types.principal(walletA.address)], deployer.address
      );
      result.result.expectOk().expectNone();
    });

    it('returns some(delegatee) when delegating', async () => {
      chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'delegate', [
          types.principal(walletB.address),
        ], walletA.address),
      ]);

      const result = chain.callReadOnlyFn(
        'clarvote-delegation', 'get-delegate',
        [types.principal(walletA.address)], deployer.address
      );
      result.result.expectOk().expectSome().expectPrincipal(walletB.address);
    });
  });

  // ── resolve-delegate ────────────────────────────────────────────────

  describe('resolve-delegate (chain traversal)', () => {
    it('resolves self when no delegation', async () => {
      const result = chain.callReadOnlyFn(
        'clarvote-delegation', 'get-resolved-delegate',
        [types.principal(walletA.address)], deployer.address
      );
      result.result.expectOk().expectPrincipal(walletA.address);
    });

    it('resolves to end of 2-level chain A→B', async () => {
      chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'delegate', [
          types.principal(walletB.address),
        ], walletA.address),
      ]);

      const result = chain.callReadOnlyFn(
        'clarvote-delegation', 'get-resolved-delegate',
        [types.principal(walletA.address)], deployer.address
      );
      result.result.expectOk().expectPrincipal(walletB.address);
    });

    it('resolves to end of 3-level chain A→B→C', async () => {
      chain.mineBlock([
        Tx.contractCall('clarvote-delegation', 'delegate', [
          types.principal(walletB.address),
        ], walletA.address),
        Tx.contractCall('clarvote-delegation', 'delegate', [
          types.principal(walletC.address),
        ], walletB.address),
      ]);

      const result = chain.callReadOnlyFn(
        'clarvote-delegation', 'get-resolved-delegate',
        [types.principal(walletA.address)], deployer.address
      );
      result.result.expectOk().expectPrincipal(walletC.address);
    });
  });
});
