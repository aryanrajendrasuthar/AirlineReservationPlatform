import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'

interface Props {
  totalPrice: number
  onSuccess: () => void
  onError: (msg: string) => void
  disabled?: boolean
}

export default function CheckoutForm({ totalPrice, onSuccess, onError, disabled }: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    const card = elements.getElement(CardElement)
    if (!card) {
      setProcessing(false)
      return
    }

    const { error } = await stripe.confirmCardPayment(
      (window as unknown as { __stripeClientSecret: string }).__stripeClientSecret,
      { payment_method: { card } }
    )

    setProcessing(false)
    if (error) {
      toast.error(error.message ?? 'Payment failed')
      onError(error.message ?? 'Payment failed')
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="card p-5">
        <h3 className="font-semibold text-airline-navy mb-4">Payment Details</h3>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1F2937',
                  '::placeholder': { color: '#9CA3AF' },
                },
              },
            }}
          />
        </div>

        <div className="flex gap-3 mt-3 text-xs text-gray-500">
          <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Secured by Stripe. Test mode — use card 4242 4242 4242 4242, any future date, any CVC.</span>
        </div>
      </div>

      <div className="card p-4 bg-airline-navy text-white">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Total Amount</span>
          <span className="text-2xl font-bold text-airline-gold">${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing || disabled}
        className="btn-gold w-full text-base font-semibold"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing…
          </span>
        ) : (
          `Pay $${totalPrice.toFixed(2)}`
        )}
      </button>
    </form>
  )
}
