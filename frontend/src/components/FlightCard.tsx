import { format, parseISO } from 'date-fns'
import type { Flight } from '../types'

interface Props {
  flight: Flight
  selectedClass: string
  onSelect: (flight: Flight, seatClass: string) => void
}

const CLASS_LABELS: Record<string, string> = {
  ECONOMY: 'Economy',
  BUSINESS: 'Business',
  FIRST: 'First Class',
}

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-green-100 text-green-700',
  BOARDING: 'bg-blue-100 text-blue-700',
  DEPARTED: 'bg-gray-100 text-gray-600',
  ARRIVED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
  DELAYED: 'bg-yellow-100 text-yellow-700',
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

export default function FlightCard({ flight, selectedClass, onSelect }: Props) {
  const dep = parseISO(flight.departureTime)
  const arr = parseISO(flight.arrivalTime)

  const classes = ['ECONOMY', 'BUSINESS', 'FIRST'].filter((c) => flight.seatClasses[c as keyof typeof flight.seatClasses])

  const displayClass = selectedClass && flight.seatClasses[selectedClass as keyof typeof flight.seatClasses]
    ? selectedClass
    : classes[0]

  const classInfo = flight.seatClasses[displayClass as keyof typeof flight.seatClasses]

  return (
    <div className="card p-5 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-airline-navy rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-airline-navy">{flight.airline}</p>
              <p className="text-xs text-gray-500">{flight.flightNumber} · {flight.aircraft}</p>
            </div>
            <span className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[flight.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {flight.status}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{format(dep, 'HH:mm')}</p>
              <p className="text-sm font-semibold text-airline-navy">{flight.originCode}</p>
              <p className="text-xs text-gray-500">{flight.origin}</p>
            </div>

            <div className="flex-1 flex flex-col items-center">
              <p className="text-xs text-gray-500 mb-1">{formatDuration(flight.durationMinutes)}</p>
              <div className="relative w-full flex items-center">
                <div className="flex-1 h-0.5 bg-gray-300" />
                <svg className="w-4 h-4 text-airline-navy mx-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
                <div className="flex-1 h-0.5 bg-gray-300" />
              </div>
              <p className="text-xs text-gray-500 mt-1">Nonstop</p>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{format(arr, 'HH:mm')}</p>
              <p className="text-sm font-semibold text-airline-navy">{flight.destinationCode}</p>
              <p className="text-xs text-gray-500">{flight.destination}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 min-w-[160px]">
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">{CLASS_LABELS[displayClass]}</p>
            <p className="text-2xl font-bold text-airline-navy">${classInfo?.price.toFixed(2)}</p>
            <p className="text-xs text-gray-500">{classInfo?.available} seats left</p>
          </div>

          <div className="flex flex-col gap-1 w-full">
            {classes.map((c) => {
              const info = flight.seatClasses[c as keyof typeof flight.seatClasses]!
              return (
                <button
                  key={c}
                  onClick={() => onSelect(flight, c)}
                  disabled={info.available === 0}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    c === displayClass
                      ? 'bg-airline-navy text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {CLASS_LABELS[c]} · ${info.price.toFixed(0)}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
