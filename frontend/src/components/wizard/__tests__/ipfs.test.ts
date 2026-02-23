import { describe, it, expect } from 'vitest';
import { cidToBytes32 } from '../../lib/ipfs';

describe('cidToBytes32', () => {
  it('converts a CID string to a hex-prefixed string', () => {
    const cid = 'QmTestCid123';
    const result = cidToBytes32(cid);
    expect(result.startsWith('0x')).toBe(true);
  });

  it('produces different hex for different CIDs', () => {
    const a = cidToBytes32('QmCidA');
    const b = cidToBytes32('QmCidB');
    expect(a).not.toBe(b);
  });

  it('is deterministic for the same CID', () => {
    const cid = 'QmSameCid';
    expect(cidToBytes32(cid)).toBe(cidToBytes32(cid));
  });
});
