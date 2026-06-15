import { useEffect, useState } from 'react'
import { useParams, useOutletContext } from 'react-router-dom'
import { expenseApi } from '../../api'
import { Button, Card, Input, Select, Badge, Spinner, EmptyState, Modal } from '../../components/ui'
import { useForm } from 'react-hook-form'
import { Plus, Receipt, Trash2, Pencil, Lock } from 'lucide-react'

const CATEGORIES = ['Travel', 'Accommodation', 'Food', 'Shopping', 'Fuel', 'Emergency', 'Miscellaneous']
const catColor = { Travel: 'indigo', Accommodation: 'blue', Food: 'amber', Shopping: 'purple', Fuel: 'green', Emergency: 'red', Miscellaneous: 'gray' }
function fmt(n) { return `₹${Number(n || 0).toLocaleString()}` }

export default function ExpensesPage() {
  const { tripId } = useParams()
  const { trip } = useOutletContext()
  const isActive = trip?.status === 'Active'

  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filterCat, setFilterCat] = useState('')

  const load = async () => {
    try {
      const res = await expenseApi.getAll(tripId, filterCat ? { category: filterCat } : {})
      setExpenses(res.data.data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [tripId, filterCat])

  const handleDelete = async (expenseId) => {
    if (!confirm('Delete this expense?')) return
    await expenseApi.delete(tripId, expenseId)
    load()
  }

  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)

  return (
    <div className="page-enter space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Expenses</h2>
          <p className="text-xs text-gray-400">{expenses.length} items · Total {fmt(total)}</p>
        </div>
        {isActive && (
          <Button size="sm" onClick={() => { setEditing(null); setModalOpen(true) }}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        )}
      </div>

      {/* Locked banner for non-active trips */}
      {!isActive && (
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500">
          <Lock className="w-4 h-4 flex-shrink-0" />
          <span>Expenses are locked — this trip is <strong>{trip?.status}</strong>.</span>
        </div>
      )}

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {['', ...CATEGORIES].map(c => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filterCat === c ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {c || 'All'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No expenses yet"
          description={isActive ? 'Add your first expense' : 'No expenses recorded for this trip'}
          action={isActive
            ? <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Add Expense</Button>
            : null
          }
        />
      ) : (
        <div className="space-y-2">
          {expenses.map((exp) => (
            <Card key={exp.expenseId} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-sm font-semibold text-gray-900">{exp.description}</p>
                    <Badge color={catColor[exp.category] || 'gray'}>{exp.category}</Badge>
                  </div>
                  <p className="text-xs text-gray-400">
                    {exp.expenseDate?.slice(0, 10)} · Paid by {exp.paidByUserId?.slice(0, 8)}…
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm">{fmt(exp.amount)}</span>
                  {isActive && (
                    <>
                      <button
                        onClick={() => { setEditing(exp); setModalOpen(true) }}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp.expenseId)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isActive && (
        <ExpenseModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          tripId={tripId}
          editing={editing}
          onSaved={load}
        />
      )}
    </div>
  )
}

function ExpenseModal({ open, onClose, tripId, editing, onSaved }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const [error, setError] = useState('')

  useEffect(() => {
    reset(editing || { amount: '', category: '', description: '', expenseDate: '', paidByUserId: '' })
  }, [editing, open])

  const onSubmit = async (data) => {
    try {
      setError('')
      if (editing) {
        await expenseApi.update(tripId, editing.expenseId, { ...data, amount: parseFloat(data.amount) })
      } else {
        await expenseApi.create(tripId, { ...data, amount: parseFloat(data.amount) })
      }
      onSaved()
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save expense')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit Expense' : 'Add Expense'}>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Description"
          placeholder="Dinner at hotel"
          error={errors.description?.message}
          {...register('description', { required: 'Required' })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number"
            placeholder="1500"
            error={errors.amount?.message}
            {...register('amount', { required: 'Required' })}
          />
          <Input
            label="Date"
            type="date"
            error={errors.expenseDate?.message}
            {...register('expenseDate', { required: 'Required' })}
          />
        </div>
        <Select
          label="Category"
          error={errors.category?.message}
          {...register('category', { required: 'Required' })}
        >
          <option value="">Select category</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Input label="Paid By (User ID)" placeholder="User ID" {...register('paidByUserId')} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={isSubmitting}>
            {editing ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
