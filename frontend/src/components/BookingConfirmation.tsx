import { format, parseISO } from 'date-fns'
import jsPDF from 'jspdf'
import type { Booking } from '../types'

interface Props {
  booking: Booking
}

export default function BookingConfirmation({ booking }: Props) {
  const flight = booking.flight

  const downloadTicket = () => {
    const doc = new jsPDF()

    doc.setFillColor(0, 48, 135)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.text('AirlineReserve', 14, 20)
    doc.setFontSize(11)
    doc.text('Electronic Ticket', 14, 32)

    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.text('Booking Reference', 14, 55)
    doc.setFontSize(20)
    doc.setFont(undefined as unknown as string, 'bold')
    doc.text(booking.bookingReference, 14, 68)

    doc.setFont(undefined as unknown as string, 'normal')
    doc.setFontSize(11)
    doc.text('Passenger(s):', 14, 85)
    booking.passengers.forEach((p, i) => {
      doc.text(`${i + 1}. ${p.name}  |  Seat: ${p.seatNumber}  |  Passport: ${p.passport}`, 14, 93 + i * 8)
    })

    const yBase = 93 + booking.passengers.length * 8 + 10

    doc.setFontSize(12)
    doc.text('Flight Details', 14, yBase)
    doc.setFontSize(10)
    doc.text(`Flight: ${flight.flightNumber}  (${flight.airline})`, 14, yBase + 10)
    doc.text(`From: ${flight.origin} (${flight.originCode})`, 14, yBase + 18)
    doc.text(`To: ${flight.destination} (${flight.destinationCode})`, 14, yBase + 26)
    doc.text(`Departure: ${format(parseISO(flight.departureTime), 'PPPp')}`, 14, yBase + 34)
    doc.text(`Arrival: ${format(parseISO(flight.arrivalTime), 'PPPp')}`, 14, yBase + 42)
    doc.text(`Aircraft: ${flight.aircraft}`, 14, yBase + 50)

    doc.setFontSize(14)
    doc.setFont(undefined as unknown as string, 'bold')
    doc.text(`Total Paid: $${booking.totalPrice.toFixed(2)}`, 14, yBase + 65)

    doc.setFont(undefined as unknown as string, 'normal')
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text('Thank you for flying with AirlineReserve. Have a safe journey!', 14, yBase + 80)

    doc.save(`ticket-${booking.bookingReference}.pdf`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h2>
        <p className="text-gray-500 mt-1">A confirmation has been sent to each passenger's email.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="bg-airline-navy text-white p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">Booking Reference</p>
            <p className="text-2xl font-bold tracking-widest text-airline-gold">{booking.bookingReference}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">Status</p>
            <p className="font-semibold text-green-300">CONFIRMED</p>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <p className="text-sm text-gray-500">From</p>
              <p className="font-bold text-lg">{flight.originCode}</p>
              <p className="text-sm text-gray-600">{flight.origin}</p>
              <p className="text-sm font-medium text-airline-navy">
                {format(parseISO(flight.departureTime), 'EEE, dd MMM · HH:mm')}
              </p>
            </div>
            <div className="text-center text-gray-400">
              <svg className="w-8 h-8 mx-auto text-airline-navy" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
              <p className="text-xs mt-1">{flight.flightNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">To</p>
              <p className="font-bold text-lg">{flight.destinationCode}</p>
              <p className="text-sm text-gray-600">{flight.destination}</p>
              <p className="text-sm font-medium text-airline-navy">
                {format(parseISO(flight.arrivalTime), 'EEE, dd MMM · HH:mm')}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Passengers</p>
            <div className="space-y-2">
              {booking.passengers.map((p, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.email} · {p.passport}</p>
                  </div>
                  <span className="bg-airline-navy text-white text-xs px-2 py-1 rounded font-bold">
                    {p.seatNumber}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <span className="font-semibold text-gray-700">Total Paid</span>
            <span className="text-2xl font-bold text-airline-navy">${booking.totalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button onClick={downloadTicket} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download E-Ticket (PDF)
      </button>
    </div>
  )
}
