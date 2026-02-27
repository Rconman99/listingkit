interface Props {
  current: 0 | 1 | 2;
}

const steps = ['Property Details', 'Generating', 'Marketing Kit'];

export default function StepIndicator({ current }: Props) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((label, i) => {
        const isActive = i === current;
        const isComplete = i < current;

        return (
          <div key={label} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isComplete
                    ? 'bg-emerald-600 text-white'
                    : isActive
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {isComplete ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium whitespace-nowrap ${
                  isActive || isComplete ? 'text-emerald-700' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 mt-[-1rem] transition-all duration-500 ${
                  i < current ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
