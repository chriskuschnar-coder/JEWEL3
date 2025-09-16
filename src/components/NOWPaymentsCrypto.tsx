import React, { useState } from 'react'
import { Coins, ArrowLeft, AlertCircle, Shield, CheckCircle, Copy, ExternalLink, QrCode } from 'lucide-react'

interface NOWPaymentsCryptoProps {
  amount: number
  userId?: string
  onSuccess: (payment: any) => void
  onError: (error: string) => void
  onBack: () => void
}

interface PaymentInvoice {
  payment_id: string
  pay_address: string
  pay_amount: number
  pay_currency: string
  price_amount: number
  price_currency: string
  order_id: string
  payment_status: string
}

export function NOWPaymentsCrypto({ amount, userId, onSuccess, onError, onBack }: NOWPaymentsCryptoProps) {
  const [selectedCrypto, setSelectedCrypto] = useState('btc')
  const [loading, setLoading] = useState(false)
  const [invoice, setInvoice] = useState<PaymentInvoice | null>(null)
  const [copied, setCopied] = useState('')
  const [checkingStatus, setCheckingStatus] = useState(false)

  // Popular cryptocurrencies
  const cryptoOptions = [
    { code: 'btc', name: 'Bitcoin', symbol: '₿', color: 'text-orange-600' },
    { code: 'eth', name: 'Ethereum', symbol: 'Ξ', color: 'text-blue-600' },
    { code: 'usdt', name: 'Tether USDT', symbol: '₮', color: 'text-green-600' },
    { code: 'usdc', name: 'USD Coin', symbol: '$', color: 'text-blue-500' }
  ]

  const createPayment = async () => {
    if (!userId) {
      onError('User not authenticated')
      return
    }

    setLoading(true)

    try {
      // Convert frontend currency to NOWPayments format
      const nowPaymentsCurrency = selectedCrypto === 'usdt' ? 'usdterc20' : selectedCrypto
      console.log('💳 Creating NOWPayments invoice for:', { amount, currency: nowPaymentsCurrency, userId })
      
      const { supabaseClient } = await import('../lib/supabase-client')
      const { data: { session } } = await supabaseClient.auth.getSession()
      
      if (!session) {
        throw new Error('Please sign in to continue')
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://upevugqarcvxnekzddeh.supabase.co'
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVwZXZ1Z3FhcmN2eG5la3pkZGVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0ODkxMzUsImV4cCI6MjA3MjA2NTEzNX0.t4U3lS3AHF-2OfrBts772eJbxSdhqZr6ePGgkl5kSq4'
      
      const response = await fetch(`${supabaseUrl}/functions/v1/create-crypto-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': anonKey,
          'origin': window.location.origin
        },
        body: JSON.stringify({
          amount: amount,
          currency: nowPaymentsCurrency,
          user_id: userId,
          user_email: session.user?.email
        })
      })

      console.log('📊 Response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response error:', errorText)
        
        let errorMessage = 'Failed to create crypto payment'
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error || errorMessage
        } catch {
          errorMessage = errorText.substring(0, 100)
        }
        
        throw new Error(errorMessage)
      }

      const invoiceData = await response.json()
      console.log('✅ Invoice created successfully:', invoiceData)
      
      setInvoice(invoiceData)
      
      // Start checking payment status
      startStatusChecking(invoiceData.payment_id)
      
    } catch (error) {
      console.error('❌ Payment creation failed:', error)
      onError(error instanceof Error ? error.message : 'Failed to create crypto payment')
    } finally {
      setLoading(false)
    }
  }

  const startStatusChecking = (paymentId: string) => {
    setCheckingStatus(true)
    
    // Check payment status every 30 seconds
    const checkStatus = async () => {
      try {
        const response = await fetch(`https://api.nowpayments.io/v1/payment/${paymentId}`, {
          headers: {
            'x-api-key': 'W443X0G-ESJ4VVE-JTQTXYX-7SCDWV6'
          }
        })
        
        if (response.ok) {
          const payment = await response.json()
          console.log('📊 Payment status:', payment.payment_status)
          
          if (payment.payment_status === 'finished' || payment.payment_status === 'confirmed') {
            console.log('✅ Payment confirmed!')
            setCheckingStatus(false)
            onSuccess(payment)
            return
          }
          
          if (payment.payment_status === 'failed' || payment.payment_status === 'expired') {
            console.log('❌ Payment failed/expired')
            setCheckingStatus(false)
            onError('Payment failed or expired')
            return
          }
        }
      } catch (error) {
        console.error('❌ Status check error:', error)
      }
      
      // Continue checking if payment is still pending
      setTimeout(checkStatus, 30000)
    }
    
    // Start checking after 30 seconds
    setTimeout(checkStatus, 30000)
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field)
      setTimeout(() => setCopied(''), 2000)
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(field)
      setTimeout(() => setCopied(''), 2000)
    })
  }

  const generateQRCode = (address: string, amount: number, currency: string) => {
    // Generate Bitcoin/crypto payment URI
    const uri = `${currency}:${address}?amount=${amount}`
    // Use QR code service
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`
  }

  // If we have an invoice, show the payment interface
  if (invoice) {
    const selectedCryptoData = cryptoOptions.find(c => c.code === selectedCrypto)
    const qrCodeUrl = generateQRCode(invoice.pay_address, invoice.pay_amount, selectedCrypto)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setInvoice(null)
              setCheckingStatus(false)
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Crypto Selection
          </button>
          
          <div className="flex items-center space-x-2 text-sm">
            {checkingStatus && (
              <>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-600">Monitoring blockchain...</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">Payment Address Generated</span>
          </div>
          <p className="text-sm text-green-700">
            Send exactly <strong>{invoice.pay_amount} {invoice.pay_currency.toUpperCase()}</strong> to the address below. 
            Your ${amount.toLocaleString()} investment will be credited automatically upon blockchain confirmation.
          </p>
        </div>

        {/* Payment Details Card */}
        <div className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-4 sm:p-6">
          <div className="text-center mb-6">
            <div className={`text-2xl sm:text-3xl md:text-4xl mb-2 ${selectedCryptoData?.color}`}>
              {selectedCryptoData?.symbol}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              Send {invoice.pay_amount} {invoice.pay_currency.toUpperCase()}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Worth ${invoice.price_amount.toLocaleString()} USD
            </p>
          </div>

          {/* QR Code */}
          <div className="text-center mb-4 sm:mb-6">
            <div className="inline-block p-2 sm:p-4 bg-white border border-gray-200 rounded-lg">
              <img 
                src={qrCodeUrl} 
                alt="Payment QR Code"
                className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto"
                onError={(e) => {
                  // Hide QR code if it fails to load
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Scan with your crypto wallet
            </p>
          </div>

          {/* Payment Address */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              {selectedCryptoData?.name} Address
            </label>
            <div className="flex items-center space-x-2 p-2 sm:p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <code className="flex-1 text-xs sm:text-sm font-mono text-gray-900 break-all">
                {invoice.pay_address}
              </code>
              <button
                onClick={() => copyToClipboard(invoice.pay_address, 'address')}
                className="p-1 sm:p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy address"
              >
                {copied === 'address' ? (
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Amount to Send */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
              Exact Amount to Send
            </label>
            <div className="flex items-center space-x-2 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <code className="flex-1 text-sm sm:text-lg font-mono font-bold text-gray-900">
                {invoice.pay_amount} {invoice.pay_currency.toUpperCase()}
              </code>
              <button
                onClick={() => copyToClipboard(invoice.pay_amount.toString(), 'amount')}
                className="p-1 sm:p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                title="Copy amount"
              >
                {copied === 'amount' ? (
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
                )}
              </button>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              ⚠️ Send the exact amount shown above. Partial payments may not be credited.
            </p>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            <span className="text-sm sm:text-base font-medium text-blue-900">Payment Instructions</span>
          </div>
          <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
            <li>• Send from your personal wallet (not an exchange)</li>
            <li>• Use the exact amount: <strong>{invoice.pay_amount} {invoice.pay_currency.toUpperCase()}</strong></li>
            <li>• Payment will be confirmed automatically on blockchain</li>
            <li>• Your account balance will update within 10-30 minutes</li>
            <li>• Keep this page open until payment is complete</li>
          </ul>
        </div>

        {/* Status Monitoring */}
        {checkingStatus && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm sm:text-base font-medium text-gray-900">Monitoring Payment</span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              We're monitoring the blockchain for your payment. You'll be notified automatically when it's confirmed.
            </p>
          </div>
        )}

        {/* External Link */}
        <div className="text-center">
          <button
            onClick={() => {
              const blockchainUrl = selectedCrypto === 'btc' 
                ? `https://blockstream.info/address/${invoice.pay_address}`
                : selectedCrypto === 'usdt' || selectedCrypto === 'usdc'
                  ? `https://etherscan.io/address/${invoice.pay_address}`
                  : selectedCrypto === 'usdt' || selectedCrypto === 'usdc'
                    ? `https://etherscan.io/address/${invoice.pay_address}`
                    : `https://etherscan.io/address/${invoice.pay_address}`
              window.open(blockchainUrl, '_blank')
            }}
            className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium flex items-center mx-auto"
          >
            View on Blockchain Explorer
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
          </button>
        </div>
      </div>
    )
  }

  // Show cryptocurrency selection
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Payment Methods
        </button>
      </div>

      <div className="text-center mb-8">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Coins className="h-6 w-6 sm:h-8 sm:w-8 text-navy-600" />
        </div>
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">Cryptocurrency Payment</h3>
        <p className="text-sm sm:text-base text-gray-600">
          Secure crypto payment processing for ${amount.toLocaleString()}
        </p>
      </div>

      {/* Cryptocurrency Selection */}
      <div className="mb-8">
        <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-4">Select Cryptocurrency</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          {cryptoOptions.map((crypto) => (
            <button
              key={crypto.code}
              onClick={() => setSelectedCrypto(crypto.code)}
              className={`p-3 sm:p-4 border-2 rounded-lg text-center transition-all ${
                selectedCrypto === crypto.code
                  ? 'border-navy-500 bg-navy-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`text-xl sm:text-2xl mb-1 sm:mb-2 ${crypto.color}`}>{crypto.symbol}</div>
              <div className="font-medium text-gray-900 text-xs sm:text-sm">{crypto.name}</div>
              <div className="text-xs text-gray-600 uppercase">{crypto.code === 'usdt' ? 'USDT' : crypto.code}</div>
            </button>
          ))}
        </div>
      </div>

      {/* NOWPayments Features */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6 mb-6">
        <div className="flex items-center space-x-2 mb-3 sm:mb-4">
          <Coins className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
          <span className="text-sm sm:text-base font-medium text-green-900">NOWPayments Features</span>
        </div>
        <ul className="text-xs sm:text-sm text-green-700 space-y-1 sm:space-y-2">
          <li>• <strong>Real Payment Addresses:</strong> Unique address generated for your transaction</li>
          <li>• <strong>Blockchain Monitoring:</strong> Automatic confirmation via blockchain</li>
          <li>• <strong>Fixed Rate:</strong> Price locked for 10 minutes</li>
          <li>• <strong>Low Fees:</strong> Competitive rates with transparent pricing</li>
          <li>• <strong>Instant Updates:</strong> Account balance updated upon confirmation</li>
        </ul>
      </div>

      <button
        onClick={createPayment}
        disabled={!selectedCrypto || loading}
        className="w-full bg-navy-600 hover:bg-navy-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-semibold transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 sm:w-5 sm:h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Creating Payment Address...
          </>
        ) : (
          <>
            <Coins className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Generate {selectedCrypto.toUpperCase()} Payment Address
          </>
        )}
      </button>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Powered by NOWPayments • Secure blockchain processing
        </p>
      </div>
    </div>
  )
}