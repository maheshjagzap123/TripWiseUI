import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { walletApi } from '../../api'
import { Button, Card, StatCard, Spinner, Modal, Input } from '../../components/ui'
import { useForm } from 'react-hook-form'
import { Wallet, Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'

function fmt(n) { return `₹${Number(n || 0).toLocaleString()}` }

export default function WalletPage() {
  const { tripId } = useParams()
  const [wallet, setWallet] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [contributeOpen, setContributeOpen] = useState(false)

  const load = async () => {
    try {
      const [wRes, tRes] = await Promise.all([walletApi.get(tripId), walletApi.getTransactions(tripId)])
      setWallet(wRes.data.data)
      setTransactions(tRes.data.data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [tripId])

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="page-enter space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Trip Wallet</h2>
        <Button size="sm" onClick={() => setContributeOpen(true)}>
          <Plus className="w-4 h-4" /> Contribute
        </Button>
      </div>

      {wallet && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total" value={fmt(wallet.totalBalance)} icon={Wallet} color="indigo" />
          <StatCard label="Spent" value={fmt(wallet.totalExpenses)} icon={ArrowUpCircle} color="red" />
          <StatCard label="Left" value={fmt(wallet.remainingBalance)} icon={ArrowDownCircle} color="green" />
        </div>
      )}

      {/* Contributions */}
      {wallet?.contributions?.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Contributions</h3>
          <div className="space-y-2">
            {wallet.contributions.map((c) => (
              <div key={c.contributionId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.userName || c.userId?.slice(0, 8)}</p>
                  <p className="text-xs text-gray-400">{c.note || '—'} · {c.contributedAt?.slice(0, 10)}</p>
                </div>
                <span className="text-sm font-bold text-emerald-600">+{fmt(c.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Transactions */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Transaction History</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.description || t.type}</p>
                  <p className="text-xs text-gray-400">{t.date?.slice(0, 10)}</p>
                </div>
                <span className={`text-sm font-bold ${t.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {t.amount > 0 ? '+' : ''}{fmt(t.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ContributeModal open={contributeOpen} onClose={() => setContributeOpen(false)} tripId={tripId} onSaved={load} />
    </div>
  )
}

function ContributeModal({ open, onClose, tripId, onSaved }) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm()
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    try {
      await walletApi.contribute(tripId, { ...data, amount: parseFloat(data.amount) })
      reset()
      onSaved()
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add contribution')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Contribution">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Amount" type="number" placeholder="5000" {...register('amount', { required: true })} />
        <Input label="User ID" placeholder="User ID" {...register('userId', { required: true })} />
        <Input label="Note" placeholder="Initial contribution" {...register('note')} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={isSubmitting}>Add</Button>
        </div>
      </form>
    </Modal>
  )
}
