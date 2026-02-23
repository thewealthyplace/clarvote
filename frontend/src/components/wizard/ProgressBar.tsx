import React from 'react';
import { useWizard } from './WizardContext';

const STEPS = [
  { number: 1, label: 'Title & Category' },
  { number: 2, label: 'Description'      },
  { number: 3, label: 'Actions'          },
  { number: 4, label: 'Review & Submit'  },
];

export function ProgressBar() {
  const { step } = useWizard();

  return (
    <div className="flex items-center w-full mb-8">
      {STEPS.map((s, i) => (
        <React.Fragment key={s.number}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                step > s.number
                  ? 'bg-green-500 text-white'
                  : step === s.number
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {step > s.number ? '✓' : s.number}
            </div>
            <span className={`text-xs mt-1 whitespace-nowrap ${step === s.number ? 'text-white' : 'text-gray-500'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${step > s.number ? 'bg-green-500' : 'bg-gray-700'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
