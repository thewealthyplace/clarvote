import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { WizardProvider, useWizard } from '../WizardContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WizardProvider>{children}</WizardProvider>
);

describe('WizardContext', () => {
  it('starts at step 1 with an empty draft', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });
    expect(result.current.step).toBe(1);
    expect(result.current.draft.title).toBe('');
    expect(result.current.draft.body).toBe('');
    expect(result.current.draft.actions).toHaveLength(0);
  });

  it('updates step via setStep', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });
    act(() => result.current.setStep(3));
    expect(result.current.step).toBe(3);
  });

  it('updateDraft merges partial updates', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });
    act(() => result.current.updateDraft({ title: 'My Proposal', category: 'treasury' }));
    expect(result.current.draft.title).toBe('My Proposal');
    expect(result.current.draft.category).toBe('treasury');
    expect(result.current.draft.body).toBe(''); // untouched
  });

  it('resetDraft returns to step 1 with blank state', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });
    act(() => {
      result.current.setStep(4);
      result.current.updateDraft({ title: 'Something' });
    });
    act(() => result.current.resetDraft());
    expect(result.current.step).toBe(1);
    expect(result.current.draft.title).toBe('');
  });

  it('actions array can be updated', () => {
    const { result } = renderHook(() => useWizard(), { wrapper });
    act(() => result.current.updateDraft({
      actions: [{ contract: 'SP1.mycontract', function: 'transfer', args: '[]' }],
    }));
    expect(result.current.draft.actions).toHaveLength(1);
  });
});
