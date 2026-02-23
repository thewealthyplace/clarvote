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
  'clarvote-refund',
  'clarvote-cancellation-log',
  'clarvote-guardian',
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
  await new Promise((r) => setTimeout(r, 3000));
}

async function main() {
  console.log('Deploying guardian contracts to testnet...\n');
  for (const name of CONTRACTS) {
    await deployContract(name);
  }
  console.log('\nAll guardian contracts deployed!');
}

main().catch(console.error);
