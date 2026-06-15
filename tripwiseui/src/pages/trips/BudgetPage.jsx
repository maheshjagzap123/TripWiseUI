import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { budgetApi } from '../../api'
import { Button, Card, Input, Spinner, StatCard, Modal } from '../../components/ui'
import { useForm, useFieldArray } from 'react-hook-form'
import { DollarSign, Plus, Trash2, PieChart } from 'lucide-react'

const CATEGORIES = ['Travel', 'Accommodation', 'Food', 'Shopping', 'Fuel', 'Emergency', 'Miscellaneous']
function fmt(n) { return `₹${Number(n || 0).toLocaleString()}` }

export default function BudgetPage() {
  const { tripId } = useParams()
  const [budget, setBudget] = useState(null)
  const [summary, setSummary] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  const load = async () => {
    try {
      const [bRes, sRes] = await Promise.all([budgetApi.get(tripId), budgetApi.getSummary(tripId)])
      setBudget(bRes.data.data)
      setSummary(sRes.data.data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [tripId])

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">Budget Plan</h2>
        <Button size="sm" onClick={() => setEditOpen(true)}>
          {budget ? 'Edit Budget' : <><Plus className="w-4 h-4" /> Set Budget</>}
        </Button>
      </div>

      {budget ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total Budget" value={fmt(budget.totalBudget)} icon={DollarSign} color="indigo" />
            <StatCard label="Total Planned" value={fmt(budget.totalPlanned)} icon={PieChart} color="purple" />
          </div>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Category Breakdown</h3>
            <div className="space-y-4">
              {summary.map((cat) => {
                const pct = cat.plannedAmount > 0 ? Math.min((cat.actualAmount / cat.plannedAmount) * 100, 100) : 0
                const over = cat.actualAmount > cat.plannedAmount
                return (
                  <div key={cat.category}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700">{cat.category}</span>
                      <span className={`text-xs font-medium ${over ? 'text-red-500' : 'text-gray-500'}`}>
                        {fmt(cat.actualAmount)} / {fmt(cat.plannedAmount)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : 'bg-indigo-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {over && <p className="text-xs text-red-500 mt-1">Over by {fmt(cat.actualAmount - cat.plannedAmount)}</p>}
                  </div>
                )
              })}
            </div>
          </Card>
        </>
      ) : (
        <Card className="p-12 text-center">
          <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No budget set yet</p>
        </Card>
      )}

      <BudgetModal open={editOpen} onClose={() => setEditOpen(false)} tripId={tripId} existing={budget} onSaved={load} />
    </div>
  )
}

function BudgetModal({ open, onClose, tripId, existing, onSaved }) {
  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      totalBudget: existing?.totalBudget || '',
      categories: existing?.categories || CATEGORIES.map(c => ({ category: c, plannedAmount: '' }))
    }
  })
  const { fields } = useFieldArray({ control, name: 'categories' })

  const onSubmit = async (data) => {
    await budgetApi.create(tripId, {
      totalBudget: parseFloat(data.totalBudget),
      categories: data.categories
        .filter(c => c.plannedAmount)
        .map(c => ({ ...c, plannedAmount: parseFloat(c.plannedAmount) }))
    })
    onSaved()
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Budget Plan">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Total Budget" type="number" placeholder="50000" {...register('totalBudget', { required: true })} />
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Category Allocations</p>
          {fields.map((field, i) => (
            <div key={field.id} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-32 flex-shrink-0">{field.category}</span>
              <Input placeholder="Amount" type="number" {...register(`categories.${i}.plannedAmount`)} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={isSubmitting}>Save Budget</Button>
        </div>
      </form>
    </Modal>
  )
}
