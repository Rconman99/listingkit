import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import StepIndicator from '../components/StepIndicator';
import PropertyForm from '../components/PropertyForm';
import LoadingState from '../components/LoadingState';
import OutputSuite from '../components/OutputSuite';
import ApiKeyModal from '../components/ApiKeyModal';

export default function Generate() {
  const step = useAppStore((s) => s.step);
  const apiKey = useAppStore((s) => s.apiKey);
  const results = useAppStore((s) => s.results);
  const error = useAppStore((s) => s.error);
  const [showApiModal, setShowApiModal] = useState(!apiKey);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {showApiModal && <ApiKeyModal onClose={() => setShowApiModal(false)} />}

      <StepIndicator current={step} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === 0 && <PropertyForm />}
      {step === 1 && <LoadingState />}
      {step === 2 && results && <OutputSuite results={results} showGenerateAnother />}
    </div>
  );
}
