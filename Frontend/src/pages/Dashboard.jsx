import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import GroupCard from '../components/GroupCard';
import BalanceCard from '../components/BalanceCard';
import { api } from '../api/client';

export default function Dashboard() {
  const [groups, setGroups] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [groupsRes, dashRes] = await Promise.all([api.getGroups(), api.getDashboard()]);
      setGroups(groupsRes.data);
      setSummary(dashRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createGroup({ name, description: description || undefined });
      setShowCreate(false);
      setName('');
      setDescription('');
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Your groups and balances at a glance</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          + New group
        </button>
      </div>

      {summary && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <BalanceCard label="You are owed" amount={summary.youAreOwed} variant="positive" />
          <BalanceCard label="You owe" amount={summary.youOwe} variant="negative" />
          <BalanceCard
            label="Net balance"
            amount={summary.netBalance}
            variant={summary.netBalance >= 0 ? 'positive' : 'negative'}
          />
        </div>
      )}

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <h2 className="mb-3 text-lg font-semibold">Your groups</h2>

      {loading ? (
        <p className="text-slate-500">Loading groups...</p>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-slate-500">No groups yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Create group</h2>
            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Name</span>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="input" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Description</span>
                <input value={description} onChange={(e) => setDescription(e.target.value)} className="input" />
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
