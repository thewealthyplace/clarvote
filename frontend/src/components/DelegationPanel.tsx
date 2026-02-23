import React, { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { principalCV, noneCV } from '@stacks/transactions';
import { useDelegation } from '../hooks/useDelegation';
import { STACKS_NETWORK, CLARVOTE_DELEGATION_CONTRACT } from '../constants';

interface DelegationPanelProps {
  userAddress: string | null;
}

export function DelegationPanel({ userAddress }: DelegationPanelProps) {
  const { isDelegating, delegatee, resolvedDelegate, loading, error } = useDelegation(userAddress);
  const [delegateeInput, setDelegateeInput] = useState('');
  const [txPending, setTxPending] = useState(false);

  const [contractAddress, contractName] = CLARVOTE_DELEGATION_CONTRACT.split('.');

  async function handleDelegate() {
    if (!delegateeInput.trim()) return;
    setTxPending(true);
    await openContractCall({
      contractAddress,
      contractName,
      functionName: 'delegate',
      functionArgs: [principalCV(delegateeInput.trim())],
      network: STACKS_NETWORK,
      onFinish: () => setTxPending(false),
      onCancel: () => setTxPending(false),
    });
  }

  async function handleUndelegate() {
    setTxPending(true);
    await openContractCall({
      contractAddress,
      contractName,
      functionName: 'undelegate',
      functionArgs: [],
      network: STACKS_NETWORK,
      onFinish: () => setTxPending(false),
      onCancel: () => setTxPending(false),
    });
  }

  if (!userAddress) {
    return <p className="text-sm text-gray-400">Connect your wallet to manage delegation.</p>;
  }

  if (loading) return <p className="text-sm text-gray-400">Loading delegation status...</p>;
  if (error)   return <p className="text-sm text-red-500">Error: {error}</p>;

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">Vote Delegation</h2>

      {isDelegating ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-300">
            You are delegating to:{' '}
            <span className="font-mono text-blue-400">{delegatee}</span>
          </p>
          <p className="text-sm text-gray-500">
            Resolved delegate (end of chain):{' '}
            <span className="font-mono">{resolvedDelegate}</span>
          </p>
          <button
            onClick={handleUndelegate}
            disabled={txPending}
            className="mt-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50"
          >
            {txPending ? 'Pending...' : 'Revoke Delegation'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">You are not currently delegating your votes.</p>
          <input
            type="text"
            value={delegateeInput}
            onChange={(e) => setDelegateeInput(e.target.value)}
            placeholder="SP... (delegate address)"
            className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white placeholder-gray-500"
          />
          <button
            onClick={handleDelegate}
            disabled={txPending || !delegateeInput.trim()}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50"
          >
            {txPending ? 'Pending...' : 'Delegate Votes'}
          </button>
        </div>
      )}
    </div>
  );
}
