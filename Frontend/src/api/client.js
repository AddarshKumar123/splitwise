const API_URL = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('token');

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PATCH', body: JSON.stringify(body) }),

  getGroups: () => request('/groups'),
  getGroup: (id) => request(`/groups/${id}`),
  getGroupExpenses: (id) => request(`/groups/${id}/expenses`),
  createGroup: (body) => request('/groups', { method: 'POST', body: JSON.stringify(body) }),
  renameGroup: (id, body) => request(`/groups/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteGroup: (id) => request(`/groups/${id}`, { method: 'DELETE' }),
  addMember: (id, email) => request(`/groups/${id}/members`, { method: 'POST', body: JSON.stringify({ email }) }),
  removeMember: (id, userId) => request(`/groups/${id}/members/${userId}`, { method: 'DELETE' }),
  leaveGroup: (id) => request(`/groups/${id}/leave`, { method: 'POST' }),

  getExpense: (id) => request(`/expenses/${id}`),
  createExpense: (body) => request('/expenses', { method: 'POST', body: JSON.stringify(body) }),
  updateExpense: (id, body) => request(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),

  getGroupBalances: (groupId) => request(`/groups/${groupId}/balances`),
  getDashboard: () => request('/dashboard'),

  createSettlement: (body) => request('/settlements', { method: 'POST', body: JSON.stringify(body) }),
  deleteSettlement: (id) => request(`/settlements/${id}`, { method: 'DELETE' }),

  getComments: (expenseId) => request(`/expenses/${expenseId}/comments`),
  createComment: (expenseId, message) =>
    request(`/expenses/${expenseId}/comments`, { method: 'POST', body: JSON.stringify({ message }) })
};
