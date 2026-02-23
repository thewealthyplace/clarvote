import { callReadOnlyFunction, cvToJSON, principalCV } from '@stacks/transactions';
import { STACKS_NETWORK } from '../constants';

const TOKEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_CONTRACT_ADDRESS || '';
const TOKEN_CONTRACT_NAME = 'clarvote-token';

export interface EligibilityResult {
  eligible: boolean;
  balance: number;
  threshold: number;
  reason: string | null;
}

export async function checkProposalEligibility(
  address: string,
  threshold: number
): Promise<EligibilityResult> {
  try {
    const balanceResult = await callReadOnlyFunction({
      contractAddress: TOKEN_CONTRACT_ADDRESS,
      contractName: TOKEN_CONTRACT_NAME,
      functionName: 'get-balance',
      functionArgs: [principalCV(address)],
      network: STACKS_NETWORK,
      senderAddress: address,
    });

    const json = cvToJSON(balanceResult);
    const balance = Number(json.value?.value ?? 0);

    if (balance < threshold) {
      return {
        eligible: false,
        balance,
        threshold,
        reason: `Insufficient token balance. Need ${threshold.toLocaleString()}, have ${balance.toLocaleString()}.`,
      };
    }

    return { eligible: true, balance, threshold, reason: null };
  } catch (err: any) {
    return {
      eligible: false,
      balance: 0,
      threshold,
      reason: `Failed to check eligibility: ${err.message}`,
    };
  }
}
