import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { memberApi } from '../../api'
import { Button, Card, Badge, Spinner, EmptyState, Modal, Input } from '../../components/ui'
import { useForm } from 'react-hook-form'
import { Users, UserPlus, Trash2, Link2, Copy, Check } from 'lucide-react'

export default function MembersPage() {
  const { tripId } = useParams()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  const load = async () => {
    try {
      const res = await memberApi.getAll(tripId)
      setMembers(res.data.data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [tripId])

  const handleRemove = async (userId) => {
    if (!confirm('Remove this member?')) return
    await memberApi.remove(tripId, userId)
    load()
  }

  const getInviteLink = async () => {
    try {
      const res = await memberApi.getInviteLink(tripId)
      const link = `${window.location.origin}/join?token=${res.data.data.token}`
      setInviteLink(link)
    } catch { }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="page-enter space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Members</h2>
          <p className="text-xs text-gray-400">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={getInviteLink}><Link2 className="w-4 h-4" /> Invite Link</Button>
          <Button size="sm" onClick={() => setInviteOpen(true)}><UserPlus className="w-4 h-4" /> Invite</Button>
        </div>
      </div>

      {inviteLink && (
        <Card className="p-3 bg-indigo-50 border-indigo-100">
          <div className="flex items-center gap-2">
            <p className="text-xs text-indigo-700 flex-1 truncate">{inviteLink}</p>
            <button onClick={copyLink} className="p-1.5 rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-600 flex-shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : members.length === 0 ? (
        <EmptyState icon={Users} title="No members yet" description="Invite people to join this trip"
          action={<Button onClick={() => setInviteOpen(true)}><UserPlus className="w-4 h-4" /> Invite Member</Button>} />
      ) : (
        <div className="space-y-2">
          {members.map((m) => (
            <Card key={m.userId} className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-indigo-600">{m.fullName?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{m.fullName}</p>
                  <p className="text-xs text-gray-400">Joined {m.joinedAt?.slice(0, 10)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={m.role === 'Admin' ? 'indigo' : 'gray'}>{m.role}</Badge>
                {m.role !== 'Admin' && (
                  <button onClick={() => handleRemove(m.userId)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} tripId={tripId} onInvited={load} />
    </div>
  )
}

function InviteModal({ open, onClose, tripId, onInvited }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    try {
      await memberApi.invite(tripId, data)
      reset()
      onInvited()
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to invite member')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite Member">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" placeholder="friend@example.com" {...register('email')} />
        <p className="text-xs text-gray-400 text-center">— or —</p>
        <Input label="Phone Number" type="tel" placeholder="+1 234 567 8900" {...register('phoneNumber')} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={isSubmitting}>Send Invite</Button>
        </div>
      </form>
    </Modal>
  )
}
