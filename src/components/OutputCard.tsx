import { AIOutput } from '../lib/types';
import CopyButton from './CopyButton';

interface Props {
  title: string;
  result: AIOutput | { status: 'success'; text: string };
  onRegenerate?: () => void;
  meta?: string;
  className?: string;
}

export default function OutputCard({ title, result, onRegenerate, meta, className = '' }: Props) {
  if (result.status === 'idle') return null;

  if (result.status === 'loading') {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/6" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-3/6" />
        </div>
      </div>
    );
  }

  if (result.status === 'error') {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-red-200 p-6 ${className}`}>
        <h3 className="font-semibold text-navy mb-2">{title}</h3>
        <p className="text-red-500 text-sm mb-3">{result.message}</p>
        {onRegenerate && (
          <button
            onClick={onRegenerate}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-all duration-200"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-navy">{title}</h3>
        <div className="flex items-center gap-2">
          <CopyButton text={result.text} />
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
          )}
        </div>
      </div>
      <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">{result.text}</div>
      {meta && <div className="mt-3 text-xs text-gray-400">{meta}</div>}
    </div>
  );
}
