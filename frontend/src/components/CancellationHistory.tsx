import React, { useEffect, useState } from 'react';
import { callReadOnlyFunction, cvToJSON, uintCV } from '@stacks/transactions';
import { STACKS_NETWORK } from '../constants';

interface CancellationRecord {
  proposalId: number;
  guardian: string;
  reason: string;
  block: number;
  refunded: boolean;
}

const GUARDIAN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GUARDIAN_CONTRACT_ADDRESS || '';
const GUARDIAN_CONTRACT_NAME = 'clarvote-guardian';

export function CancellationHistory() {
  const [records, setRecords] = useState<CancellationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      try {
        // Fetch last 20 proposals and check if any are cancelled
        const fetched: CancellationRecord[] = [];
        for (let id = 1; id <= 20; id++) {
          const logResult = await callReadOnlyFunction({
            contractAddress: GUARDIAN_CONTRACT_ADDRESS,
            contractName: GUARDIAN_CONTRACT_NAME,
            functionName: 'get-cancellation-log',
            functionArgs: [uintCV(id)],
            network: STACKS_NETWORK,
            senderAddress: GUARDIAN_CONTRACT_ADDRESS,
          });

          const json = cvToJSON(logResult);
          if (json.value?.value) {
            const record = json.value.value;
            fetched.push({
              proposalId: id,
              guardian: record['cancelled-by']?.value ?? '',
              reason: record.reason?.value ?? '',
              block: Number(record.block?.value ?? 0),
              refunded: record.refunded?.value ?? false,
            });
          }
        }
        setRecords(fetched);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, []);

  if (loading) return <p className="text-sm text-gray-400">Loading cancellation history...</p>;
  if (error)   return <p className="text-sm text-red-500">Error: {error}</p>;

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">Emergency Cancellation History</h2>

      {records.length === 0 ? (
        <p className="text-sm text-gray-400">No proposals have been cancelled.</p>
      ) : (
        <div className="space-y-3">
          {records.map((r) => (
            <div key={r.proposalId} className="rounded-lg bg-gray-800 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">Proposal #{r.proposalId}</span>
                <span className="text-xs text-gray-500">Block {r.block}</span>
              </div>
              <p className="text-sm text-red-400">Reason: {r.reason}</p>
              <p className="text-xs text-gray-500 font-mono">Guardian: {r.guardian}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${r.refunded ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                {r.refunded ? 'Deposit refunded' : 'Deposit pending'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
