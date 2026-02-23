import { describe, it, expect, beforeEach } from 'vitest';
import { Clarinet, Tx, Chain, Account, types } from '@hirosystems/clarinet-sdk';

describe('clarvote-guardian', () => {
  let chain: Chain;
  let accounts: Map<string, Account>;
  let deployer: Account;
  let guardian: Account;
  let proposer: Account;
  let attacker: Account;

  beforeEach(async () => {
    ({ chain, accounts } = await Clarinet.loadProject('./'));
    deployer = accounts.get('deployer')!;
    guardian = accounts.get('wallet_1')!;
    proposer = accounts.get('wallet_2')!;
    attacker = accounts.get('wallet_3')!;
  });

  // ── Guardian role ────────────────────────────────────────────────────

  describe('set-guardian', () => {
    it('deployer can transfer guardian role', async () => {
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-guardian', 'set-guardian', [
          types.principal(guardian.address),
        ], deployer.address),
      ]);
      block.receipts[0].result.expectOk().expectBool(true);
    });

    it('non-guardian cannot change guardian role', async () => {
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-guardian', 'set-guardian', [
          types.principal(attacker.address),
        ], attacker.address),
      ]);
      block.receipts[0].result.expectErr().expectUint(401);
    });

    it('emits guardian-changed event', async () => {
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-guardian', 'set-guardian', [
          types.principal(guardian.address),
        ], deployer.address),
      ]);
      expect(block.receipts[0].events.some((e: any) => e.type === 'print_event')).toBe(true);
    });
  });

  // ── cancel-proposal ──────────────────────────────────────────────────

  describe('cancel-proposal', () => {
    function setupQueuedProposal() {
      return chain.mineBlock([
        // Create proposal
        Tx.contractCall('clarvote-guardian', 'create-test-proposal', [
          types.uint(100000),
        ], proposer.address),
        // Manually mark as PASSED so we can queue it
        Tx.contractCall('clarvote-guardian', 'queue-proposal', [
          types.uint(1),
          types.uint(4320),
        ], deployer.address),
      ]);
    }

    it('guardian can cancel a queued proposal', async () => {
      setupQueuedProposal();

      const block = chain.mineBlock([
        Tx.contractCall('clarvote-guardian', 'cancel-proposal', [
          types.uint(1),
          types.ascii('Critical bug found in execution payload'),
        ], deployer.address), // deployer is initial guardian
      ]);
      block.receipts[0].result.expectOk().expectBool(true);
    });

    it('sets proposal status to CANCELLED (u6)', async () => {
      setupQueuedProposal();
      chain.mineBlock([
        Tx.contractCall('clarvote-guardian', 'cancel-proposal', [
          types.uint(1),
          types.ascii('Security issue'),
        ], deployer.address),
      ]);

      const result = chain.callReadOnlyFn(
        'clarvote-guardian', 'get-proposal-status',
        [types.uint(1)], deployer.address
      );
      result.result.expectOk().expectUint(6); // STATUS-CANCELLED
    });

    it('non-guardian cannot cancel a proposal', async () => {
      setupQueuedProposal();

      const block = chain.mineBlock([
        Tx.contractCall('clarvote-guardian', 'cancel-proposal', [
          types.uint(1),
          types.ascii('Unauthorized attempt'),
        ], attacker.address),
      ]);
      block.receipts[0].result.expectErr().expectUint(401);
    });

    it('cannot cancel a proposal not in QUEUED state', async () => {
      chain.mineBlock([
        Tx.contractCall('clarvote-guardian', 'create-test-proposal', [
          types.uint(100000),
        ], proposer.address),
      ]);

      // Proposal is in PENDING (u0), not QUEUED (u4)
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-guardian', 'cancel-proposal', [
          types.uint(1),
          types.ascii('Trying to cancel pending proposal'),
        ], deployer.address),
      ]);
      block.receipts[0].result.expectErr().expectUint(403);
    });

    it('cannot cancel a non-existent proposal', async () => {
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-guardian', 'cancel-proposal', [
          types.uint(999),
          types.ascii('Does not exist'),
        ], deployer.address),
      ]);
      block.receipts[0].result.expectErr().expectUint(404);
    });

    it('emits proposal-cancelled event with reason', async () => {
      setupQueuedProposal();
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-guardian', 'cancel-proposal', [
          types.uint(1),
          types.ascii('Malicious payload detected'),
        ], deployer.address),
      ]);
      expect(block.receipts[0].events.some((e: any) => e.type === 'print_event')).toBe(true);
    });

    it('writes cancellation log record', async () => {
      setupQueuedProposal();
      chain.mineBlock([
        Tx.contractCall('clarvote-guardian', 'cancel-proposal', [
          types.uint(1),
          types.ascii('Bug in contract call'),
        ], deployer.address),
      ]);

      const log = chain.callReadOnlyFn(
        'clarvote-guardian', 'get-cancellation-log',
        [types.uint(1)], deployer.address
      );
      log.result.expectOk().expectSome();
    });
  });

  // ── Guardian expiry ──────────────────────────────────────────────────

  describe('guardian expiry', () => {
    it('guardian is active by default (no expiry)', async () => {
      const result = chain.callReadOnlyFn(
        'clarvote-guardian', 'is-guardian-active', [], deployer.address
      );
      result.result.expectOk().expectBool(true);
    });

    it('guardian can set their own expiry', async () => {
      const block = chain.mineBlock([
        Tx.contractCall('clarvote-guardian', 'set-guardian-expiry', [
          types.uint(999999),
        ], deployer.address),
      ]);
      block.receipts[0].result.expectOk().expectBool(true);
    });
  });
});
