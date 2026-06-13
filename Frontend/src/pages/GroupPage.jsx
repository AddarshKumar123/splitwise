import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ExpenseCard from '../components/ExpenseCard';
import ExpenseForm from '../components/ExpenseForm';
import SettlementModal from '../components/SettlementModal';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../utils/format';

const TABS = ['expenses', 'balances', 'members', 'settings'];

export default function GroupPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('expenses');
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showExpense, setShowExpense] = useState(false);
  const [showSettlement, setShowSettlement] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [renameName, setRenameName] = useState('');

  const isCreator = group?.creatorId === user?.id;

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        api.getGroup(id),
        api.getGroupExpenses(id),
        api.getGroupBalances(id)
      ]);
      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
      setBalances(balancesRes.data);
      setRenameName(groupRes.data.name);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleCreateExpense = async (data) => {
    await api.createExpense({ ...data, groupId: parseInt(id, 10) });
    load();
  };

  const handleSettlement = async (data) => {
    await api.createSettlement({ ...data, groupId: parseInt(id, 10) });
    load();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.addMember(id, memberEmail);
      setMemberEmail('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.removeMember(id, userId);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    try {
      await api.renameGroup(id, { name: renameName });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLeave = async () => {
    if (!confirm('Leave this group?')) return;
    try {
      await api.leaveGroup(id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this group permanently?')) return;
    try {
      await api.deleteGroup(id);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <p className="text-slate-500">Loading group...</p>
      </Layout>
    );
  }

  if (!group) {
    return (
      <Layout>
        <p className="text-red-600">{error || 'Group not found'}</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <Link to="/dashboard" className="text-sm text-emerald-600 hover:underline">
        ← Back to dashboard
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{group.name}</h1>
          {group.description && <p className="text-slate-500">{group.description}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowExpense(true)} className="btn-primary">
            Add expense
          </button>
          <button onClick={() => setShowSettlement(true)} className="btn-secondary">
            Settle up
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-2 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2 text-sm font-medium capitalize ${
              tab === t
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6">
        {tab === 'expenses' && (
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-slate-500">No expenses yet.</p>
            ) : (
              expenses.map((expense) => <ExpenseCard key={expense.id} expense={expense} />)
            )}
          </div>
        )}

        {tab === 'balances' && balances && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-semibold">Individual balances</h3>
              <div className="space-y-2">
                {balances.balances.map(({ user: u, balance }) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                  >
                    <span>{u.name}</span>
                    <span className={balance >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {balance >= 0 ? 'gets back ' : 'owes '}
                      {formatINR(Math.abs(balance))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold">Simplified debts</h3>
              {balances.simplifiedDebts.length === 0 ? (
                <p className="text-slate-500">All settled up!</p>
              ) : (
                <div className="space-y-2">
                  {balances.simplifiedDebts.map((debt, i) => (
                    <div key={i} className="rounded-lg bg-emerald-50 px-4 py-3 text-sm">
                      <span className="font-medium">{debt.from.name}</span> owes{' '}
                      <span className="font-medium">{debt.to.name}</span>{' '}
                      <span className="font-semibold">{formatINR(debt.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div className="space-y-4">
            {isCreator && (
              <form onSubmit={handleAddMember} className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="Add member by email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="input flex-1"
                />
                <button type="submit" className="btn-primary">Add</button>
              </form>
            )}

            <div className="space-y-2">
              {group.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{m.user.name}</p>
                    <p className="text-sm text-slate-500">{m.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.userId === group.creatorId && (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        Creator
                      </span>
                    )}
                    {isCreator && m.userId !== user.id && (
                      <button
                        onClick={() => handleRemoveMember(m.userId)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="max-w-md space-y-4">
            {isCreator ? (
              <>
                <form onSubmit={handleRename} className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium">Group name</span>
                    <input value={renameName} onChange={(e) => setRenameName(e.target.value)} className="input" />
                  </label>
                  <button type="submit" className="btn-primary">Rename group</button>
                </form>
                <button onClick={handleDelete} className="btn-danger">
                  Delete group
                </button>
              </>
            ) : (
              <button onClick={handleLeave} className="btn-secondary">
                Leave group
              </button>
            )}
          </div>
        )}
      </div>

      {showExpense && (
        <ExpenseForm
          members={group.members}
          currentUserId={user.id}
          onSubmit={handleCreateExpense}
          onClose={() => setShowExpense(false)}
        />
      )}

      {showSettlement && (
        <SettlementModal
          members={group.members}
          currentUserId={user.id}
          onSubmit={handleSettlement}
          onClose={() => setShowSettlement(false)}
        />
      )}
    </Layout>
  );
}
