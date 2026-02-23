import { useState, useEffect } from 'react';
import { callReadOnlyFunction, cvToJSON } from '@stacks/transactions';
import { STACKS_NETWORK } from '../constants';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GUARDIAN_CONTRACT_ADDRESS || '';
const CONTRACT_NAME = 'clarvote-guardian';

export function useGuardian(userAddress: string | null) {
  const [guardianAddress, setGuardianAddress] = useState<string | null>(null);
  const [isGuardian, setIsGuardian] = useState(false);
  const [guardianActive, setGuardianActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const [guardianResult, activeResult] = await Promise.all([
          callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-guardian',
            functionArgs: [],
            network: STACKS_NETWORK,
            senderAddress: CONTRACT_ADDRESS,
          }),
          callReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'is-guardian-active',
            functionArgs: [],
            network: STACKS_NETWORK,
            senderAddress: CONTRACT_ADDRESS,
          }),
        ]);

        const gAddr = cvToJSON(guardianResult).value?.value ?? null;
        setGuardianAddress(gAddr);
        setIsGuardian(!!userAddress && gAddr === userAddress);
        setGuardianActive(cvToJSON(activeResult).value?.value === true);
      } catch (e) {
        setIsGuardian(false);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [userAddress]);

  return { guardianAddress, isGuardian, guardianActive, loading };
}
