import React, { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, stringAsciiCV } from '@stacks/transactions';
import { STACKS_NETWORK } from '../constants';

const GUARDIAN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GUARDIAN_CONTRACT_ADDRESS || '';
const GUARDIAN_CONTRACT_NAME = 'clarvote-guardian';

interface GuardianPanelProps {
  isGuardian: boolean;
  queuedProposals: { id: number; title: string }[];
}

export function GuardianPanel({ isGuardian, queuedProposals }: GuardianPanelProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [txPending, setTxPending] = useState(false);

  if (!isGuardian) return null;

  async function handleCancel() {
    if (!selectedId || !reason.trim()) return;
    setTxPending(true);
    await openContractCall({
      contractAddress: GUARDIAN_CONTRACT_ADDRESS,
      contractName: GUARDIAN_CONTRACT_NAME,
      functionName: 'cancel-proposal',
      functionArgs: [uintCV(selectedId), stringAsciiCV(reason.trim())],
      network: STACKS_NETWORK,
      onFinish: () => { setTxPending(false); setReason(''); setSelectedId(null); },
      onCancel: () => setTxPending(false),
    });
  }

  return (
    <div className="rounded-xl border border-red-800 bg-gray-900 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-red-400">Guardian Panel — Emergency Cancellation</h2>
      <p className="text-xs text-gray-500">
        This panel is only visible to the current guardian. Cancellations are permanent and logged on-chain.
      </p>

      <div className="space-y-2">
        <label className="text-sm text-gray-300">Select queued proposal to cancel</label>
        <select
          value={selectedId ?? ''}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white"
        >
          <option value="">-- Select proposal --</option>
          {queuedProposals.map((p) => (
            <option key={p.id} value={p.id}>#{p.id} {p.title}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-gray-300">Cancellation reason (required, stored on-chain)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={256}
          rows={3}
          placeholder="Describe why this proposal must be cancelled..."
          className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white placeholder-gray-500"
        />
        <p className="text-xs text-gray-500 text-right">{reason.length}/256</p>
      </div>

      <button
        onClick={handleCancel}
        disabled={txPending || !selectedId || !reason.trim()}
        className="w-full px-4 py-2 rounded-lg bg-red-700 hover:bg-red-800 text-white font-medium text-sm disabled:opacity-50"
      >
        {txPending ? 'Submitting...' : 'Cancel Proposal (Emergency)'}
      </button>
    </div>
  );
}
