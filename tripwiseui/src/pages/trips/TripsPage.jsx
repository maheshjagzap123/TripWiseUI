import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { tripApi } from '../../api'
import { Button, Card, Badge, Spinner, EmptyState, Modal, Input, Select } from '../../components/ui'
import { Plus, MapPin, Calendar, Users, Plane, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'

const statusColor = { Active: 'green', Completed: 'blue', Cancelled: 'red' }
const tripTypeColor = { Solo: 'purple', Group: 'indigo', Family: 'amber' }

function TripCard({ trip }) {
  return (
    <Link to={`/trips/${trip.tripId}`}>
      <Card className="p-4 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{trip.tripName}</h3>
              <Badge color={statusColor[trip.status] || 'gray'}>{trip.status}</Badge>
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
              <MapPin className="w-3 h-3" /> <span className="truncate">{trip.destination}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{trip.startDate?.slice(0, 10)} → {trip.endDate?.slice(0, 10)}</span>
              <Badge color={tripTypeColor[trip.tripType] || 'gray'}>{trip.tripType}</Badge>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
        </div>
      </Card>
    </Link>
  )
}

function CreateTripModal({ open, onClose, onCreated }) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const [error, setError] = useState('')

  const onSubmit = async (data) => {
    try {
      await tripApi.create(data)
      reset()
      onCreated()
      onClose()
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create trip')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Create New Trip">
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Trip Name" placeholder="Goa Adventure" error={errors.tripName?.message}
          {...register('tripName', { required: 'Trip name is required' })} />
        <Input label="Destination" placeholder="Goa, India" error={errors.destination?.message}
          {...register('destination', { required: 'Destination is required' })} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Date" type="date" error={errors.startDate?.message}
            {...register('startDate', { required: 'Required' })} />
          <Input label="End Date" type="date" error={errors.endDate?.message}
            {...register('endDate', { required: 'Required' })} />
        </div>
        <Select label="Trip Type" {...register('tripType', { required: 'Required' })} error={errors.tripType?.message}>
          <option value="">Select type</option>
          <option value="Solo">Solo</option>
          <option value="Group">Group</option>
          <option value="Family">Family</option>
        </Select>
        <Input label="Description" placeholder="Optional description" {...register('description')} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={isSubmitting}>Create Trip</Button>
        </div>
      </form>
    </Modal>
  )
}

export default function TripsPage() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filter, setFilter] = useState('All')

  const loadTrips = async () => {
    try {
      const res = await tripApi.getAll()
      setTrips(res.data.data || [])
    } catch { } finally { setLoading(false) }
  }

  useEffect(() => { loadTrips() }, [])

  const filtered = filter === 'All' ? trips : trips.filter(t => t.status === filter)

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">My Trips</h1>
          <p className="text-sm text-gray-500 mt-0.5">{trips.length} trip{trips.length !== 1 ? 's' : ''} total</p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm">
          <Plus className="w-4 h-4" /> New Trip
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {['All', 'Active', 'Completed', 'Cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === s ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Plane}
          title="No trips yet"
          description="Create your first trip to start tracking expenses"
          action={<Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Create Trip</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map(trip => <TripCard key={trip.tripId} trip={trip} />)}
        </div>
      )}

      <CreateTripModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={loadTrips} />
    </div>
  )
}
