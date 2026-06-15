import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { analyticsApi } from '../../api'
import { Card, Spinner, StatCard } from '../../components/ui'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { BarChart2, DollarSign, Users, TrendingUp } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#3b82f6', '#f97316']
function fmt(n) { return `₹${Number(n || 0).toLocaleString()}` }

export default function AnalyticsPage() {
  const { tripId } = useParams()
  const { dark } = useTheme()
  const axisColor  = dark ? '#64748b' : '#9ca3af'
  const gridColor  = dark ? '#1e2330' : '#f3f4f6'
  const labelColor = dark ? '#94a3b8' : '#6b7280'
  const tooltipBg  = dark ? '#1e2330' : '#ffffff'
  const tooltipBorder = dark ? '#374151' : '#e5e7eb'
  const [summary, setSummary] = useState(null)
  const [catBreakdown, setCatBreakdown] = useState([])
  const [budgetVsActual, setBudgetVsActual] = useState([])
  const [memberContrib, setMemberContrib] = useState([])
  const [trend, setTrend] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsApi.getSummary(tripId),
      analyticsApi.getCategoryBreakdown(tripId),
      analyticsApi.getBudgetVsActual(tripId),
      analyticsApi.getMemberContributions(tripId),
      analyticsApi.getSpendingTrend(tripId),
    ]).then(([s, c, b, m, t]) => {
      setSummary(s.data.data)
      setCatBreakdown(c.data.data || [])
      setBudgetVsActual(b.data.data || [])
      setMemberContrib(m.data.data || [])
      setTrend(t.data.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [tripId])

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="page-enter space-y-5">
      <h2 className="text-base font-bold text-gray-900">Analytics</h2>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Budget" value={fmt(summary.totalBudget)} icon={DollarSign} color="indigo" />
          <StatCard label="Total Expense" value={fmt(summary.totalExpense)} icon={TrendingUp} color="amber" />
          <StatCard label="Remaining" value={fmt(summary.remainingBudget)} icon={BarChart2} color="green" />
          <StatCard label="Members" value={summary.totalMembers} icon={Users} color="purple" sub={`Top: ${summary.topCategory || '—'}`} />
        </div>
      )}

      {/* Spending Trend */}
      {trend.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Daily Spending Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: axisColor }} tickFormatter={d => d?.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: labelColor }} />
              <Line type="monotone" dataKey="totalAmount" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Budget vs Actual */}
      {budgetVsActual.length > 0 && (
        <Card className="p-5">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Budget vs Actual</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={budgetVsActual} barGap={4}>
              <XAxis dataKey="category" tick={{ fontSize: 10, fill: axisColor }} />
              <YAxis tick={{ fontSize: 10, fill: axisColor }} tickFormatter={v => `₹${v}`} />
              <Tooltip formatter={(v) => fmt(v)} contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: labelColor }} />
              <Legend wrapperStyle={{ fontSize: 11, color: labelColor }} />
              <Bar dataKey="planned" name="Planned" fill={dark ? '#4f46e5' : '#c7d2fe'} radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual"  name="Actual"  fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Category Pie */}
        {catBreakdown.length > 0 && (
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Expense by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={catBreakdown}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%" cy="50%"
                  outerRadius={75}
                  label={({ category, percentage }) => `${category} ${percentage?.toFixed(0)}%`}
                  labelLine={false}
                >
                  {catBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: labelColor }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Member Contributions */}
        {memberContrib.length > 0 && (
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Member Contributions</h3>
            <div className="space-y-3">
              {memberContrib.map((m, i) => (
                <div key={m.userId}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{m.fullName}</span>
                    <span className="text-gray-500 text-xs">{fmt(m.totalPaid)} ({m.sharePercentage?.toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${m.sharePercentage || 0}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
