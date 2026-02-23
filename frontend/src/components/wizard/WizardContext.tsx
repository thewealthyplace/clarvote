import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ProposalCategory = 'treasury' | 'parameter-change' | 'protocol-upgrade' | 'other';

export interface OnChainAction {
  contract: string;
  function: string;
  args: string; // JSON string
}

export interface ProposalDraft {
  title: string;
  category: ProposalCategory;
  body: string;
  actions: OnChainAction[];
  votingPeriodBlocks: number;
  ipfsCid: string | null;
}

interface WizardContextValue {
  step: number;
  draft: ProposalDraft;
  setStep: (s: number) => void;
  updateDraft: (partial: Partial<ProposalDraft>) => void;
  resetDraft: () => void;
}

const DEFAULT_DRAFT: ProposalDraft = {
  title: '',
  category: 'other',
  body: '',
  actions: [],
  votingPeriodBlocks: 14400,
  ipfsCid: null,
};

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<ProposalDraft>(DEFAULT_DRAFT);

  function updateDraft(partial: Partial<ProposalDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  function resetDraft() {
    setStep(1);
    setDraft(DEFAULT_DRAFT);
  }

  return (
    <WizardContext.Provider value={{ step, draft, setStep, updateDraft, resetDraft }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used inside WizardProvider');
  return ctx;
}
