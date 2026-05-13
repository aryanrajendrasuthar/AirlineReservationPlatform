import type { Passenger } from '../types'

interface Props {
  index: number
  seatNumber: string
  value: Passenger
  onChange: (index: number, field: keyof Passenger, value: string) => void
}

export default function PassengerForm({ index, seatNumber, value, onChange }: Props) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-airline-navy mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-airline-navy text-white text-sm flex items-center justify-center font-bold">
          {index + 1}
        </span>
        Passenger {index + 1}
        <span className="ml-auto text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
          Seat {seatNumber}
        </span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Full Name</label>
          <input
            type="text"
            value={value.name}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            placeholder="As on passport"
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Email</label>
          <input
            type="email"
            value={value.email}
            onChange={(e) => onChange(index, 'email', e.target.value)}
            placeholder="passenger@email.com"
            required
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Passport Number</label>
          <input
            type="text"
            value={value.passport}
            onChange={(e) => onChange(index, 'passport', e.target.value)}
            placeholder="e.g. AB1234567"
            required
            className="input-field uppercase"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Date of Birth</label>
          <input
            type="date"
            value={value.dob}
            onChange={(e) => onChange(index, 'dob', e.target.value)}
            required
            max={new Date().toISOString().split('T')[0]}
            className="input-field"
          />
        </div>
      </div>
    </div>
  )
}
