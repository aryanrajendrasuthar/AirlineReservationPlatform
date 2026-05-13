import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { flightApi, bookingApi } from '../services/api'
import SeatMap from '../components/SeatMap'
import PassengerForm from '../components/PassengerForm'
import CheckoutForm from '../components/CheckoutForm'
import BookingConfirmation from '../components/BookingConfirmation'
import type { Flight, Seat, Booking, Passenger } from '../types'
import { format, parseISO } from 'date-fns'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '')

const STEPS = ['Flight', 'Seats', 'Passengers', 'Payment', 'Confirmation']

export default function BookingWizard() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const flightId = Number(searchParams.get('flightId'))
  const seatClass = searchParams.get('seatClass') ?? 'ECONOMY'
  const passengerCount = Number(searchParams.get('passengers') ?? 1)
  const tripType = searchParams.get('tripType') ?? 'ONE_WAY'

  const [step, setStep] = useState(0)
  const [flight, setFlight] = useState<Flight | null>(null)
  const [seats, setSeats] = useState<Seat[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [passengers, setPassengers] = useState<Passenger[]>(() =>
    Array.from({ length: passengerCount }, () => ({
      name: '',
      email: '',
      passport: '',
      dob: '',
      seatNumber: '',
    }))
  )
  const [booking, setBooking] = useState<Booking | null>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [loadingSeats, setLoadingSeats] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!flightId) { navigate('/'); return }
    flightApi.getById(flightId).then((res) => setFlight(res.data)).catch(() => navigate('/'))
  }, [flightId, navigate])

  const loadSeats = () => {
    setLoadingSeats(true)
    flightApi
      .getSeats(flightId)
      .then((res) => {
        const filtered = res.data.filter((s) => s.seatClass === seatClass)
        setSeats(filtered)
      })
      .catch(() => toast.error('Failed to load seats'))
      .finally(() => setLoadingSeats(false))
  }

  const handleSeatToggle = (seatNumber: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seatNumber) ? prev.filter((s) => s !== seatNumber) : [...prev, seatNumber]
    )
  }

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)))
  }

  const totalPrice = (): number => {
    if (!flight) return 0
    const info = flight.seatClasses[seatClass as keyof typeof flight.seatClasses]
    return (info?.price ?? 0) * selectedSeats.length
  }

  const nextStep = () => {
    if (step === 1 && selectedSeats.length !== passengerCount) {
      toast.error(`Please select exactly ${passengerCount} seat${passengerCount > 1 ? 's' : ''}`)
      return
    }
    if (step === 1) loadSeats()
    setStep((s) => s + 1)
  }

  const prevStep = () => setStep((s) => s - 1)

  const handleInitiateBooking = async () => {
    const passWithSeats = passengers.map((p, i) => ({
      ...p,
      seatNumber: selectedSeats[i],
    }))
    const allFilled = passWithSeats.every(
      (p) => p.name && p.email && p.passport && p.dob
    )
    if (!allFilled) {
      toast.error('Please fill in all passenger details')
      return
    }

    setSubmitting(true)
    try {
      const res = await bookingApi.initiate({
        flightId,
        selectedSeats,
        passengers: passWithSeats,
        tripType,
      })
      setBooking(res.data)
      const secret = res.data.stripeClientSecret ?? ''
      setClientSecret(secret)
      ;(window as unknown as Record<string, unknown>).__stripeClientSecret = secret
      setStep(3)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Booking failed'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = async () => {
    if (!booking) return
    try {
      const res = await bookingApi.confirm(booking.bookingReference)
      setBooking(res.data)
      setStep(4)
      toast.success('Booking confirmed!')
    } catch {
      toast.error('Confirmation failed. Please contact support.')
    }
  }

  if (!flight) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-airline-navy" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    i < step
                      ? 'bg-green-500 text-white'
                      : i === step
                      ? 'bg-airline-navy text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {i < step ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${i === step ? 'text-airline-navy' : 'text-gray-500'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Flight Review */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Review Your Flight</h2>
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-airline-navy rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-airline-navy">{flight.airline}</p>
                <p className="text-sm text-gray-500">{flight.flightNumber} · {flight.aircraft}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">{format(parseISO(flight.departureTime), 'HH:mm')}</p>
                <p className="text-lg font-bold text-airline-navy">{flight.originCode}</p>
                <p className="text-sm text-gray-500">{flight.origin}</p>
                <p className="text-xs text-gray-400">{format(parseISO(flight.departureTime), 'EEE, dd MMM')}</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-xs text-gray-500 mb-1">
                  {Math.floor(flight.durationMinutes / 60)}h {flight.durationMinutes % 60}m
                </p>
                <div className="flex items-center w-full">
                  <div className="flex-1 h-px bg-gray-300" />
                  <svg className="w-5 h-5 text-airline-navy mx-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                  <div className="flex-1 h-px bg-gray-300" />
                </div>
                <p className="text-xs text-gray-500 mt-1">Nonstop</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{format(parseISO(flight.arrivalTime), 'HH:mm')}</p>
                <p className="text-lg font-bold text-airline-navy">{flight.destinationCode}</p>
                <p className="text-sm text-gray-500">{flight.destination}</p>
                <p className="text-xs text-gray-400">{format(parseISO(flight.arrivalTime), 'EEE, dd MMM')}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
              <div>
                <span className="text-sm font-medium text-gray-600">Cabin: </span>
                <span className="text-sm font-bold text-airline-navy">
                  {seatClass === 'ECONOMY' ? 'Economy' : seatClass === 'BUSINESS' ? 'Business' : 'First Class'}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Passengers: </span>
                <span className="text-sm font-bold text-airline-navy">{passengerCount}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Price per seat: </span>
                <span className="text-lg font-bold text-airline-navy">
                  ${flight.seatClasses[seatClass as keyof typeof flight.seatClasses]?.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={() => { loadSeats(); nextStep() }} className="btn-gold">
              Select Seats →
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Seat Selection */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Select Your Seats</h2>
          <p className="text-sm text-gray-500">Choose {passengerCount} seat{passengerCount > 1 ? 's' : ''} in {seatClass} class</p>
          {loadingSeats ? (
            <div className="card p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-airline-navy mx-auto" />
              <p className="text-gray-500 mt-3">Loading seat map…</p>
            </div>
          ) : (
            <div className="card p-6">
              <SeatMap
                seats={seats}
                selectedSeats={selectedSeats}
                maxSelectable={passengerCount}
                onToggle={handleSeatToggle}
              />
            </div>
          )}
          <div className="flex justify-between">
            <button onClick={prevStep} className="btn-secondary">← Back</button>
            <button
              onClick={nextStep}
              disabled={selectedSeats.length !== passengerCount}
              className="btn-gold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Passenger Details →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Passenger Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Passenger Details</h2>
          {passengers.map((p, i) => (
            <PassengerForm
              key={i}
              index={i}
              seatNumber={selectedSeats[i]}
              value={p}
              onChange={handlePassengerChange}
            />
          ))}
          <div className="flex justify-between">
            <button onClick={prevStep} className="btn-secondary">← Back</button>
            <button
              onClick={handleInitiateBooking}
              disabled={submitting}
              className="btn-gold"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing…
                </span>
              ) : 'Proceed to Payment →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && clientSecret && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Payment</h2>
          <div className="card p-4 bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Seats are locked for 10 minutes.</strong> Complete your payment to confirm the booking.
            </p>
          </div>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              totalPrice={totalPrice()}
              onSuccess={handlePaymentSuccess}
              onError={(msg) => toast.error(msg)}
            />
          </Elements>
          <button onClick={prevStep} className="btn-secondary w-full">← Back</button>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && booking && <BookingConfirmation booking={booking} />}
    </div>
  )
}
