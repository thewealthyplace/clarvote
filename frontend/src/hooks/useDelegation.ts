import { useState, useEffect } from 'react';
import { callReadOnlyFunction, cvToJSON, principalCV } from '@stacks/transactions';
import { STACKS_NETWORK, CLARVOTE_DELEGATION_CONTRACT } from '../constants';

export interface DelegationStatus {
  isDelegating: boolean;
  delegatee: string | null;
  resolvedDelegate: string;
  loading: boolean;
  error: string | null;
}

export function useDelegation(address: string | null): DelegationStatus {
  const [status, setStatus] = useState<DelegationStatus>({
    isDelegating: false,
    delegatee: null,
    resolvedDelegate: address || '',
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!address) return;

    async function fetchDelegation() {
      setStatus((s) => ({ ...s, loading: true, error: null }));

      try {
        const [delegateResult, resolvedResult] = await Promise.all([
          callReadOnlyFunction({
            contractAddress: CLARVOTE_DELEGATION_CONTRACT.split('.')[0],
            contractName: CLARVOTE_DELEGATION_CONTRACT.split('.')[1],
            functionName: 'get-delegate',
            functionArgs: [principalCV(address!)],
            network: STACKS_NETWORK,
            senderAddress: address!,
          }),
          callReadOnlyFunction({
            contractAddress: CLARVOTE_DELEGATION_CONTRACT.split('.')[0],
            contractName: CLARVOTE_DELEGATION_CONTRACT.split('.')[1],
            functionName: 'get-resolved-delegate',
            functionArgs: [principalCV(address!)],
            network: STACKS_NETWORK,
            senderAddress: address!,
          }),
        ]);

        const delegateJson = cvToJSON(delegateResult);
        const resolvedJson = cvToJSON(resolvedResult);

        const delegatee =
          delegateJson.value?.value ?? null;

        setStatus({
          isDelegating: delegatee !== null,
          delegatee,
          resolvedDelegate: resolvedJson.value ?? address!,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        setStatus((s) => ({ ...s, loading: false, error: err.message }));
      }
    }

    fetchDelegation();
  }, [address]);

  return status;
}
