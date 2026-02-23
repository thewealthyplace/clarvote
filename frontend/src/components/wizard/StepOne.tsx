import React from 'react';
import { useWizard, ProposalCategory } from './WizardContext';

const CATEGORIES: { value: ProposalCategory; label: string; description: string }[] = [
  { value: 'treasury',          label: 'Treasury',          description: 'Allocate or move DAO funds' },
  { value: 'parameter-change',  label: 'Parameter Change',  description: 'Update governance parameters' },
  { value: 'protocol-upgrade',  label: 'Protocol Upgrade',  description: 'Deploy or upgrade contracts' },
  { value: 'other',             label: 'Other',             description: 'General DAO decisions' },
];

export function StepOne() {
  const { draft, updateDraft, setStep } = useWizard();

  const isValid = draft.title.trim().length >= 5 && draft.title.trim().length <= 120;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Step 1 — Title & Category</h2>
        <p className="text-sm text-gray-400">Give your proposal a clear title and choose a category.</p>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-300">Proposal Title</label>
        <input
          type="text"
          maxLength={120}
          value={draft.title}
          onChange={(e) => updateDraft({ title: e.target.value })}
          placeholder="e.g. Increase developer grant budget by 20%"
          className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{draft.title.length < 5 ? 'Minimum 5 characters' : ''}</span>
          <span>{draft.title.length}/120</span>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Category</label>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateDraft({ category: cat.value })}
              className={`rounded-lg border p-3 text-left transition-colors ${
                draft.category === cat.value
                  ? 'border-blue-500 bg-blue-900/30 text-white'
                  : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="font-medium text-sm">{cat.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{cat.description}</div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        disabled={!isValid}
        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-40"
      >
        Next: Description →
      </button>
    </div>
  );
}
