import { useEffect, useState } from 'react'
import { notificationApi, memberApi } from '../api'
import { Card, Spinner, Button, EmptyState, Badge } from '../components/ui'
import { Bell, CheckCheck, Circle, Check, X } from 'lucide-react'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [markingAll, setMarkingAll] = useState(false)
  const [actionLoading, setActionLoading] = useState({})

  const load = async () => {
    try {
      const res = await notificationApi.getAll()
      setNotifications(res.data.data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    try {
      await notificationApi.markRead(id)
      setNotifications(prev => prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n))
    } catch { }
  }

  const markAllRead = async () => {
    setMarkingAll(true)
    try {
      await notificationApi.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch { } finally { setMarkingAll(false) }
  }

  const handleInvite = async (n, action) => {
    setActionLoading(prev => ({ ...prev, [n.notificationId]: action }))
    try {
      if (action === 'accept') {
        await memberApi.join(n.tripId, n.inviteToken)
      }
      // mark as read and store decision
      await notificationApi.markRead(n.notificationId)
      setNotifications(prev => prev.map(x =>
        x.notificationId === n.notificationId
          ? { ...x, isRead: true, inviteAction: action }
          : x
      ))
    } catch { } finally {
      setActionLoading(prev => ({ ...prev, [n.notificationId]: null }))
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="page-enter px-4 sm:px-8 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={markAllRead} loading={markingAll}>
            <CheckCheck className="w-4 h-4" /> Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="Trip invitations and updates will appear here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.notificationId}
              className={`card-hover p-4 transition-all ${!n.isRead ? 'border-indigo-200 bg-indigo-50/30' : ''}`}
              onClick={() => !n.isRead && !n.type?.startsWith('invite') && markRead(n.notificationId)}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.isRead ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <Bell className={`w-4 h-4 ${!n.isRead ? 'text-indigo-600' : 'text-gray-400'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {n.title || n.message}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {n.type === 'trip_invite' && !n.inviteAction && (
                        <Badge color="indigo">Invite</Badge>
                      )}
                      {!n.isRead && <Circle className="w-2 h-2 text-indigo-600 fill-indigo-600" />}
                    </div>
                  </div>

                  {n.title && n.message && (
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>

                  {/* Trip invite actions */}
                  {n.type === 'trip_invite' && (
                    <div className="mt-3">
                      {n.inviteAction === 'accept' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                          <Check className="w-3.5 h-3.5" /> Accepted
                        </span>
                      ) : n.inviteAction === 'decline' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          <X className="w-3.5 h-3.5" /> Declined
                        </span>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="success"
                            loading={actionLoading[n.notificationId] === 'accept'}
                            onClick={() => handleInvite(n, 'accept')}
                          >
                            <Check className="w-3.5 h-3.5" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={actionLoading[n.notificationId] === 'decline'}
                            onClick={() => handleInvite(n, 'decline')}
                          >
                            <X className="w-3.5 h-3.5" /> Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
