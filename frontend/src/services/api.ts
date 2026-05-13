import axios from 'axios'
import type { Flight, Seat, Booking } from '../types'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
}

export const flightApi = {
  search: (params: {
    origin: string
    destination: string
    date: string
    passengers: number
    seatClass: string
  }) => api.get<Flight[]>('/flights/search', { params }),
  getById: (id: number) => api.get<Flight>(`/flights/${id}`),
  getSeats: (id: number) => api.get<Seat[]>(`/flights/${id}/seats`),
}

export const bookingApi = {
  initiate: (data: {
    flightId: number
    selectedSeats: string[]
    passengers: { name: string; email: string; passport: string; dob: string; seatNumber: string }[]
    tripType: string
  }) => api.post<Booking>('/bookings', data),
  confirm: (reference: string) => api.post<Booking>(`/bookings/${reference}/confirm`),
  cancel: (reference: string) => api.post<Booking>(`/bookings/${reference}/cancel`),
  getMyBookings: () => api.get<Booking[]>('/bookings/my'),
  getByReference: (reference: string) => api.get<Booking>(`/bookings/${reference}`),
}

export const adminApi = {
  getFlights: () => api.get<Flight[]>('/admin/flights'),
  createFlight: (data: object) => api.post<Flight>('/admin/flights', data),
  updateFlight: (id: number, data: object) => api.put<Flight>(`/admin/flights/${id}`, data),
  deleteFlight: (id: number) => api.delete(`/admin/flights/${id}`),
  updateFlightStatus: (id: number, status: string) =>
    api.patch(`/admin/flights/${id}/status`, null, { params: { status } }),
  getAllBookings: () => api.get<Booking[]>('/admin/bookings'),
}

export default api
