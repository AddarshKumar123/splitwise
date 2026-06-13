import { useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const body = {};
      if (name && name !== user.name) body.name = name;
      if (password) body.password = password;
      if (Object.keys(body).length === 0) {
        setMessage('No changes to save.');
        return;
      }
      await api.updateProfile(body);
      await refreshUser();
      setPassword('');
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-slate-500">Update your account details</p>

      <div className="mt-6 max-w-md rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">
          Email: <span className="font-medium text-slate-800">{user?.email}</span> (immutable)
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">New password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="input"
            />
          </label>

          {message && <p className="text-sm text-emerald-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </Layout>
  );
}
