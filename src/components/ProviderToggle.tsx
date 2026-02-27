interface Props {
  provider: 'openai' | 'anthropic';
  onChange: (provider: 'openai' | 'anthropic') => void;
}

export default function ProviderToggle({ provider, onChange }: Props) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-gray-200">
      <button
        onClick={() => onChange('openai')}
        className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 ${
          provider === 'openai'
            ? 'bg-emerald-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        OpenAI
      </button>
      <button
        onClick={() => onChange('anthropic')}
        className={`flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 ${
          provider === 'anthropic'
            ? 'bg-emerald-600 text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        Anthropic
      </button>
    </div>
  );
}
