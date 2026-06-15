import { useEffect, useState } from 'react'
import { adminApi } from '../../api'
import { Card, StatCard, Spinner, Badge, Button } from '../../components/ui'
import { Users, Map, Activity, ShieldAlert, UserX } from 'lucide-react'

function fmt(n) { return Number(n || 0).toLocaleString() }

export default function AdminPage() {
  const [dashboard, setDashboard] = useState(null)
  const [users, setUsers] = useState([])
  const [trips, setTrips] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  const load = async () => {
    try {
      const [dRes, uRes, tRes, aRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getUsers(),
        adminApi.getTrips(),
        adminApi.getAuditLogs(),
      ])
      setDashboard(dRes.data.data)
      setUsers(uRes.data.data || [])
      setTrips(tRes.data.data || [])
      setAuditLogs(aRes.data.data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDeactivate = async (userId) => {
    if (!confirm('Deactivate this user?')) return
    try {
      await adminApi.deactivateUser(userId)
      load()
    } catch { }
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="page-enter p-4 sm:p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <ShieldAlert className="w-5 h-5 text-indigo-600" />
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {['overview', 'users', 'trips', 'audit'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${
              tab === t ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >{t === 'audit' ? 'Audit Logs' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && dashboard && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Users" value={fmt(dashboard.totalUsers)} icon={Users} color="indigo" />
            <StatCard label="Active Trips" value={fmt(dashboard.activeTrips)} icon={Map} color="green" />
            <StatCard label="Total Trips" value={fmt(dashboard.totalTrips)} icon={Activity} color="amber" />
            <StatCard label="Total Expenses" value={`₹${fmt(dashboard.totalExpenses)}`} icon={Activity} color="purple" />
          </div>

          {dashboard.recentActivity?.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Recent Activity</h3>
              <div className="space-y-2">
                {dashboard.recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{a.action}</p>
                      <p className="text-xs text-gray-400">{a.userId} · {a.timestamp?.slice(0, 10)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="space-y-2">
          {users.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No users found</p>
          ) : (
            users.map((u) => (
              <Card key={u.userId} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-indigo-600">{u.fullName?.[0]?.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{u.fullName}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge color={u.isActive === false ? 'red' : 'green'}>{u.isActive === false ? 'Inactive' : 'Active'}</Badge>
                  <Badge color={u.role === 'Admin' ? 'indigo' : 'gray'}>{u.role}</Badge>
                  {u.role !== 'Admin' && u.isActive !== false && (
                    <button
                      onClick={() => handleDeactivate(u.userId)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                      title="Deactivate user"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Trips */}
      {tab === 'trips' && (
        <div className="space-y-2">
          {trips.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No trips found</p>
          ) : (
            trips.map((t) => (
              <Card key={t.tripId} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.tripName}</p>
                    <p className="text-xs text-gray-400">{t.destination} · {t.startDate?.slice(0, 10)} – {t.endDate?.slice(0, 10)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Owner: {t.createdBy}</p>
                  </div>
                  <Badge color={t.status === 'Active' ? 'green' : t.status === 'Completed' ? 'blue' : 'gray'}>{t.status}</Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Audit Logs */}
      {tab === 'audit' && (
        <div className="space-y-2">
          {auditLogs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-12">No audit logs found</p>
          ) : (
            auditLogs.map((log, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">User: {log.userId} · Entity: {log.entityType} {log.entityId}</p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{log.timestamp?.slice(0, 16).replace('T', ' ')}</p>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
