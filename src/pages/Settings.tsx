import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { createCheckoutSession } from '../lib/ai';
import { clearHistory } from '../lib/storage';
import { toast } from 'sonner';

const TONES = ['Professional', 'Luxury', 'Warm & Inviting', 'Modern & Sleek', 'Welcoming'];

export default function Settings() {
  const store = useAppStore();
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    try {
      const url = await createCheckoutSession(store.sessionId);
      window.location.href = url;
    } catch {
      toast.error('Failed to start checkout');
      setUpgradeLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear all generation history? This cannot be undone.')) {
      clearHistory();
      toast.success('History cleared');
    }
  };

  const handleResetAll = () => {
    if (confirm('Reset all settings and clear history? This cannot be undone.')) {
      store.setAgentName('');
      store.setBrokerageName('');
      store.setDefaultTone('Professional');
      clearHistory();
      toast.success('All settings reset');
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200';

  const credits = store.credits;
  const usagePercent = credits ? Math.round((credits.used / credits.limit) * 100) : 0;

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-navy">Settings</h1>

      {/* Subscription */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-navy">Subscription</h2>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            credits?.tier === 'pro' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {credits?.tier === 'pro' ? 'Pro' : 'Free'}
          </span>
          <span className="text-sm text-gray-500">
            {credits ? `${credits.used} of ${credits.limit} generations used` : 'Loading...'}
          </span>
        </div>

        {credits && (
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        )}

        {credits?.tier !== 'pro' && (
          <button
            onClick={handleUpgrade}
            disabled={upgradeLoading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200"
          >
            {upgradeLoading ? 'Redirecting...' : 'Upgrade to Pro — $9.99/month'}
          </button>
        )}

        {credits?.tier === 'pro' && credits.resetDate && (
          <p className="text-xs text-gray-400">
            Credits reset {new Date(credits.resetDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Default Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-navy">Default Information</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Agent Name</label>
          <input type="text" value={store.agentName} onChange={(e) => store.setAgentName(e.target.value)} className={inputClass} placeholder="Jane Smith" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Brokerage</label>
          <input type="text" value={store.brokerageName} onChange={(e) => store.setBrokerageName(e.target.value)} className={inputClass} placeholder="ABC Realty" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Tone</label>
          <select value={store.defaultTone} onChange={(e) => store.setDefaultTone(e.target.value)} className={inputClass}>
            {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-navy">Data Management</h2>
        <div className="flex gap-3">
          <button onClick={handleClearHistory} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200">
            Clear History
          </button>
          <button onClick={handleResetAll} className="px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200">
            Reset All Settings
          </button>
        </div>
      </div>
    </div>
  );
}
