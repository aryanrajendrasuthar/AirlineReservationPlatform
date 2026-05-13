import SearchForm from '../components/SearchForm'

const FEATURED_ROUTES = [
  { from: 'JFK', to: 'LAX', fromCity: 'New York', toCity: 'Los Angeles', price: 189 },
  { from: 'ORD', to: 'MIA', fromCity: 'Chicago', toCity: 'Miami', price: 149 },
  { from: 'SFO', to: 'SEA', fromCity: 'San Francisco', toCity: 'Seattle', price: 99 },
  { from: 'LAX', to: 'JFK', fromCity: 'Los Angeles', toCity: 'New York', price: 209 },
]

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div
        className="relative bg-airline-navy text-white overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #001F5A 0%, #003087 60%, #0045A0 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
              Fly Anywhere,{' '}
              <span className="text-airline-gold">Anytime</span>
            </h1>
            <p className="text-lg text-blue-200 max-w-xl mx-auto">
              Search hundreds of flights, choose your perfect seat, and book instantly with secure payments.
            </p>
          </div>

          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-6 text-gray-900">
            <SearchForm />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-airline-gold">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {[
              { value: '100+', label: 'Destinations' },
              { value: '50K+', label: 'Happy Travelers' },
              { value: '99%', label: 'On-Time Rate' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl md:text-3xl font-extrabold text-airline-navy-dark">{stat.value}</p>
                <p className="text-sm font-medium text-airline-navy-dark opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Routes */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Routes</h2>
        <p className="text-gray-500 mb-8">Top destinations our travelers love</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_ROUTES.map((route) => (
            <a
              key={`${route.from}-${route.to}`}
              href={`/search?origin=${route.from}&destination=${route.to}&date=${new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]}&passengers=1&seatClass=ECONOMY`}
              className="card p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-airline-navy">{route.from}</span>
                <svg className="w-5 h-5 text-airline-gold group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
                <span className="text-lg font-bold text-airline-navy">{route.to}</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">{route.fromCity} → {route.toCity}</p>
              <p className="text-airline-navy font-semibold">from <span className="text-xl font-bold">${route.price}</span></p>
            </a>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why Choose AirlineReserve?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ),
                title: 'Secure Payments',
                desc: 'PCI-compliant Stripe integration for safe, instant transactions with full fraud protection.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                ),
                title: 'Choose Your Seat',
                desc: 'Interactive SVG seat map with real-time availability. Pick your favourite spot before anyone else.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                ),
                title: 'Instant Confirmation',
                desc: 'Booking confirmations and e-tickets delivered to your email the moment payment clears.',
              },
            ].map((f) => (
              <div key={f.title} className="card p-6 text-center">
                <div className="w-12 h-12 bg-airline-navy/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-airline-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
