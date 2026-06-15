import { useEffect, useState } from 'react'
import { useParams, useOutletContext, useNavigate } from 'react-router-dom'
import { tripApi } from '../../api'
import { StatCard, Card, Spinner, Badge, Button } from '../../components/ui'
import { DollarSign, TrendingUp, TrendingDown, Receipt, Wallet, Plus, Lock } from 'lucide-react'

function fmt(n) { return `₹${Number(n || 0).toLocaleString()}` }

export default function TripDashboard() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const { trip } = useOutletContext()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  const isActive = trip?.status === 'Active'

  useEffect(() => {
    tripApi.getDashboard(tripId)
      .then(res => setDashboard(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tripId])

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="page-enter space-y-6">
      {/* Completed banner */}
      {!isActive && (
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
          <Lock className="w-4 h-4 flex-shrink-0" />
          <span>This trip is <strong>{trip?.status}</strong> — expenses are locked and cannot be modified.</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Budget" value={fmt(dashboard?.budget)}          icon={Wallet}      color="indigo" />
        <StatCard label="Total Spent"  value={fmt(dashboard?.actualExpense)}    icon={Receipt}     color="amber"  />
        <StatCard label="Remaining"    value={fmt(dashboard?.remainingBudget)}  icon={TrendingDown} color="green" />
        <StatCard label="You Owe"      value={fmt(dashboard?.payableAmount)}    icon={TrendingUp}  color="red"    />
      </div>

      {/* Recent Expenses */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-500" /> Recent Expenses
          </h2>
          {isActive && (
            <Button size="sm" onClick={() => navigate(`/trips/${tripId}/expenses`)}>
              <Plus className="w-4 h-4" /> Add Expense
            </Button>
          )}
        </div>

        {dashboard?.recentExpenses?.length > 0 ? (
          <div className="space-y-3">
            {dashboard.recentExpenses.map((exp) => (
              <div key={exp.expenseId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{exp.description}</p>
                  <p className="text-xs text-gray-400">{exp.category} · {exp.expenseDate?.slice(0, 10)}</p>
                </div>
                <span className="text-sm font-bold text-gray-900">{fmt(exp.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 mb-3">No expenses recorded yet</p>
            {isActive && (
              <Button size="sm" onClick={() => navigate(`/trips/${tripId}/expenses`)}>
                <Plus className="w-4 h-4" /> Add First Expense
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Trip Description */}
      {trip?.description && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">About this trip</h2>
          <p className="text-sm text-gray-500">{trip.description}</p>
        </Card>
      )}
    </div>
  )
}
