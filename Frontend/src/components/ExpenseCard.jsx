import { Link } from 'react-router-dom';
import { formatDate, formatINR } from '../utils/format';

export default function ExpenseCard({ expense }) {
  const isSettlement = expense.type === 'SETTLEMENT';

  return (
    <Link
      to={`/expenses/${expense.id}`}
      className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300"
    >
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-slate-900">{expense.description}</p>
          {isSettlement && (
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
              Settlement
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {formatDate(expense.date)} · Paid by {expense.payer?.name}
        </p>
      </div>
      <p className="text-lg font-semibold text-slate-900">{formatINR(expense.amount)}</p>
    </Link>
  );
}
