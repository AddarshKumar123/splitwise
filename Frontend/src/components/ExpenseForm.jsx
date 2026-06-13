import { useState } from 'react';
import { todayISO } from '../utils/format';

const SPLIT_TYPES = ['EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES'];

export default function ExpenseForm({ members, currentUserId, onSubmit, onClose, initial = null }) {
  const [description, setDescription] = useState(initial?.description || '');
  const [amount, setAmount] = useState(initial?.amount?.toString() || '');
  const [date, setDate] = useState(
    initial?.date ? initial.date.split('T')[0] : todayISO()
  );
  const [notes, setNotes] = useState(initial?.notes || '');
  const [payerId, setPayerId] = useState(initial?.payerId || currentUserId);
  const [splitType, setSplitType] = useState(initial?.participants?.[0]?.splitType || 'EQUAL');
  const [selectedIds, setSelectedIds] = useState(
    initial?.participants?.map((p) => p.userId) || members.map((m) => m.user.id)
  );
  const [splitValues, setSplitValues] = useState(() => {
    const values = {};
    members.forEach((m) => {
      const p = initial?.participants?.find((x) => x.userId === m.user.id);
      values[m.user.id] = {
        amount: p?.amount?.toString() || '',
        percentage: p?.percentage?.toString() || '',
        shares: p?.shares?.toString() || '1'
      };
    });
    return values;
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleMember = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const buildParticipants = () =>
    selectedIds.map((userId) => {
      const v = splitValues[userId] || {};
      const base = { userId };
      if (splitType === 'EXACT') return { ...base, amount: parseFloat(v.amount) };
      if (splitType === 'PERCENTAGE') return { ...base, percentage: parseFloat(v.percentage) };
      if (splitType === 'SHARES') return { ...base, shares: parseInt(v.shares, 10) };
      return base;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        description,
        amount: parseFloat(amount),
        date,
        notes: notes || undefined,
        payerId: parseInt(payerId, 10),
        splitType,
        participants: buildParticipants()
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{initial ? 'Edit expense' : 'Add expense'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Description">
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (INR)">
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Date">
              <input
                required
                type="date"
                max={todayISO()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="Paid by">
            <select value={payerId} onChange={(e) => setPayerId(e.target.value)} className="input">
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Split type">
            <select value={splitType} onChange={(e) => setSplitType(e.target.value)} className="input">
              {SPLIT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>

          <Field label="Participants">
            <div className="space-y-2">
              {members.map((m) => {
                const id = m.user.id;
                const selected = selectedIds.includes(id);
                const v = splitValues[id] || {};
                return (
                  <div key={id} className="rounded-lg border border-slate-200 p-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleMember(id)}
                      />
                      <span className="text-sm">{m.user.name}</span>
                    </label>
                    {selected && splitType === 'EXACT' && (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Amount"
                        value={v.amount}
                        onChange={(e) =>
                          setSplitValues((prev) => ({
                            ...prev,
                            [id]: { ...prev[id], amount: e.target.value }
                          }))
                        }
                        className="input mt-2"
                      />
                    )}
                    {selected && splitType === 'PERCENTAGE' && (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="%"
                        value={v.percentage}
                        onChange={(e) =>
                          setSplitValues((prev) => ({
                            ...prev,
                            [id]: { ...prev[id], percentage: e.target.value }
                          }))
                        }
                        className="input mt-2"
                      />
                    )}
                    {selected && splitType === 'SHARES' && (
                      <input
                        type="number"
                        min="1"
                        placeholder="Shares"
                        value={v.shares}
                        onChange={(e) =>
                          setSplitValues((prev) => ({
                            ...prev,
                            [id]: { ...prev[id], shares: e.target.value }
                          }))
                        }
                        className="input mt-2"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Field>

          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input"
              rows={2}
            />
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
