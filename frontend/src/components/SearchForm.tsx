import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AIRPORTS } from '../types'
import type { SearchParams } from '../types'

interface Props {
  initialValues?: Partial<SearchParams>
  compact?: boolean
}

export default function SearchForm({ initialValues, compact = false }: Props) {
  const navigate = useNavigate()
  const [params, setParams] = useState<SearchParams>({
    origin: initialValues?.origin ?? '',
    destination: initialValues?.destination ?? '',
    date: initialValues?.date ?? '',
    passengers: initialValues?.passengers ?? 1,
    seatClass: initialValues?.seatClass ?? 'ECONOMY',
  })
  const [tripType, setTripType] = useState<'ONE_WAY' | 'ROUND_TRIP'>('ONE_WAY')

  const set = (key: keyof SearchParams, value: string | number) =>
    setParams((p) => ({ ...p, [key]: value }))

  const handleSwap = () => {
    setParams((p) => ({ ...p, origin: p.destination, destination: p.origin }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!params.origin || !params.destination || !params.date) return
    const q = new URLSearchParams({
      origin: params.origin,
      destination: params.destination,
      date: params.date,
      passengers: String(params.passengers),
      seatClass: params.seatClass,
      tripType,
    })
    navigate(`/search?${q}`)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className={compact ? '' : 'space-y-4'}>
      {!compact && (
        <div className="flex gap-4 mb-2">
          {(['ONE_WAY', 'ROUND_TRIP'] as const).map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value={t}
                checked={tripType === t}
                onChange={() => setTripType(t)}
                className="accent-airline-navy"
              />
              <span className="text-sm font-medium text-gray-700">
                {t === 'ONE_WAY' ? 'One Way' : 'Round Trip'}
              </span>
            </label>
          ))}
        </div>
      )}

      <div className={`grid gap-3 ${compact ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'}`}>
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">From</label>
          <select
            value={params.origin}
            onChange={(e) => set('origin', e.target.value)}
            required
            className="input-field appearance-none"
          >
            <option value="">Select airport</option>
            {AIRPORTS.map((a) => (
              <option key={a.code} value={a.code}>
                {a.city} ({a.code})
              </option>
            ))}
          </select>
        </div>

        <div className="relative flex items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">To</label>
            <select
              value={params.destination}
              onChange={(e) => set('destination', e.target.value)}
              required
              className="input-field appearance-none"
            >
              <option value="">Select airport</option>
              {AIRPORTS.filter((a) => a.code !== params.origin).map((a) => (
                <option key={a.code} value={a.code}>
                  {a.city} ({a.code})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleSwap}
            className="ml-2 mb-0.5 p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Swap"
          >
            <svg className="w-5 h-5 text-airline-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Date</label>
          <input
            type="date"
            value={params.date}
            min={today}
            onChange={(e) => set('date', e.target.value)}
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Passengers</label>
          <select
            value={params.passengers}
            onChange={(e) => set('passengers', Number(e.target.value))}
            className="input-field"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'Passenger' : 'Passengers'}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Cabin</label>
          <select
            value={params.seatClass}
            onChange={(e) => set('seatClass', e.target.value as SearchParams['seatClass'])}
            className="input-field"
          >
            <option value="">Any Class</option>
            <option value="ECONOMY">Economy</option>
            <option value="BUSINESS">Business</option>
            <option value="FIRST">First Class</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn-gold w-full mt-2 text-base">
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Flights
        </span>
      </button>
    </form>
  )
}
