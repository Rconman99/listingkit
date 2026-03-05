import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { createCheckoutSession } from '../lib/ai';

export default function UpgradePrompt() {
  const sessionId = useAppStore((s) => s.sessionId);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const url = await createCheckoutSession(sessionId);
      window.location.href = url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="w-14 h-14 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
          <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-navy mb-2">You've used your 3 free generations!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Upgrade to Pro for 100 generations per month — less than $0.10 per listing.
        </p>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200"
        >
          {loading ? 'Redirecting...' : 'Upgrade Now — $9.99/month'}
        </button>
        <p className="text-xs text-gray-400 mt-3">Cancel anytime. Powered by Stripe.</p>
      </div>
    </div>
  );
}
