import {
  makeContractDeploy,
  broadcastTransaction,
  AnchorMode,
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import * as fs from 'fs';
import * as path from 'path';

const network = new StacksTestnet();
const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY!;

const CONTRACTS = [
  'clarvote-token',
  'clarvote-delegation',
  'clarvote-override',
  'clarvote-voting-power',
  'clarvote-delegation-events',
];

async function deployContract(name: string) {
  const contractPath = path.join(__dirname, '..', 'contracts', `${name}.clar`);
  const codeBody = fs.readFileSync(contractPath, 'utf8');

  const tx = await makeContractDeploy({
    contractName: name,
    codeBody,
    senderKey: DEPLOYER_KEY,
    network,
    anchorMode: AnchorMode.Any,
  });

  const result = await broadcastTransaction(tx, network);
  console.log(`✓ Deployed ${name}: txid=${result.txid}`);
  return result.txid;
}

async function main() {
  console.log('Deploying clarvote delegation contracts to testnet...\n');
  for (const name of CONTRACTS) {
    await deployContract(name);
    // small delay between deployments
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.log('\nAll contracts deployed!');
}

main().catch(console.error);
