import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { bookingApi } from '../services/api'
import type { Booking } from '../types'
import toast from 'react-hot-toast'

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-red-100 text-red-600',
  PAYMENT_FAILED: 'bg-red-100 text-red-600',
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState<string | null>(null)

  useEffect(() => {
    bookingApi
      .getMyBookings()
      .then((res) => setBookings(res.data))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (ref: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(ref)
    try {
      const res = await bookingApi.cancel(ref)
      setBookings((prev) => prev.map((b) => (b.bookingReference === ref ? res.data : b)))
      toast.success('Booking cancelled')
    } catch {
      toast.error('Failed to cancel booking')
    } finally {
      setCancelling(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No bookings yet</h3>
          <p className="text-gray-500 text-sm">Your confirmed bookings will appear here.</p>
          <a href="/" className="inline-block mt-4 btn-primary text-sm">Search Flights</a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const flight = booking.flight
            return (
              <div key={booking.id} className="card overflow-hidden">
                <div className="bg-airline-navy text-white px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-300">Booking Reference</p>
                    <p className="font-bold text-airline-gold tracking-widest">{booking.bookingReference}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_STYLES[booking.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{format(parseISO(flight.departureTime), 'HH:mm')}</p>
                      <p className="font-semibold text-airline-navy">{flight.originCode}</p>
                      <p className="text-xs text-gray-500">{flight.origin}</p>
                    </div>
                    <div className="flex-1 flex flex-col items-center px-4">
                      <p className="text-xs text-gray-400 mb-1">
                        {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m · {flight.flightNumber}
                      </p>
                      <div className="flex items-center w-full">
                        <div className="flex-1 h-px bg-gray-300" />
                        <svg className="w-4 h-4 text-airline-navy mx-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                        </svg>
                        <div className="flex-1 h-px bg-gray-300" />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Nonstop</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{format(parseISO(flight.arrivalTime), 'HH:mm')}</p>
                      <p className="font-semibold text-airline-navy">{flight.destinationCode}</p>
                      <p className="text-xs text-gray-500">{flight.destination}</p>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Date: </span>
                      <span className="font-medium">{format(parseISO(flight.departureTime), 'EEE, dd MMM yyyy')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Seats: </span>
                      <span className="font-medium">{booking.seats.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Trip: </span>
                      <span className="font-medium">{booking.tripType === 'ONE_WAY' ? 'One Way' : 'Round Trip'}</span>
                    </div>
                    <div className="ml-auto">
                      <span className="text-gray-500">Total: </span>
                      <span className="font-bold text-airline-navy text-base">${booking.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {booking.passengers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {booking.passengers.map((p, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {p.name} · {p.seatNumber}
                        </span>
                      ))}
                    </div>
                  )}

                  {booking.status === 'CONFIRMED' && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => handleCancel(booking.bookingReference)}
                        disabled={cancelling === booking.bookingReference}
                        className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {cancelling === booking.bookingReference ? 'Cancelling…' : 'Cancel Booking'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
