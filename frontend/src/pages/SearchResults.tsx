import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { flightApi } from '../services/api'
import FlightCard from '../components/FlightCard'
import SearchForm from '../components/SearchForm'
import type { Flight, SearchParams } from '../types'
import toast from 'react-hot-toast'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const origin = searchParams.get('origin') ?? ''
  const destination = searchParams.get('destination') ?? ''
  const date = searchParams.get('date') ?? ''
  const passengers = Number(searchParams.get('passengers') ?? 1)
  const seatClass = (searchParams.get('seatClass') ?? '') as SearchParams['seatClass']
  const tripType = searchParams.get('tripType') ?? 'ONE_WAY'

  const [flights, setFlights] = useState<Flight[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'departure'>('price')
  const [filterClass, setFilterClass] = useState<string>(seatClass)

  useEffect(() => {
    if (!origin || !destination || !date) return
    setLoading(true)
    flightApi
      .search({ origin, destination, date, passengers, seatClass })
      .then((res) => setFlights(res.data))
      .catch(() => toast.error('Failed to load flights'))
      .finally(() => setLoading(false))
  }, [origin, destination, date, passengers, seatClass])

  const sorted = [...flights].sort((a, b) => {
    if (sortBy === 'price') {
      const pa = filterClass && a.seatClasses[filterClass as keyof typeof a.seatClasses]
        ? a.seatClasses[filterClass as keyof typeof a.seatClasses]!.price
        : Math.min(...Object.values(a.seatClasses).map((c) => c?.price ?? Infinity))
      const pb = filterClass && b.seatClasses[filterClass as keyof typeof b.seatClasses]
        ? b.seatClasses[filterClass as keyof typeof b.seatClasses]!.price
        : Math.min(...Object.values(b.seatClasses).map((c) => c?.price ?? Infinity))
      return pa - pb
    }
    if (sortBy === 'duration') return a.durationMinutes - b.durationMinutes
    return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
  })

  const handleSelect = (flight: Flight, cls: string) => {
    navigate(
      `/book?flightId=${flight.id}&seatClass=${cls}&passengers=${passengers}&tripType=${tripType}`
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Collapsed search bar */}
      <div className="card p-4 mb-6">
        <SearchForm
          initialValues={{ origin, destination, date, passengers, seatClass }}
          compact
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {origin} → {destination}
          </h1>
          <p className="text-sm text-gray-500">
            {loading ? 'Searching…' : `${flights.length} flight${flights.length !== 1 ? 's' : ''} found`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-airline-navy"
          >
            <option value="">All Classes</option>
            <option value="ECONOMY">Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First Class</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-airline-navy"
          >
            <option value="price">Sort: Price</option>
            <option value="duration">Sort: Duration</option>
            <option value="departure">Sort: Departure</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-4">
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-8 bg-gray-200 rounded w-3/4" />
                </div>
                <div className="w-40 space-y-2">
                  <div className="h-6 bg-gray-200 rounded" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No flights found</h3>
          <p className="text-gray-500 text-sm">Try different dates or airports.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              selectedClass={filterClass}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
