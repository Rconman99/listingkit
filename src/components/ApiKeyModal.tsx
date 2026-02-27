import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { testConnection } from '../lib/ai';
import ProviderToggle from './ProviderToggle';

interface Props {
  onClose: () => void;
}

export default function ApiKeyModal({ onClose }: Props) {
  const store = useAppStore();
  const [provider, setProvider] = useState(store.provider);
  const [apiKey, setApiKey] = useState(store.apiKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const defaultModel = provider === 'openai' ? 'gpt-4o' : 'claude-sonnet-4-20250514';

  const handleTest = async () => {
    if (!apiKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    const result = await testConnection({ provider, apiKey: apiKey.trim(), model: defaultModel });
    setTestResult(result);
    setTesting(false);
  };

  const handleSave = () => {
    store.setApiKey(apiKey.trim());
    store.setProvider(provider);
    store.setModel(defaultModel);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-navy mb-1">Connect Your AI</h2>
        <p className="text-sm text-gray-500 mb-6">
          We recommend <strong>OpenAI</strong> for the easiest setup — no CORS issues.
        </p>

        {/* Provider toggle */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Provider</label>
          <ProviderToggle provider={provider} onChange={setProvider} />
        </div>

        {/* API Key input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">API Key</label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => { setApiKey(e.target.value); setTestResult(null); }}
              placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-...'}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
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
          <p className="text-xs text-gray-400 mt-1.5">
            {provider === 'openai'
              ? 'Get your key at platform.openai.com/api-keys'
              : 'Get your key at console.anthropic.com. Some keys may have browser restrictions.'}
          </p>
        </div>

        {/* Test connection */}
        <button
          onClick={handleTest}
          disabled={!apiKey.trim() || testing}
          className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {testing ? 'Testing...' : 'Test Connection'}
        </button>

        {testResult && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${testResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {testResult.success ? '✅ ' : '❌ '}{testResult.message}
          </div>
        )}

        {/* Security message */}
        <div className="mb-6 flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
          <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p className="text-xs text-gray-500">
            Your API key is stored locally in your browser and sent directly to {provider === 'openai' ? 'OpenAI' : 'Anthropic'}. We never see, store, or transmit your key to any server.
          </p>
        </div>

        {/* Actions */}
        <button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="w-full mb-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          Save & Start
        </button>
        <button
          onClick={onClose}
          className="w-full text-sm text-gray-400 hover:text-gray-600 transition-all duration-200 py-1"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
