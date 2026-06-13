import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ChatPanel from '../components/ChatPanel';
import ExpenseForm from '../components/ExpenseForm';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatINR } from '../utils/format';

export default function ExpenseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getExpense(id);
      setExpense(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  useEffect(() => {
    if (showEdit && expense?.groupId) {
      api.getGroup(expense.groupId).then((res) => setGroupMembers(res.data.members));
    }
  }, [showEdit, expense?.groupId]);

  const canEdit = expense?.createdById === user?.id && expense?.type !== 'SETTLEMENT';

  const handleUpdate = async (data) => {
    await api.updateExpense(id, data);
    load();
  };

  const handleDelete = async () => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api.deleteExpense(id);
      navigate(`/groups/${expense.groupId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSettlement = async () => {
    if (!confirm('Delete this settlement?')) return;
    try {
      await api.deleteSettlement(id);
      navigate(`/groups/${expense.groupId}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-500">Loading expense...</p>
      </Layout>
    );
  }

  if (!expense) {
    return (
      <Layout>
        <p className="text-red-600">{error || 'Expense not found'}</p>
      </Layout>
    );
  }

  const isSettlement = expense.type === 'SETTLEMENT';

  return (
    <Layout>
      <Link to={`/groups/${expense.groupId}`} className="text-sm text-emerald-600 hover:underline">
        ← Back to group
      </Link>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{expense.description}</h1>
              {isSettlement && (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Settlement</span>
              )}
            </div>
            <p className="mt-1 text-slate-500">
              {formatDate(expense.date)} · {expense.group?.name}
            </p>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{formatINR(expense.amount)}</p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Info label="Paid by" value={expense.payer?.name} />
          <Info label="Added by" value={expense.createdBy?.name || '—'} />
          {expense.notes && <Info label="Notes" value={expense.notes} />}
        </div>

        {!isSettlement && (
          <div className="mt-6">
            <h3 className="mb-3 font-semibold">Split breakdown</h3>
            <div className="space-y-2">
              {expense.participants?.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2 text-sm"
                >
                  <span>{p.user.name}</span>
                  <span>
                    {formatINR(p.amount)}
                    {p.splitType === 'PERCENTAGE' && p.percentage != null && (
                      <span className="ml-2 text-slate-400">({p.percentage}%)</span>
                    )}
                    {p.splitType === 'SHARES' && p.shares != null && (
                      <span className="ml-2 text-slate-400">({p.shares} shares)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {canEdit && (
            <>
              <button onClick={() => setShowEdit(true)} className="btn-secondary">
                Edit
              </button>
              <button onClick={handleDelete} className="btn-danger">
                Delete
              </button>
            </>
          )}
          {isSettlement && expense.createdById === user?.id && (
            <button onClick={handleDeleteSettlement} className="btn-danger">
              Delete settlement
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6">
        <ChatPanel expenseId={parseInt(id, 10)} />
      </div>

      {showEdit && groupMembers.length > 0 && (
        <ExpenseForm
          members={groupMembers}
          currentUserId={user.id}
          initial={expense}
          onSubmit={handleUpdate}
          onClose={() => setShowEdit(false)}
        />
      )}
    </Layout>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-slate-800">{value}</p>
    </div>
  );
}
