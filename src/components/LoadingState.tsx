import { useAppStore } from '../store/appStore';

export default function LoadingState() {
  const progress = useAppStore((s) => s.progress);
  const progressLabel = useAppStore((s) => s.progressLabel);

  return (
    <div className="max-w-md mx-auto text-center py-12">
      {/* Pulsing house icon */}
      <div className="mb-8">
        <svg
          className="w-16 h-16 mx-auto text-emerald-600 animate-pulse"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 15L10 50h15v30h20V60h10v20h20V50h15L50 15z" />
        </svg>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-4 overflow-hidden">
        <div
          className="bg-emerald-600 h-3 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Progress text */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{progressLabel}</span>
        <span className="font-semibold text-emerald-700">{Math.round(Math.min(progress, 100))}%</span>
      </div>

      <p className="text-gray-400 text-xs mt-6">
        Generating your complete marketing kit...
      </p>
    </div>
  );
}
