import { StacksMainnet, StacksTestnet } from '@stacks/network';

export const IS_TESTNET = process.env.NEXT_PUBLIC_NETWORK === 'testnet';

export const STACKS_NETWORK = IS_TESTNET ? new StacksTestnet() : new StacksMainnet();

export const CLARVOTE_DELEGATION_CONTRACT =
  process.env.NEXT_PUBLIC_DELEGATION_CONTRACT ||
  'SP_PLACEHOLDER.clarvote-delegation';

export const CLARVOTE_OVERRIDE_CONTRACT =
  process.env.NEXT_PUBLIC_OVERRIDE_CONTRACT ||
  'SP_PLACEHOLDER.clarvote-override';

export const MAX_DELEGATION_DEPTH = 5;
