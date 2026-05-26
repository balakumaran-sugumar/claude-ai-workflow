'use client';

interface Props {
  currentStep: number;
  totalSteps: number;
}

const STEP_LABELS = ['Purpose & Date', 'Agreement Terms', 'Governing Law', 'Party Details'];

export default function ProgressBar({ currentStep, totalSteps }: Props) {
  return (
    <nav aria-label="Form progress">
      <ol className="flex items-center gap-0">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <li key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  aria-current={isCurrent ? 'step' : undefined}
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                    isCompleted ? 'bg-blue-600 text-white' : '',
                    isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : '',
                    !isCompleted && !isCurrent ? 'bg-gray-200 text-gray-500' : '',
                  ].join(' ')}
                >
                  {isCompleted ? '✓' : step}
                </div>
                <span
                  className={`mt-1 text-xs hidden sm:block ${isCurrent ? 'text-blue-600 font-medium' : 'text-gray-400'}`}
                >
                  {STEP_LABELS[i]}
                </span>
              </div>
              {step < totalSteps && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
