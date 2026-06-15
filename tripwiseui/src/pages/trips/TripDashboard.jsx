import { useEffect, useState } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { tripApi } from '../../api'
import { StatCard, Card, Spinner, Badge } from '../../components/ui'
import { DollarSign, TrendingUp, TrendingDown, Users, Receipt, Wallet } from 'lucide-react'

function fmt(n) { return `₹${Number(n || 0).toLocaleString()}` }

export default function TripDashboard() {
  const { tripId } = useParams()
  const { trip } = useOutletContext()
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tripApi.getDashboard(tripId)
      .then(res => setDashboard(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tripId])

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Budget" value={fmt(dashboard?.budget)} icon={Wallet} color="indigo" />
        <StatCard label="Total Spent" value={fmt(dashboard?.actualExpense)} icon={Receipt} color="amber" />
        <StatCard label="Remaining" value={fmt(dashboard?.remainingBudget)} icon={TrendingDown} color="green" />
        <StatCard label="You Owe" value={fmt(dashboard?.payableAmount)} icon={TrendingUp} color="red" />
      </div>

      {/* Recent Expenses */}
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-indigo-500" /> Recent Expenses
        </h2>
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
          <p className="text-sm text-gray-400 text-center py-6">No expenses recorded yet</p>
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
