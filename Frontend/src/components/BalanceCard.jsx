import { formatINR } from '../utils/format';

export default function BalanceCard({ label, amount, variant = 'neutral' }) {
  const colors = {
    positive: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    negative: 'text-red-600 bg-red-50 border-red-200',
    neutral: 'text-slate-700 bg-white border-slate-200'
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[variant]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-bold">{formatINR(amount)}</p>
    </div>
  );
}
