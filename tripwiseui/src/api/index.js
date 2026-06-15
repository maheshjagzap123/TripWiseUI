// ─────────────────────────────────────────────────────────────
// MOCK API  –  replace with real API calls when backend is ready
// Every function returns Promise.resolve({ data: { data: ... } })
// to match the shape all pages expect.
// ─────────────────────────────────────────────────────────────

const ok = (data) => Promise.resolve({ data: { data } })

// ── Static mock data ──────────────────────────────────────────

const TRIPS = [
  {
    tripId: 'trip-1',
    tripName: 'Goa Adventure',
    destination: 'Goa, India',
    startDate: '2026-07-01',
    endDate: '2026-07-08',
    status: 'Active',
    tripType: 'Group',
    description: 'Summer beach trip with friends. Sun, sand, and great food!',
    createdBy: 'user-1',
  },
  {
    tripId: 'trip-2',
    tripName: 'Manali Escape',
    destination: 'Manali, Himachal Pradesh',
    startDate: '2026-08-10',
    endDate: '2026-08-17',
    status: 'Active',
    tripType: 'Group',
    description: 'Mountains, snow and adventure sports.',
    createdBy: 'user-1',
  },
  {
    tripId: 'trip-3',
    tripName: 'Kerala Backwaters',
    destination: 'Alleppey, Kerala',
    startDate: '2025-12-20',
    endDate: '2025-12-27',
    status: 'Completed',
    tripType: 'Family',
    description: 'Houseboat cruise through the scenic backwaters.',
    createdBy: 'user-1',
  },
]

const EXPENSES = [
  { expenseId: 'exp-1', description: 'Flight tickets', category: 'Travel',        amount: 12000, expenseDate: '2026-07-01', paidByUserId: 'user-1' },
  { expenseId: 'exp-2', description: 'Hotel – 7 nights', category: 'Accommodation', amount: 21000, expenseDate: '2026-07-01', paidByUserId: 'user-2' },
  { expenseId: 'exp-3', description: 'Beach shack dinner', category: 'Food',         amount: 3200,  expenseDate: '2026-07-02', paidByUserId: 'user-1' },
  { expenseId: 'exp-4', description: 'Scooter rentals',   category: 'Travel',        amount: 2800,  expenseDate: '2026-07-03', paidByUserId: 'user-3' },
  { expenseId: 'exp-5', description: 'Flea market shopping', category: 'Shopping',  amount: 4500,  expenseDate: '2026-07-04', paidByUserId: 'user-2' },
  { expenseId: 'exp-6', description: 'Petrol fill-up',    category: 'Fuel',          amount: 800,   expenseDate: '2026-07-05', paidByUserId: 'user-1' },
]

const MEMBERS = [
  { userId: 'user-1', fullName: 'Aditya Sharma',  role: 'Admin',  joinedAt: '2026-06-01' },
  { userId: 'user-2', fullName: 'Priya Mehta',    role: 'Member', joinedAt: '2026-06-03' },
  { userId: 'user-3', fullName: 'Rahul Verma',    role: 'Member', joinedAt: '2026-06-05' },
  { userId: 'user-4', fullName: 'Sneha Kapoor',   role: 'Member', joinedAt: '2026-06-07' },
]

const SETTLEMENTS = [
  { settlementId: 'set-1', payerName: 'Priya Mehta',  receiverName: 'Aditya Sharma', amount: 5200, status: 'Pending' },
  { settlementId: 'set-2', payerName: 'Rahul Verma',  receiverName: 'Priya Mehta',   amount: 3100, status: 'Pending' },
  { settlementId: 'set-3', payerName: 'Sneha Kapoor', receiverName: 'Aditya Sharma', amount: 2800, status: 'Paid'    },
]

const BUDGET_SUMMARY = [
  { category: 'Travel',        plannedAmount: 15000, actualAmount: 14800 },
  { category: 'Accommodation', plannedAmount: 22000, actualAmount: 21000 },
  { category: 'Food',          plannedAmount: 8000,  actualAmount: 3200  },
  { category: 'Shopping',      plannedAmount: 5000,  actualAmount: 4500  },
  { category: 'Fuel',          plannedAmount: 2000,  actualAmount: 800   },
  { category: 'Emergency',     plannedAmount: 3000,  actualAmount: 0     },
  { category: 'Miscellaneous', plannedAmount: 2000,  actualAmount: 0     },
]

