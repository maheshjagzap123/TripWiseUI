import api from './client'

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

export const userApi = {
  getProfile: (userId) => api.get(`/users/${userId}`),
  updateProfile: (userId, data) => api.put(`/users/${userId}`, data),
}

export const tripApi = {
  create: (data) => api.post('/trips', data),
  getAll: () => api.get('/trips'),
  getById: (id) => api.get(`/trips/${id}`),
  update: (id, data) => api.put(`/trips/${id}`, data),
  delete: (id) => api.delete(`/trips/${id}`),
  getDashboard: (id) => api.get(`/trips/${id}/dashboard`),
}

export const budgetApi = {
  create: (tripId, data) => api.post(`/trips/${tripId}/budget`, data),
  get: (tripId) => api.get(`/trips/${tripId}/budget`),
  getSummary: (tripId) => api.get(`/trips/${tripId}/budget/summary`),
}

export const expenseApi = {
  create: (tripId, data) => api.post(`/trips/${tripId}/expenses`, data),
  getAll: (tripId, params) => api.get(`/trips/${tripId}/expenses`, { params }),
  getById: (tripId, expenseId) => api.get(`/trips/${tripId}/expenses/${expenseId}`),
  update: (tripId, expenseId, data) => api.put(`/trips/${tripId}/expenses/${expenseId}`, data),
  delete: (tripId, expenseId) => api.delete(`/trips/${tripId}/expenses/${expenseId}`),
  uploadAttachment: (tripId, expenseId, formData) =>
    api.post(`/trips/${tripId}/expenses/${expenseId}/attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
}

export const memberApi = {
  invite: (tripId, data) => api.post(`/trips/${tripId}/members/invite`, data),
  join: (tripId, token) => api.post(`/trips/${tripId}/members/join`, { inviteToken: token }),
  getAll: (tripId) => api.get(`/trips/${tripId}/members`),
  remove: (tripId, userId) => api.delete(`/trips/${tripId}/members/${userId}`),
  getInviteLink: (tripId) => api.get(`/trips/${tripId}/invite-link`),
}

export const splitApi = {
  create: (expenseId, data) => api.post(`/expenses/${expenseId}/split`, data),
  get: (expenseId) => api.get(`/expenses/${expenseId}/split`),
  update: (expenseId, data) => api.put(`/expenses/${expenseId}/split`, data),
}

export const settlementApi = {
  getAll: (tripId) => api.get(`/trips/${tripId}/settlements`),
  getMy: (tripId) => api.get(`/trips/${tripId}/settlements/my`),
  pay: (tripId, settlementId, data) => api.post(`/trips/${tripId}/settlements/${settlementId}/pay`, data),
  getHistory: (tripId) => api.get(`/trips/${tripId}/settlements/history`),
  getMemberBalance: (tripId) => api.get(`/trips/${tripId}/settlements/member-balance`),
}

export const walletApi = {
  contribute: (tripId, data) => api.post(`/trips/${tripId}/wallet/contribute`, data),
  get: (tripId) => api.get(`/trips/${tripId}/wallet`),
  getTransactions: (tripId) => api.get(`/trips/${tripId}/wallet/transactions`),
}

export const analyticsApi = {
  getSummary: (tripId) => api.get(`/trips/${tripId}/analytics/summary`),
  getCategoryBreakdown: (tripId) => api.get(`/trips/${tripId}/analytics/category-breakdown`),
  getBudgetVsActual: (tripId) => api.get(`/trips/${tripId}/analytics/budget-vs-actual`),
  getMemberContributions: (tripId) => api.get(`/trips/${tripId}/analytics/member-contributions`),
  getSpendingTrend: (tripId) => api.get(`/trips/${tripId}/analytics/spending-trend`),
}

export const notificationApi = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
}

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  deactivateUser: (userId) => api.put(`/admin/users/${userId}/deactivate`),
  getTrips: (params) => api.get('/admin/trips', { params }),
  getAuditLogs: (params) => api.get('/admin/audit-logs', { params }),
}
