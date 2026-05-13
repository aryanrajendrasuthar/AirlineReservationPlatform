import type { Seat } from '../types'

interface Props {
  seats: Seat[]
  selectedSeats: string[]
  maxSelectable: number
  onToggle: (seatNumber: string) => void
}

const CLASS_COLORS = {
  FIRST: '#8B5CF6',
  BUSINESS: '#2563EB',
  ECONOMY: '#6B7280',
}

const SEAT_STATUS = {
  AVAILABLE: 'available',
  LOCKED: 'locked',
  BOOKED: 'booked',
}

export default function SeatMap({ seats, selectedSeats, maxSelectable, onToggle }: Props) {
  const rows = Array.from(new Set(seats.map((s) => parseInt(s.seatNumber)))).sort((a, b) => a - b)
  const cols = ['A', 'B', 'C', 'D', 'E', 'F']

  const seatMap = new Map(seats.map((s) => [s.seatNumber, s]))

  const getSeatClass = (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) return 'selected'
    const seat = seatMap.get(seatNumber)
    if (!seat) return null
    return SEAT_STATUS[seat.status] ?? 'available'
  }

  const getSeatColor = (seatNumber: string) => {
    const state = getSeatClass(seatNumber)
    if (state === 'selected') return '#003087'
    if (state === 'locked') return '#FBBF24'
    if (state === 'booked') return '#9CA3AF'

    const seat = seatMap.get(seatNumber)
    if (!seat) return '#E5E7EB'
    return CLASS_COLORS[seat.seatClass] ?? '#6B7280'
  }

  const isClickable = (seatNumber: string) => {
    const seat = seatMap.get(seatNumber)
    if (!seat || seat.status !== 'AVAILABLE') return false
    if (selectedSeats.includes(seatNumber)) return true
    return selectedSeats.length < maxSelectable
  }

  const SEAT_W = 32
  const SEAT_H = 30
  const SEAT_GAP = 6
  const COL_GAP = 14
  const ROW_GAP = 10
  const AISLE_GAP = 20
  const LABEL_W = 30
  const PADDING = 20

  const colX = (colIdx: number) => {
    const aisle = colIdx >= 3 ? AISLE_GAP : 0
    return LABEL_W + PADDING + colIdx * (SEAT_W + SEAT_GAP) + aisle + COL_GAP
  }

  const rowY = (rowIdx: number) => PADDING + 40 + rowIdx * (SEAT_H + ROW_GAP)

  const svgWidth = LABEL_W + PADDING * 2 + 6 * (SEAT_W + SEAT_GAP) + AISLE_GAP + COL_GAP + 20
  const svgHeight = PADDING + 40 + rows.length * (SEAT_H + ROW_GAP) + PADDING

  const seatsByClass = seats.reduce<Record<string, number>>(
    (acc, s) => ({ ...acc, [s.seatClass]: (acc[s.seatClass] ?? 0) + 1 }),
    {}
  )

  const firstLastRow = (cls: string) => {
    const clsSeats = seats.filter((s) => s.seatClass === cls)
    if (!clsSeats.length) return null
    const nums = clsSeats.map((s) => parseInt(s.seatNumber)).sort((a, b) => a - b)
    return { first: nums[0], last: nums[nums.length - 1] }
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-6 justify-center mb-4 flex-wrap">
        {[
          { label: 'Available', color: '#4B5563' },
          { label: 'First Class', color: CLASS_COLORS.FIRST },
          { label: 'Business', color: CLASS_COLORS.BUSINESS },
          { label: 'Selected', color: '#003087' },
          { label: 'Locked', color: '#FBBF24' },
          { label: 'Booked', color: '#9CA3AF' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>

      <svg width={svgWidth} height={svgHeight} className="mx-auto">
        {/* Nose */}
        <ellipse cx={svgWidth / 2} cy={PADDING + 15} rx={svgWidth / 4} ry={18} fill="#E5E7EB" stroke="#D1D5DB" strokeWidth={1} />
        <text x={svgWidth / 2} y={PADDING + 19} textAnchor="middle" fontSize={11} fill="#6B7280" fontWeight="600">FRONT</text>

        {/* Column headers */}
        {cols.map((col, i) => (
          <text key={col} x={colX(i) + SEAT_W / 2} y={PADDING + 36} textAnchor="middle" fontSize={11} fill="#6B7280" fontWeight="600">
            {col}
          </text>
        ))}

        {/* Seats */}
        {rows.map((rowNum, rowIdx) => (
          <g key={rowNum}>
            <text x={LABEL_W + PADDING - 4} y={rowY(rowIdx) + SEAT_H / 2 + 4} textAnchor="end" fontSize={11} fill="#6B7280">
              {rowNum}
            </text>
            {cols.map((col, colIdx) => {
              const seatNumber = `${rowNum}${col}`
              const seat = seatMap.get(seatNumber)
              if (!seat) return null
              const color = getSeatColor(seatNumber)
              const clickable = isClickable(seatNumber)
              const x = colX(colIdx)
              const y = rowY(rowIdx)

              return (
                <g key={col}>
                  <rect
                    x={x}
                    y={y}
                    width={SEAT_W}
                    height={SEAT_H}
                    rx={4}
                    fill={color}
                    stroke={selectedSeats.includes(seatNumber) ? '#001F5A' : 'transparent'}
                    strokeWidth={2}
                    cursor={clickable ? 'pointer' : 'not-allowed'}
                    opacity={seat.status === 'BOOKED' ? 0.5 : 1}
                    onClick={() => clickable && onToggle(seatNumber)}
                  />
                  <text
                    x={x + SEAT_W / 2}
                    y={y + SEAT_H / 2 + 4}
                    textAnchor="middle"
                    fontSize={9}
                    fill="white"
                    fontWeight="600"
                    style={{ pointerEvents: 'none' }}
                  >
                    {seatNumber}
                  </text>
                </g>
              )
            })}
          </g>
        ))}
      </svg>

      <div className="mt-3 text-center text-sm text-gray-600">
        {selectedSeats.length} / {maxSelectable} seat{maxSelectable > 1 ? 's' : ''} selected
      </div>

      <div className="mt-2 flex justify-center gap-6 text-xs text-gray-500">
        {Object.entries(seatsByClass).map(([cls, count]) => (
          <span key={cls}>{cls}: {count} seats</span>
        ))}
      </div>
    </div>
  )
}
