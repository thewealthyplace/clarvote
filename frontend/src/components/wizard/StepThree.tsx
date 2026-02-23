import React, { useState } from 'react';
import { useWizard, OnChainAction } from './WizardContext';

const EMPTY_ACTION: OnChainAction = { contract: '', function: '', args: '[]' };

export function StepThree() {
  const { draft, updateDraft, setStep } = useWizard();
  const [newAction, setNewAction] = useState<OnChainAction>({ ...EMPTY_ACTION });
  const [jsonError, setJsonError] = useState<string | null>(null);

  function validateJson(val: string) {
    try {
      JSON.parse(val);
      setJsonError(null);
      return true;
    } catch {
      setJsonError('Invalid JSON array');
      return false;
    }
  }

  function addAction() {
    if (!newAction.contract || !newAction.function) return;
    if (!validateJson(newAction.args)) return;
    updateDraft({ actions: [...draft.actions, { ...newAction }] });
    setNewAction({ ...EMPTY_ACTION });
  }

  function removeAction(index: number) {
    updateDraft({ actions: draft.actions.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Step 3 — On-Chain Actions</h2>
        <p className="text-sm text-gray-400">
          Optionally attach executable contract calls. Skip this step for signalling proposals.
        </p>
      </div>

      {/* Existing actions */}
      {draft.actions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-300">Attached actions ({draft.actions.length})</p>
          {draft.actions.map((action, i) => (
            <div key={i} className="flex items-start justify-between rounded-lg bg-gray-800 p-3 text-sm">
              <div className="space-y-0.5">
                <p className="font-mono text-blue-400">{action.contract}</p>
                <p className="text-gray-300">Function: <span className="font-mono">{action.function}</span></p>
                <p className="text-gray-500 text-xs">Args: {action.args}</p>
              </div>
              <button onClick={() => removeAction(i)} className="text-red-400 hover:text-red-300 text-xs ml-4">Remove</button>
            </div>
          ))}
        </div>
      )}

      {/* Add new action */}
      <div className="rounded-lg border border-dashed border-gray-600 p-4 space-y-3">
        <p className="text-sm font-medium text-gray-300">Add an action</p>
        <input
          placeholder="Contract address (e.g. SP1ABC.my-contract)"
          value={newAction.contract}
          onChange={(e) => setNewAction((a) => ({ ...a, contract: e.target.value }))}
          className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white placeholder-gray-500 font-mono"
        />
        <input
          placeholder="Function name (e.g. transfer)"
          value={newAction.function}
          onChange={(e) => setNewAction((a) => ({ ...a, function: e.target.value }))}
          className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white placeholder-gray-500 font-mono"
        />
        <div>
          <textarea
            placeholder='Arguments as JSON array (e.g. ["SP1...", 1000000])'
            value={newAction.args}
            onChange={(e) => { setNewAction((a) => ({ ...a, args: e.target.value })); validateJson(e.target.value); }}
            rows={3}
            className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white placeholder-gray-500 font-mono"
          />
          {jsonError && <p className="text-xs text-red-400 mt-1">{jsonError}</p>}
        </div>
        <button
          onClick={addAction}
          disabled={!newAction.contract || !newAction.function || !!jsonError}
          className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm disabled:opacity-40"
        >
          + Add Action
        </button>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(2)} className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 text-sm">
          ← Back
        </button>
        <button
          onClick={() => setStep(4)}
          className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
        >
          Next: Review →
        </button>
      </div>
    </div>
  );
}
