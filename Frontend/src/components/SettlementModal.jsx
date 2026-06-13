import { useState } from 'react';
import { todayISO } from '../utils/format';

export default function SettlementModal({ members, currentUserId, onSubmit, onClose }) {
  const [payerId, setPayerId] = useState(currentUserId);
  const [receiverId, setReceiverId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const receivers = members.filter((m) => m.user.id !== parseInt(payerId, 10));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({
        payerId: parseInt(payerId, 10),
        receiverId: parseInt(receiverId, 10),
        amount: parseFloat(amount),
        date,
        notes: notes || undefined
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
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Settle up</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Who paid?</span>
            <select value={payerId} onChange={(e) => setPayerId(e.target.value)} className="input">
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Who received?</span>
            <select
              required
              value={receiverId}
              onChange={(e) => setReceiverId(e.target.value)}
              className="input"
            >
              <option value="">Select member</option>
              {receivers.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Amount</span>
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Date</span>
              <input
                required
                type="date"
                max={todayISO()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Notes</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input" rows={2} />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Recording...' : 'Record payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
