import { useAppStore } from '../store/appStore';

export default function CreditBadge() {
  const credits = useAppStore((s) => s.credits);

  if (!credits) return null;

  const { tier, remaining, limit } = credits;

  let color = 'bg-emerald-100 text-emerald-700';
  if (tier === 'free') {
    if (remaining === 0) color = 'bg-red-100 text-red-700';
    else if (remaining === 1) color = 'bg-amber-100 text-amber-700';
  }

  const label = tier === 'free'
    ? `${remaining}/${limit} free`
    : `${remaining}/${limit} this month`;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
}
