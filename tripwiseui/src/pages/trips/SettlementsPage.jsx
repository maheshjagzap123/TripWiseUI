import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { settlementApi } from '../../api'
import { Button, Card, Badge, Spinner, EmptyState, StatCard } from '../../components/ui'
import { Handshake, TrendingUp, TrendingDown, Check } from 'lucide-react'

function fmt(n) { return `₹${Number(n || 0).toLocaleString()}` }

export default function SettlementsPage() {
  const { tripId } = useParams()
  const [settlements, setSettlements] = useState([])
  const [mySettlement, setMySettlement] = useState(null)
  const [balances, setBalances] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  const load = async () => {
    try {
      const [allRes, myRes, balRes] = await Promise.all([
        settlementApi.getAll(tripId),
        settlementApi.getMy(tripId),
        settlementApi.getMemberBalance(tripId),
      ])
      setSettlements(allRes.data.data || [])
      setMySettlement(myRes.data.data)
      setBalances(balRes.data.data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [tripId])

  const handlePay = async (settlementId) => {
    await settlementApi.pay(tripId, settlementId, { paidAt: new Date().toISOString() })
    load()
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="space-y-5">
      <h2 className="text-base font-bold text-gray-900">Settlements</h2>

      {/* My summary */}
      {mySettlement && (
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="You Owe" value={fmt(mySettlement.payables?.reduce((s, p) => s + p.amount, 0))} icon={TrendingUp} color="red" />
          <StatCard label="You Receive" value={fmt(mySettlement.receivables?.reduce((s, r) => s + r.amount, 0))} icon={TrendingDown} color="green" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {['all', 'my', 'balances'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${tab === t ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
          >{t === 'my' ? 'My Dues' : t === 'balances' ? 'Balances' : 'All'}</button>
        ))}
      </div>

      {tab === 'all' && (
        settlements.length === 0 ? (
          <EmptyState icon={Handshake} title="No settlements yet" description="Settlements will appear after expenses are split" />
        ) : (
          <div className="space-y-2">
            {settlements.map((s) => (
              <Card key={s.settlementId} className="p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    <span className="text-red-600">{s.payerName}</span> → <span className="text-emerald-600">{s.receiverName}</span>
                  </p>
                  <p className="text-xs text-gray-400">{fmt(s.amount)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={s.status === 'Paid' ? 'green' : 'amber'}>{s.status}</Badge>
                  {s.status === 'Pending' && (
                    <Button size="sm" variant="success" onClick={() => handlePay(s.settlementId)}>
                      <Check className="w-3.5 h-3.5" /> Mark Paid
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {tab === 'my' && mySettlement && (
        <div className="space-y-4">
          {mySettlement.payables?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">You Owe</p>
              <div className="space-y-2">
                {mySettlement.payables.map((p) => (
                  <Card key={p.settlementId} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">To {p.receiverName}</p>
                      <p className="text-xs text-gray-400">{fmt(p.amount)}</p>
                    </div>
                    <Button size="sm" variant="success" onClick={() => handlePay(p.settlementId)}>
                      <Check className="w-3.5 h-3.5" /> Pay
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {mySettlement.receivables?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">You'll Receive</p>
              <div className="space-y-2">
                {mySettlement.receivables.map((r) => (
                  <Card key={r.settlementId} className="p-4 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">From {r.payerName}</p>
                    <span className="font-bold text-emerald-600">{fmt(r.amount)}</span>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'balances' && (
        <div className="space-y-2">
          {balances.map((b) => (
            <Card key={b.userId} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-indigo-600">{b.fullName?.[0]}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{b.fullName}</span>
                </div>
                <span className={`text-sm font-bold ${b.netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {b.netBalance >= 0 ? '+' : ''}{fmt(b.netBalance)}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-gray-400">
                <span>Paid: {fmt(b.totalPaid)}</span>
                <span>Fair Share: {fmt(b.fairShare)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