const NOTIFICATIONS = [
  {
    notificationId: 'n-invite-1',
    type:           'trip_invite',
    title:          'Trip Invitation',
    message:        'Aditya Sharma invited you to join "Goa Adventure". Accept to see all trip details.',
    isRead:         false,
    tripId:         'trip-1',
    inviteToken:    'invite-mock-abc123',
    createdAt:      new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  { notificationId: 'n-1', title: 'New expense added',    message: 'Aditya added "Flight tickets" – ₹12,000',          isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
  { notificationId: 'n-2', title: 'Settlement reminder',  message: 'You owe Aditya ₹5,200. Please settle soon.',        isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
  { notificationId: 'n-3', title: 'Member joined',        message: 'Rahul Verma joined "Goa Adventure".',               isRead: true,  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString() },
  { notificationId: 'n-4', title: 'Budget alert',         message: 'Accommodation budget is almost exhausted (95%).',   isRead: true,  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
]

// ── Auth ───────────────────────────────────────────────────────
// login({ step: 'send', email })   → mock always succeeds (OTP sent)
// login({ step: 'verify', email, otp }) → mock accepts any 6-digit OTP

export const authApi = {
  login: (payload) => {
    if (payload?.step === 'send') {
      return ok({ message: 'OTP sent to ' + payload.email })
    }
    // Verify — new user has no fullName yet
    return ok({
      token:       'mock-token',
      userId:      'user-1',
      fullName:    '',
      email:       payload?.email || 'aditya@example.com',
      phoneNumber: '',
    })
  },
  forgotPassword: () => ok({ message: 'OTP sent (mock)' }),
  resetPassword:  () => ok({ message: 'Password reset (mock)' }),
}

// ── Users ──────────────────────────────────────────────────────

export const userApi = {
  getProfile:    () => ok({ fullName: 'Aditya Sharma', email: 'aditya@example.com', phoneNumber: '+91 98765 43210' }),
  updateProfile: (userId, data) => ok(data),
}

// ── Trips ──────────────────────────────────────────────────────

export const tripApi = {
  create:       (data) => ok({ ...data, tripId: `trip-${Date.now()}`, status: 'Active' }),
  getAll:       ()     => ok(TRIPS),
  getById:      (id)   => ok(TRIPS.find(t => t.tripId === id) || TRIPS[0]),
  update:       (id, data) => ok({ ...TRIPS[0], ...data }),
  delete:       ()     => ok(null),
  getDashboard: ()     => ok({
    budget:          57000,
    actualExpense:   44300,
    remainingBudget: 12700,
    payableAmount:    5200,
    recentExpenses:  EXPENSES.slice(0, 4),
  }),
}

// ── Budget ─────────────────────────────────────────────────────

export const budgetApi = {
  create: (tripId, data) => ok(data),
  get:    ()     => ok({
    totalBudget:   57000,
    totalPlanned:  57000,
    categories:    BUDGET_SUMMARY.map(c => ({ category: c.category, plannedAmount: c.plannedAmount })),
  }),
  getSummary: () => ok(BUDGET_SUMMARY),
}

// ── Expenses ───────────────────────────────────────────────────

export const expenseApi = {
  create:           (tripId, data) => ok({ ...data, expenseId: `exp-${Date.now()}` }),
  getAll:           (tripId, params) => {
    // 'all' is used from ProfilePage to get total spend across all trips
    const base = EXPENSES
    const filtered = params?.category ? base.filter(e => e.category === params.category) : base
    return ok(filtered)
  },
  getById:          (tripId, id) => ok(EXPENSES.find(e => e.expenseId === id) || EXPENSES[0]),
  update:           (tripId, id, data) => ok({ ...EXPENSES[0], ...data }),
  delete:           () => ok(null),
  uploadAttachment: () => ok({ url: '' }),
}

// ── Members ────────────────────────────────────────────────────

export const memberApi = {
  invite:        () => ok({ message: 'Invite sent (mock)' }),
  join:          () => ok({ message: 'Joined (mock)' }),
  getAll:        () => ok(MEMBERS),
  remove:        () => ok(null),
  getInviteLink: () => ok({ token: 'invite-mock-abc123' }),
}

// ── Splits ─────────────────────────────────────────────────────

export const splitApi = {
  create: () => ok(null),
  get:    () => ok([]),
  update: () => ok(null),
}

// ── Settlements ────────────────────────────────────────────────

export const settlementApi = {
  getAll: () => ok(SETTLEMENTS),
  getMy:  () => ok({
    payables:    [{ settlementId: 'set-1', receiverName: 'Aditya Sharma', amount: 5200 }],
    receivables: [{ settlementId: 'set-3', payerName: 'Sneha Kapoor',    amount: 2800 }],
  }),
  pay:             () => ok(null),
  getHistory:      () => ok(SETTLEMENTS.filter(s => s.status === 'Paid')),
  getMemberBalance: () => ok([
    { userId: 'user-1', fullName: 'Aditya Sharma', netBalance:  8500, totalPaid: 16000, fairShare: 11075 },
    { userId: 'user-2', fullName: 'Priya Mehta',   netBalance: -2100, totalPaid: 25500, fairShare: 11075 },
    { userId: 'user-3', fullName: 'Rahul Verma',   netBalance: -3100, totalPaid:  2800, fairShare: 11075 },
    { userId: 'user-4', fullName: 'Sneha Kapoor',  netBalance: -3300, totalPaid:     0, fairShare: 11075 },
  ]),
}

// ── Wallet ─────────────────────────────────────────────────────

export const walletApi = {
  contribute: () => ok(null),
  get: () => ok({
    totalBalance:     65000,
    totalExpenses:    44300,
    remainingBalance: 20700,
    contributions: [
      { contributionId: 'c-1', userId: 'user-1', userName: 'Aditya Sharma', amount: 20000, note: 'Initial contribution', contributedAt: '2026-06-15' },
      { contributionId: 'c-2', userId: 'user-2', userName: 'Priya Mehta',   amount: 20000, note: 'My share',             contributedAt: '2026-06-16' },
      { contributionId: 'c-3', userId: 'user-3', userName: 'Rahul Verma',   amount: 15000, note: 'Partial',              contributedAt: '2026-06-17' },
      { contributionId: 'c-4', userId: 'user-4', userName: 'Sneha Kapoor',  amount: 10000, note: '',                     contributedAt: '2026-06-18' },
    ],
  }),
  getTransactions: () => ok([
    { description: 'Aditya contributed',  type: 'credit', date: '2026-06-15', amount:  20000 },
    { description: 'Priya contributed',   type: 'credit', date: '2026-06-16', amount:  20000 },
    { description: 'Rahul contributed',   type: 'credit', date: '2026-06-17', amount:  15000 },
    { description: 'Sneha contributed',   type: 'credit', date: '2026-06-18', amount:  10000 },
    { description: 'Flight tickets',      type: 'debit',  date: '2026-07-01', amount: -12000 },
    { description: 'Hotel – 7 nights',    type: 'debit',  date: '2026-07-01', amount: -21000 },
    { description: 'Beach shack dinner',  type: 'debit',  date: '2026-07-02', amount:  -3200 },
    { description: 'Scooter rentals',     type: 'debit',  date: '2026-07-03', amount:  -2800 },
    { description: 'Flea market shopping',type: 'debit',  date: '2026-07-04', amount:  -4500 },
    { description: 'Petrol fill-up',      type: 'debit',  date: '2026-07-05', amount:   -800 },
  ]),
}

// ── Analytics ──────────────────────────────────────────────────

export const analyticsApi = {
  getSummary: () => ok({
    totalBudget:     57000,
    totalExpense:    44300,
    remainingBudget: 12700,
    totalMembers:    4,
    topCategory:     'Accommodation',
  }),
  getCategoryBreakdown: () => ok([
    { category: 'Travel',        amount: 14800, percentage: 33.4 },
    { category: 'Accommodation', amount: 21000, percentage: 47.4 },
    { category: 'Food',          amount:  3200, percentage:  7.2 },
    { category: 'Shopping',      amount:  4500, percentage: 10.2 },
    { category: 'Fuel',          amount:   800, percentage:  1.8 },
  ]),
  getBudgetVsActual: () => ok([
    { category: 'Travel',        planned: 15000, actual: 14800 },
    { category: 'Accommodation', planned: 22000, actual: 21000 },
    { category: 'Food',          planned:  8000, actual:  3200 },
    { category: 'Shopping',      planned:  5000, actual:  4500 },
    { category: 'Fuel',          planned:  2000, actual:   800 },
    { category: 'Emergency',     planned:  3000, actual:     0 },
    { category: 'Miscellaneous', planned:  2000, actual:     0 },
  ]),
  getMemberContributions: () => ok([
    { userId: 'user-1', fullName: 'Aditya Sharma', totalPaid: 16000, sharePercentage: 36.1 },
    { userId: 'user-2', fullName: 'Priya Mehta',   totalPaid: 25500, sharePercentage: 57.6 },
    { userId: 'user-3', fullName: 'Rahul Verma',   totalPaid:  2800, sharePercentage:  6.3 },
    { userId: 'user-4', fullName: 'Sneha Kapoor',  totalPaid:     0, sharePercentage:  0.0 },
  ]),
  getSpendingTrend: () => ok([
    { date: '2026-07-01', totalAmount: 33000 },
    { date: '2026-07-02', totalAmount:  3200 },
    { date: '2026-07-03', totalAmount:  2800 },
    { date: '2026-07-04', totalAmount:  4500 },
    { date: '2026-07-05', totalAmount:   800 },
  ]),
}

// ── Notifications ──────────────────────────────────────────────

export const notificationApi = {
  getAll:      () => ok(NOTIFICATIONS),
  markRead:    (id) => ok(null),
  markAllRead: ()   => ok(null),
}

// ── Admin ──────────────────────────────────────────────────────

export const adminApi = {
  getDashboard: () => ok({
    totalUsers:    24,
    activeTrips:    8,
    totalTrips:    31,
    totalExpenses: 486500,
    recentActivity: [
      { action: 'User registered',     userId: 'user-24', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
      { action: 'Trip created',        userId: 'user-12', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
      { action: 'Expense added',       userId: 'user-7',  timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
      { action: 'Settlement paid',     userId: 'user-3',  timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString() },
      { action: 'Member invited',      userId: 'user-1',  timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString() },
    ],
  }),
  getUsers: () => ok([
    { userId: 'user-1', fullName: 'Aditya Sharma', email: 'aditya@example.com', role: 'Admin',  isActive: true },
    { userId: 'user-2', fullName: 'Priya Mehta',   email: 'priya@example.com',  role: 'User',   isActive: true },
    { userId: 'user-3', fullName: 'Rahul Verma',   email: 'rahul@example.com',  role: 'User',   isActive: true },
    { userId: 'user-4', fullName: 'Sneha Kapoor',  email: 'sneha@example.com',  role: 'User',   isActive: true },
    { userId: 'user-5', fullName: 'Karan Patel',   email: 'karan@example.com',  role: 'User',   isActive: false },
  ]),
  deactivateUser: () => ok(null),
  getTrips: () => ok(TRIPS),
  getAuditLogs: () => ok([
    { action: 'LOGIN',           userId: 'user-1', entityType: 'User',    entityId: 'user-1', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { action: 'EXPENSE_CREATED', userId: 'user-1', entityType: 'Expense', entityId: 'exp-1',  timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
    { action: 'TRIP_CREATED',    userId: 'user-2', entityType: 'Trip',    entityId: 'trip-1', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { action: 'MEMBER_INVITED',  userId: 'user-1', entityType: 'Member',  entityId: 'user-3', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
    { action: 'SETTLEMENT_PAID', userId: 'user-4', entityType: 'Settlement', entityId: 'set-3', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString() },
  ]),
}
