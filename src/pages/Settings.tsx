import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { testConnection } from '../lib/ai';
import { clearHistory } from '../lib/storage';
import { toast } from 'sonner';
import ProviderToggle from '../components/ProviderToggle';

const TONES = ['Professional', 'Luxury', 'Warm & Inviting', 'Modern & Sleek', 'Welcoming'];

export default function Settings() {
  const store = useAppStore();
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const modelOptions = store.provider === 'openai'
    ? [{ value: 'gpt-4o', label: 'GPT-4o (Recommended)' }, { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Faster/Cheaper)' }]
    : [{ value: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4 (Recommended)' }, { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5 (Faster/Cheaper)' }];

  const handleProviderChange = (p: 'openai' | 'anthropic') => {
    store.setProvider(p);
    store.setModel(p === 'openai' ? 'gpt-4o' : 'claude-sonnet-4-20250514');
    setTestResult(null);
  };

  const handleTest = async () => {
    if (!store.apiKey) return;
    setTesting(true);
    setTestResult(null);
    const result = await testConnection({ provider: store.provider, apiKey: store.apiKey, model: store.model });
    setTestResult(result);
    setTesting(false);
  };

  const handleClearHistory = () => {
    if (confirm('Clear all generation history? This cannot be undone.')) {
      clearHistory();
      toast.success('History cleared');
    }
  };

  const handleResetAll = () => {
    if (confirm('Reset all settings and clear history? This cannot be undone.')) {
      store.setApiKey('');
      store.setProvider('openai');
      store.setModel('gpt-4o');
      store.setAgentName('');
      store.setBrokerageName('');
      store.setDefaultTone('Professional');
      clearHistory();
      toast.success('All settings reset');
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200';

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-navy">Settings</h1>

      {/* AI Provider */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-navy">AI Provider</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Provider</label>
          <ProviderToggle provider={store.provider} onChange={handleProviderChange} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Model</label>
          <select value={store.model} onChange={(e) => store.setModel(e.target.value)} className={inputClass}>
            {modelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={store.apiKey}
              onChange={(e) => { store.setApiKey(e.target.value); setTestResult(null); }}
              placeholder={store.provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showKey ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          onClick={handleTest}
          disabled={!store.apiKey || testing}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>

        {testResult && (
          <div className={`p-3 rounded-lg text-sm ${testResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {testResult.success ? '✅ ' : '❌ '}{testResult.message}
          </div>
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

      {/* Security */}
      <div className="flex items-start gap-2 p-4 bg-gray-50 rounded-xl">
        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-xs text-gray-500">
          Your API key is stored locally in your browser and sent directly to {store.provider === 'openai' ? 'OpenAI' : 'Anthropic'}. We never see, store, or transmit your key to any server.
        </p>
      </div>
    </div>
  );
}
