import { useEffect, useState } from 'react'
import { notificationApi } from '../api'
import { Card, Spinner, Button, EmptyState } from '../components/ui'
import { Bell, CheckCheck, Circle } from 'lucide-react'

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

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{unreadCount} unread</p>
          )}
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
          description="You're all caught up! Notifications about your trips will appear here."
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.notificationId}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${!n.isRead ? 'border-indigo-200 bg-indigo-50/30' : ''}`}
              onClick={() => !n.isRead && markRead(n.notificationId)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${!n.isRead ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                  <Bell className={`w-4 h-4 ${!n.isRead ? 'text-indigo-600' : 'text-gray-400'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                      {n.title || n.message}
                    </p>
                    {!n.isRead && <Circle className="w-2 h-2 text-indigo-600 fill-indigo-600 flex-shrink-0 mt-1.5" />}
                  </div>
                  {n.title && n.message && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
