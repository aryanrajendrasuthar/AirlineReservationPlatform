import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { adminApi } from '../services/api'
import type { Flight, Booking } from '../types'
import { AIRPORTS } from '../types'
import toast from 'react-hot-toast'

type Tab = 'flights' | 'bookings'

const STATUSES = ['SCHEDULED', 'BOARDING', 'DEPARTED', 'ARRIVED', 'CANCELLED', 'DELAYED']
const BOOKING_STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-600',
  PAYMENT_FAILED: 'bg-red-100 text-red-600',
}

const DEFAULT_FLIGHT_FORM = {
  flightNumber: '',
  origin: '',
  originCode: '',
  destination: '',
  destinationCode: '',
  departureTime: '',
  arrivalTime: '',
  aircraft: '',
  airline: '',
  economySeats: 100,
  economyPrice: 199,
  businessSeats: 30,
  businessPrice: 499,
  firstSeats: 10,
  firstPrice: 999,
}

export default function Admin() {
  const [tab, setTab] = useState<Tab>('flights')
  const [flights, setFlights] = useState<Flight[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editFlight, setEditFlight] = useState<Flight | null>(null)
  const [form, setForm] = useState(DEFAULT_FLIGHT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    if (tab === 'flights') {
      adminApi.getFlights().then((r) => setFlights(r.data)).catch(() => toast.error('Failed to load flights')).finally(() => setLoading(false))
    } else {
      adminApi.getAllBookings().then((r) => setBookings(r.data)).catch(() => toast.error('Failed to load bookings')).finally(() => setLoading(false))
    }
  }, [tab])

  const handleAirportSelect = (code: string, field: 'origin' | 'destination') => {
    const airport = AIRPORTS.find((a) => a.code === code)
    if (!airport) return
    setForm((f) => ({
      ...f,
      [field]: airport.city,
      [`${field}Code`]: airport.code,
    }))
  }

  const openCreate = () => {
    setEditFlight(null)
    setForm(DEFAULT_FLIGHT_FORM)
    setShowForm(true)
  }

  const openEdit = (flight: Flight) => {
    setEditFlight(flight)
    setForm({
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      originCode: flight.originCode,
      destination: flight.destination,
      destinationCode: flight.destinationCode,
      departureTime: flight.departureTime.slice(0, 16),
      arrivalTime: flight.arrivalTime.slice(0, 16),
      aircraft: flight.aircraft,
      airline: flight.airline,
      economySeats: flight.seatClasses.ECONOMY?.total ?? 100,
      economyPrice: flight.seatClasses.ECONOMY?.price ?? 199,
      businessSeats: flight.seatClasses.BUSINESS?.total ?? 30,
      businessPrice: flight.seatClasses.BUSINESS?.price ?? 499,
      firstSeats: flight.seatClasses.FIRST?.total ?? 10,
      firstPrice: flight.seatClasses.FIRST?.price ?? 999,
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (editFlight) {
        const res = await adminApi.updateFlight(editFlight.id, form)
        setFlights((prev) => prev.map((f) => (f.id === editFlight.id ? res.data : f)))
        toast.success('Flight updated')
      } else {
        const res = await adminApi.createFlight(form)
        setFlights((prev) => [res.data, ...prev])
        toast.success('Flight created')
      }
      setShowForm(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Operation failed'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this flight and all its seats?')) return
    setDeletingId(id)
    try {
      await adminApi.deleteFlight(id)
      setFlights((prev) => prev.filter((f) => f.id !== id))
      toast.success('Flight deleted')
    } catch {
      toast.error('Failed to delete flight')
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await adminApi.updateFlightStatus(id, status)
      setFlights((prev) => prev.map((f) => (f.id === id ? { ...f, status: status as Flight['status'] } : f)))
      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        {tab === 'flights' && (
          <button onClick={openCreate} className="btn-gold text-sm">
            + Add Flight
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {(['flights', 'bookings'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setLoading(true) }}
            className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors capitalize ${tab === t ? 'bg-white shadow text-airline-navy' : 'text-gray-600 hover:text-gray-800'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Flight Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
            <div className="bg-airline-navy text-white p-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="font-bold text-lg">{editFlight ? 'Edit Flight' : 'Add New Flight'}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Flight Number</label>
                  <input value={form.flightNumber} onChange={(e) => setForm((f) => ({ ...f, flightNumber: e.target.value }))} required className="input-field" placeholder="AA101" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Airline</label>
                  <input value={form.airline} onChange={(e) => setForm((f) => ({ ...f, airline: e.target.value }))} required className="input-field" placeholder="American Airlines" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Aircraft</label>
                  <input value={form.aircraft} onChange={(e) => setForm((f) => ({ ...f, aircraft: e.target.value }))} required className="input-field" placeholder="Boeing 737" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Origin</label>
                  <select value={form.originCode} onChange={(e) => handleAirportSelect(e.target.value, 'origin')} required className="input-field">
                    <option value="">Select airport</option>
                    {AIRPORTS.map((a) => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Destination</label>
                  <select value={form.destinationCode} onChange={(e) => handleAirportSelect(e.target.value, 'destination')} required className="input-field">
                    <option value="">Select airport</option>
                    {AIRPORTS.filter((a) => a.code !== form.originCode).map((a) => <option key={a.code} value={a.code}>{a.city} ({a.code})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Departure</label>
                  <input type="datetime-local" value={form.departureTime} onChange={(e) => setForm((f) => ({ ...f, departureTime: e.target.value }))} required className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Arrival</label>
                  <input type="datetime-local" value={form.arrivalTime} onChange={(e) => setForm((f) => ({ ...f, arrivalTime: e.target.value }))} required className="input-field" />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Seat Configuration</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Economy', seatsKey: 'economySeats', priceKey: 'economyPrice' },
                    { label: 'Business', seatsKey: 'businessSeats', priceKey: 'businessPrice' },
                    { label: 'First Class', seatsKey: 'firstSeats', priceKey: 'firstPrice' },
                  ].map(({ label, seatsKey, priceKey }) => (
                    <div key={label} className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">{label}</p>
                      <input
                        type="number" min={0}
                        value={form[seatsKey as keyof typeof form]}
                        onChange={(e) => setForm((f) => ({ ...f, [seatsKey]: Number(e.target.value) }))}
                        placeholder="Seats"
                        className="input-field text-sm"
                      />
                      <input
                        type="number" min={0} step="0.01"
                        value={form[priceKey as keyof typeof form]}
                        onChange={(e) => setForm((f) => ({ ...f, [priceKey]: Number(e.target.value) }))}
                        placeholder="Price $"
                        className="input-field text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting} className="btn-gold flex-1">
                  {submitting ? 'Saving…' : editFlight ? 'Update Flight' : 'Create Flight'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flights Table */}
      {tab === 'flights' && (
        loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-airline-navy" /></div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    {['Flight', 'Route', 'Departure', 'Aircraft', 'Status', 'Economy', 'Business', 'First', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {flights.map((flight) => (
                    <tr key={flight.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-airline-navy">{flight.flightNumber}</p>
                        <p className="text-xs text-gray-500">{flight.airline}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{flight.originCode} → {flight.destinationCode}</p>
                        <p className="text-xs text-gray-500">{flight.origin} → {flight.destination}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {format(parseISO(flight.departureTime), 'dd MMM · HH:mm')}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">{flight.aircraft}</td>
                      <td className="px-4 py-3">
                        <select
                          value={flight.status}
                          onChange={(e) => handleStatusChange(flight.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {flight.seatClasses.ECONOMY ? `${flight.seatClasses.ECONOMY.available}/${flight.seatClasses.ECONOMY.total}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {flight.seatClasses.BUSINESS ? `${flight.seatClasses.BUSINESS.available}/${flight.seatClasses.BUSINESS.total}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {flight.seatClasses.FIRST ? `${flight.seatClasses.FIRST.available}/${flight.seatClasses.FIRST.total}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(flight)} className="text-xs text-airline-navy hover:underline">Edit</button>
                          <button
                            onClick={() => handleDelete(flight.id)}
                            disabled={deletingId === flight.id}
                            className="text-xs text-red-600 hover:underline disabled:opacity-50"
                          >
                            {deletingId === flight.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {flights.length === 0 && (
                <p className="text-center py-8 text-gray-500">No flights found. Add one to get started.</p>
              )}
            </div>
          </div>
        )
      )}

      {/* Bookings Table */}
      {tab === 'bookings' && (
        loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-airline-navy" /></div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    {['Reference', 'Passenger', 'Flight', 'Route', 'Date', 'Seats', 'Total', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono font-bold text-xs text-airline-navy">{b.bookingReference}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-xs">{b.user.name}</p>
                        <p className="text-xs text-gray-500">{b.user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-medium">{b.flight.flightNumber}</td>
                      <td className="px-4 py-3 text-xs">{b.flight.originCode} → {b.flight.destinationCode}</td>
                      <td className="px-4 py-3 text-xs">
                        {format(parseISO(b.flight.departureTime), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3 text-xs">{b.seats.join(', ')}</td>
                      <td className="px-4 py-3 text-xs font-bold">${b.totalPrice.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${BOOKING_STATUS_STYLES[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <p className="text-center py-8 text-gray-500">No bookings found.</p>
              )}
            </div>
          </div>
        )
      )}
    </div>
  )
}
