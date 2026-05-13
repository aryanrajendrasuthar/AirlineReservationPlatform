import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-airline-navy text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <svg className="w-8 h-8 text-airline-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
            <span className="text-xl font-bold tracking-wide">AirlineReserve</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-airline-gold transition-colors text-sm font-medium">
              Home
            </Link>
            {user ? (
              <>
                <Link to="/bookings" className="hover:text-airline-gold transition-colors text-sm font-medium">
                  My Bookings
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="hover:text-airline-gold transition-colors text-sm font-medium">
                    Admin
                  </Link>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-300">{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-airline-gold text-airline-navy-dark px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-airline-gold-light transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium hover:text-airline-gold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-airline-gold text-airline-navy-dark px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-airline-gold-light transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
