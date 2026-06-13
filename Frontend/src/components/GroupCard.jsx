import { Link } from 'react-router-dom';

export default function GroupCard({ group }) {
  return (
    <Link
      to={`/groups/${group.id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">{group.name}</h3>
          {group.description && (
            <p className="mt-1 text-sm text-slate-500">{group.description}</p>
          )}
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {group.members?.length || 0} members
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        {group._count?.expenses || 0} expenses
      </p>
    </Link>
  );
}
