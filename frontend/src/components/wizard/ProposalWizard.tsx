import React from 'react';
import { WizardProvider, useWizard } from './WizardContext';
import { ProgressBar } from './ProgressBar';
import { StepOne } from './StepOne';
import { StepTwo } from './StepTwo';
import { StepThree } from './StepThree';
import { StepFour } from './StepFour';

interface ProposalWizardProps {
  userAddress: string | null;
  tokenBalance: number;
  proposalThreshold: number;
}

function WizardInner({ userAddress, tokenBalance, proposalThreshold }: ProposalWizardProps) {
  const { step } = useWizard();

  // Eligibility gate
  if (!userAddress) {
    return (
      <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center space-y-3">
        <p className="text-white font-medium">Connect your wallet to create a proposal.</p>
      </div>
    );
  }

  if (tokenBalance < proposalThreshold) {
    return (
      <div className="rounded-xl border border-yellow-800 bg-gray-900 p-8 text-center space-y-3">
        <p className="text-yellow-400 font-medium">Insufficient balance to create a proposal.</p>
        <p className="text-sm text-gray-400">
          You need <span className="text-white font-mono">{proposalThreshold.toLocaleString()} CVOTE</span> to submit a proposal.
          Your balance: <span className="text-white font-mono">{tokenBalance.toLocaleString()} CVOTE</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Create a Proposal</h1>
      <ProgressBar />

      {step === 1 && <StepOne />}
      {step === 2 && <StepTwo />}
      {step === 3 && <StepThree />}
      {step === 4 && <StepFour userAddress={userAddress} />}
    </div>
  );
}

export function ProposalWizard(props: ProposalWizardProps) {
  return (
    <WizardProvider>
      <WizardInner {...props} />
    </WizardProvider>
  );
}
