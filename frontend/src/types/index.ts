export interface User {
  userId: number
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  token: string
}

export interface SeatClassInfo {
  price: number
  available: number
  total: number
}

export interface Flight {
  id: number
  flightNumber: string
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  departureTime: string
  arrivalTime: string
  durationMinutes: number
  aircraft: string
  airline: string
  status: 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'ARRIVED' | 'CANCELLED' | 'DELAYED'
  seatClasses: {
    ECONOMY?: SeatClassInfo
    BUSINESS?: SeatClassInfo
    FIRST?: SeatClassInfo
  }
}

export interface Seat {
  id: number
  seatNumber: string
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST'
  price: number
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED'
}

export interface Passenger {
  id?: number
  name: string
  email: string
  passport: string
  dob: string
  seatNumber: string
}

export interface Booking {
  id: number
  bookingReference: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'PAYMENT_FAILED'
  tripType: 'ONE_WAY' | 'ROUND_TRIP'
  totalPrice: number
  stripePaymentIntentId?: string
  stripeClientSecret?: string
  createdAt: string
  flight: Flight
  seats: string[]
  passengers: Passenger[]
  user: { id: number; name: string; email: string }
}

export interface SearchParams {
  origin: string
  destination: string
  date: string
  passengers: number
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST' | ''
}

export const AIRPORTS = [
  { code: 'JFK', name: 'New York', city: 'New York' },
  { code: 'LAX', name: 'Los Angeles', city: 'Los Angeles' },
  { code: 'ORD', name: 'Chicago O\'Hare', city: 'Chicago' },
  { code: 'MIA', name: 'Miami', city: 'Miami' },
  { code: 'SFO', name: 'San Francisco', city: 'San Francisco' },
  { code: 'SEA', name: 'Seattle-Tacoma', city: 'Seattle' },
  { code: 'DAL', name: 'Dallas Love Field', city: 'Dallas' },
  { code: 'DEN', name: 'Denver', city: 'Denver' },
  { code: 'BOS', name: 'Boston Logan', city: 'Boston' },
  { code: 'ATL', name: 'Atlanta Hartsfield', city: 'Atlanta' },
  { code: 'LHR', name: 'London Heathrow', city: 'London' },
  { code: 'CDG', name: 'Paris Charles de Gaulle', city: 'Paris' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai' },
  { code: 'NRT', name: 'Tokyo Narita', city: 'Tokyo' },
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney' },
]
