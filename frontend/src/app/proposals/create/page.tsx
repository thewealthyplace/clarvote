'use client';

import React from 'react';
import { ProposalWizard } from '../../../components/wizard/ProposalWizard';
import { useConnect } from '@stacks/connect-react';

export default function CreateProposalPage() {
  const { userSession } = useConnect();

  const userAddress = userSession?.isUserSignedIn()
    ? userSession.loadUserData().profile.stxAddress.mainnet
    : null;

  // In production, fetch these from chain
  const tokenBalance = 0;
  const proposalThreshold = 100000;

  return (
    <main className="min-h-screen bg-gray-950 py-12 px-4">
      <ProposalWizard
        userAddress={userAddress}
        tokenBalance={tokenBalance}
        proposalThreshold={proposalThreshold}
      />
    </main>
  );
}
