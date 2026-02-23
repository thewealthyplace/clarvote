import React, { useState } from 'react';
import { openContractCall } from '@stacks/connect';
import { bufferFromHex, uintCV, bufferCV } from '@stacks/transactions';
import { useWizard } from './WizardContext';
import { uploadToIPFS, cidToBytes32, ProposalMetadata } from '../../lib/ipfs';
import { STACKS_NETWORK } from '../../constants';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CLARVOTE_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'clarvote-core';

const VOTING_PERIODS = [
  { label: '3 days',  blocks: 4320  },
  { label: '5 days',  blocks: 7200  },
  { label: '7 days',  blocks: 10080 },
  { label: '14 days', blocks: 20160 },
];

export function StepFour({ userAddress }: { userAddress: string }) {
  const { draft, updateDraft, resetDraft } = useWizard();
  const [uploading, setUploading] = useState(false);
  const [txPending, setTxPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    setError(null);
    setUploading(true);

    let cid = draft.ipfsCid;

    try {
      if (!cid) {
        const metadata: ProposalMetadata = {
          title: draft.title,
          category: draft.category,
          body: draft.body,
          author: userAddress,
          created: new Date().toISOString(),
          actions: draft.actions,
        };
        cid = await uploadToIPFS(metadata);
        updateDraft({ ipfsCid: cid });
      }

      setUploading(false);
      setTxPending(true);

      const cidHex = cidToBytes32(cid);

      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'create-proposal',
        functionArgs: [
          bufferCV(bufferFromHex(cidHex.slice(2))),
          uintCV(draft.votingPeriodBlocks),
        ],
        network: STACKS_NETWORK,
        onFinish: () => { setTxPending(false); setSubmitted(true); },
        onCancel: () => { setTxPending(false); setError('Transaction cancelled.'); },
      });
    } catch (err: any) {
      setUploading(false);
      setTxPending(false);
      setError(err.message);
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="text-5xl">🎉</div>
        <h2 className="text-xl font-bold text-white">Proposal Submitted!</h2>
        <p className="text-sm text-gray-400">Your proposal is being confirmed on-chain.</p>
        {draft.ipfsCid && (
          <p className="text-xs font-mono text-gray-500">IPFS CID: {draft.ipfsCid}</p>
        )}
        <button onClick={resetDraft} className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm">
          Create Another Proposal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Step 4 — Review & Submit</h2>
        <p className="text-sm text-gray-400">Review your proposal before submitting to the blockchain.</p>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-gray-800 p-4 space-y-3 text-sm">
        <div><span className="text-gray-400">Title:</span> <span className="text-white font-medium">{draft.title}</span></div>
        <div><span className="text-gray-400">Category:</span> <span className="text-white capitalize">{draft.category.replace('-', ' ')}</span></div>
        <div><span className="text-gray-400">Body length:</span> <span className="text-white">{draft.body.length} characters</span></div>
        <div><span className="text-gray-400">On-chain actions:</span> <span className="text-white">{draft.actions.length}</span></div>
      </div>

      {/* Voting period */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Voting Period</label>
        <div className="grid grid-cols-4 gap-2">
          {VOTING_PERIODS.map((p) => (
            <button
              key={p.blocks}
              onClick={() => updateDraft({ votingPeriodBlocks: p.blocks })}
              className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                draft.votingPeriodBlocks === p.blocks
                  ? 'border-blue-500 bg-blue-900/30 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* IPFS status */}
      {draft.ipfsCid && (
        <p className="text-xs text-green-400">✓ Metadata already uploaded: {draft.ipfsCid}</p>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={() => { /* go back to step 3 */ }}
          className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-300 text-sm"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={uploading || txPending}
          className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium text-sm disabled:opacity-50"
        >
          {uploading ? 'Uploading to IPFS...' : txPending ? 'Awaiting wallet...' : 'Submit Proposal'}
        </button>
      </div>
    </div>
  );
}
