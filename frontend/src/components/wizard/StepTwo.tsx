import React, { useState } from 'react';
import { useWizard } from './WizardContext';

export function StepTwo() {
  const { draft, updateDraft, setStep } = useWizard();
  const [preview, setPreview] = useState(false);

  const bodyLength = draft.body.trim().length;
  const isValid = bodyLength >= 100;

  // Simple markdown → HTML for preview (headers, bold, lists)
  function renderMarkdown(md: string): string {
    return md
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4">$1</h3>')
      .replace(/^## (.+)$/gm,  '<h2 class="text-xl font-bold mt-6">$1</h2>')
      .replace(/^# (.+)$/gm,   '<h1 class="text-2xl font-bold mt-6">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,    '<em>$1</em>')
      .replace(/^- (.+)$/gm,   '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n/g, '<br/>');
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white mb-1">Step 2 — Description</h2>
        <p className="text-sm text-gray-400">
          Write a full description of your proposal. Markdown is supported. Minimum 100 characters.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setPreview(false)}
          className={`px-4 py-2 text-sm font-medium ${!preview ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
        >
          Write
        </button>
        <button
          onClick={() => setPreview(true)}
          className={`px-4 py-2 text-sm font-medium ${preview ? 'text-white border-b-2 border-blue-500' : 'text-gray-400'}`}
        >
          Preview
        </button>
      </div>

      {preview ? (
        <div
          className="min-h-[280px] rounded-lg bg-gray-800 p-4 text-gray-200 text-sm prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(draft.body) || '<span class="text-gray-500">Nothing to preview yet.</span>' }}
        />
      ) : (
        <textarea
          value={draft.body}
          onChange={(e) => updateDraft({ body: e.target.value })}
          rows={12}
          placeholder="## Motivation&#10;Explain why this proposal is needed...&#10;&#10;## Specification&#10;Describe exactly what changes are proposed..."
          className="w-full rounded-lg bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-white placeholder-gray-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      <div className="flex justify-between text-xs">
        <span className={bodyLength < 100 ? 'text-yellow-400' : 'text-green-400'}>
          {bodyLength < 100 ? `${100 - bodyLength} more characters needed` : '✓ Minimum length met'}
        </span>
        <span className="text-gray-500">{bodyLength} characters</span>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setStep(1)} className="flex-1 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 text-sm">
          ← Back
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!isValid}
          className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-40 text-sm"
        >
          Next: Actions →
        </button>
      </div>
    </div>
  );
}
