import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import StepIndicator from '../components/StepIndicator';
import PropertyForm from '../components/PropertyForm';
import LoadingState from '../components/LoadingState';
import OutputSuite from '../components/OutputSuite';
import UpgradePrompt from '../components/UpgradePrompt';
import CreditBadge from '../components/CreditBadge';

export default function Generate() {
  const step = useAppStore((s) => s.step);
  const results = useAppStore((s) => s.results);
  const error = useAppStore((s) => s.error);
  const credits = useAppStore((s) => s.credits);
  const fetchCredits = useAppStore((s) => s.fetchCredits);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  const noCredits = error === 'NO_CREDITS' || (credits && credits.remaining <= 0 && step === 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {credits && step === 0 && (
        <div className="flex justify-end mb-4">
          <CreditBadge />
        </div>
      )}

      {noCredits && step === 0 ? (
        <UpgradePrompt />
      ) : (
        <>
          <StepIndicator current={step} />

          {error && error !== 'NO_CREDITS' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === 0 && <PropertyForm />}
          {step === 1 && <LoadingState />}
          {step === 2 && results && <OutputSuite results={results} showGenerateAnother />}
        </>
      )}
    </div>
  );
}
