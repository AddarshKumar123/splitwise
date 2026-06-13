import { formatDate } from '../utils/format';

export default function CommentItem({ comment }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-800">{comment.sender?.name}</span>
        <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
      </div>
      <p className="mt-1 text-sm text-slate-700">{comment.message}</p>
    </div>
  );
}
