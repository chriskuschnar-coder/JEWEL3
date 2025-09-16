import React, { useState } from 'react'
import { CreditCard, Shield, Lock, AlertCircle } from 'lucide-react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { useAuth } from './auth/AuthProvider'

interface StripeCardFormProps {
  amount: number
  onSuccess: (result: any) => void
  onError: (error: string) => void
}

export function StripeCardForm({ amount, onSuccess, onError }: StripeCardFormProps) {
  const { user } = useAuth()
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [cardholderName, setCardholderName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!stripe || !elements) {
      onError('Stripe has not loaded yet')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      onError('Card element not found')
      return
    }

    if (!cardholderName.trim()) {
      onError('Please enter the cardholder name')
      return
    }

    setLoading(true)

    try {
      console.log('💳 Creating payment method for amount:', amount)
      
      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardholderName,
          email: user?.email
        }
      })

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message)
      }

      console.log('✅ Payment method created:', paymentMethod.id)

      // Get user session for authentication
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('Please sign in to continue')
      }

      // Create payment intent
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          amount: amount * 100, // Convert to cents
          currency: 'usd',
          user_id: user?.id,
          metadata: {
            user_email: user?.email,
            investment_amount: amount.toString()
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error?.message || 'Failed to create payment intent')
      }

      const { client_secret } = await response.json()
      console.log('✅ Payment intent created')

      // Confirm payment
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: paymentMethod.id
      })

      if (confirmError) {
        throw new Error(confirmError.message)
      }

      if (paymentIntent.status === 'succeeded') {
        console.log('✅ Payment succeeded')
        onSuccess(paymentIntent)
      } else {
        throw new Error('Payment was not successful')
      }
      
    } catch (error) {
      console.error('❌ Payment error:', error)
      onError(error instanceof Error ? error.message : 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  const processingFee = amount * 0.029 + 0.30
  const totalCharge = amount + processingFee

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '18px',
        color: '#424770',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
          <span className="text-sm sm:text-base font-medium text-blue-900">Secure Payment Processing</span>
          <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
        </div>
        <p className="text-xs sm:text-sm text-blue-700">
          Your payment information is encrypted and secure. Powered by Stripe.
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Full name on card"
            required
          />
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Card Details
          </label>
          <div className="w-full px-4 py-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent bg-white">
            <CardElement options={cardElementOptions} />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm text-gray-700">Investment Amount:</span>
          <span className="text-sm sm:text-base font-bold text-gray-900">${amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 text-xs sm:text-sm">Processing fee (2.9% + $0.30):</span>
          <span className="text-gray-600 text-xs sm:text-sm">${processingFee.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm sm:text-base font-medium text-gray-900">Total charge:</span>
            <span className="text-sm sm:text-base font-bold text-gray-900">${totalCharge.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        type="submit"
        size="lg"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4 mr-2" />
            Complete Contribution - ${amount.toLocaleString()}
          </>
        )}
      </button>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-1">
          <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          <span className="font-medium text-green-900 text-xs sm:text-sm">PCI Compliant</span>
        </div>
        <p className="text-xs text-green-700">
          Card details are securely processed by Stripe and never stored on our servers
        </p>
      </div>
    </form>
  )
}