import React, { useState } from 'react';
import { X, TrendingUp, Shield, Award, CreditCard, Building, Zap, Coins, ArrowRight, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { EmptyPortfolioState } from './EmptyPortfolioState';
import DocumentSigningFlow from './DocumentSigningFlow';
import { CongratulationsPage } from './CongratulationsPage';
import { DiditKYCVerification } from './DiditKYCVerification';
import { NOWPaymentsCrypto } from './NOWPaymentsCrypto';
import { StripeCardForm } from './StripeCardForm';
import { useAuth } from './auth/AuthProvider';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51•••••itV');
interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledAmount?: number | null;
  onProceedToPayment?: (amount: number, method: string) => void;
}

export function FundingModal({ isOpen, onClose, prefilledAmount, onProceedToPayment }: FundingModalProps) {
  const { account, user, markDocumentsCompleted, processFunding, refreshAccount } = useAuth();
  const [amount, setAmount] = useState(prefilledAmount || 10000);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(true);
  const [showDocumentSigning, setShowDocumentSigning] = useState(false);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [showKYCVerification, setShowKYCVerification] = useState(false);
  const [showFundingPage, setShowFundingPage] = useState(false);
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [showWireInstructions, setShowWireInstructions] = useState(false);
  const [showBankTransfer, setShowBankTransfer] = useState(false);
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [wireInstructions, setWireInstructions] = useState(null);
  const [copiedField, setCopiedField] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [error, setError] = useState('');
  const [creatingPayment, setCreatingPayment] = useState(false);

  if (!isOpen) return null;

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount);
    setInvestmentAmount(selectedAmount.toLocaleString());
    setShowEmptyState(false);
    setShowFundingPage(true);
  };

  const handleProceedToPayment = () => {
    // Check user's completion status
    if (user?.documents_completed && user?.kyc_status === 'verified') {
      // Both documents and KYC complete - go straight to funding page
      setShowEmptyState(false);
      setShowFundingPage(true);
    } else if (user?.documents_completed && user?.kyc_status !== 'verified') {
      // Documents complete but KYC not verified - go to KYC verification
      setShowEmptyState(false);
      setShowKYCVerification(true);
    } else {
      // First time investor - show document signing
      setShowEmptyState(false);
      setShowDocumentSigning(true);
    }
  };

  const handleBack = () => {
    if (showPaymentForm) {
      setShowPaymentForm(false);
      setSelectedPaymentMethod('')
      setShowFundingPage(true);
    } else if (showWireInstructions) {
      setShowWireInstructions(false)
      setWireInstructions(null)
      setShowFundingPage(true)
    } else if (showBankTransfer) {
      setShowBankTransfer(false)
      setShowFundingPage(true)
    } else if (showCryptoPayment) {
      setShowCryptoPayment(false)
      setShowFundingPage(true)
    } else if (showFundingPage) {
      setShowFundingPage(false);
      if (user?.documents_completed && user?.kyc_status === 'verified') {
        setShowEmptyState(true)
      } else if (user?.documents_completed) {
        setShowKYCVerification(true)
      } else {
        setShowCongratulations(true)
      }
    } else if (showKYCVerification) {
      setShowKYCVerification(false)
      setShowCongratulations(true)
    } else if (showCongratulations) {
      setShowCongratulations(false);
      setShowDocumentSigning(true);
    } else if (showDocumentSigning) {
      setShowDocumentSigning(false);
      setShowEmptyState(true);
    }
  };

  const handleDocumentComplete = () => {
    console.log('🎉 Document completion handler called')
    // Mark documents as completed in database (background operation)
    markDocumentsCompleted().then(() => {
      console.log('✅ Documents marked as completed in user profile')
    }).catch(error => {
      console.warn('⚠️ Failed to mark documents completed:', error)
    })
    
    // Immediately proceed to congratulations
    setShowDocumentSigning(false);
    setShowCongratulations(true);
  };

  const handleContinueToPayment = () => {
    console.log('🎯 handleContinueToPayment called from congratulations');
    console.log('📊 User status:', {
      documents_completed: user?.documents_completed,
      kyc_status: user?.kyc_status
    });
    
    try {
      console.log('🔄 Transitioning from congratulations to KYC...');
      
      // Add small delay to ensure state is clean
      setTimeout(() => {
        try {
          setShowCongratulations(false);
          setShowKYCVerification(true);
          console.log('✅ Successfully navigated to KYC verification');
        } catch (innerError) {
          console.error('❌ Inner navigation error:', innerError);
          // Fallback: go directly to funding
          setShowCongratulations(false);
          setShowFundingPage(true);
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Error navigating to KYC:', error);
      // Fallback: go directly to funding if KYC fails
      setShowCongratulations(false);
      setShowFundingPage(true);
    }
  };

  const handleKYCComplete = () => {
    console.log('✅ KYC verification completed, proceeding to funding');
    // KYC complete, proceed to funding
    try {
      setShowKYCVerification(false);
      setShowCongratulations(false);
      setShowFundingPage(true);
      console.log('✅ Navigated to funding page');
    } catch (error) {
      console.error('❌ Error navigating to funding:', error);
    }
  };

  const handleBackToPortfolio = () => {
    // Reset all states and go back to empty state
    setShowDocumentSigning(false)
    setShowCongratulations(false)
    setShowKYCVerification(false)
    setShowFundingPage(false)
    setShowPaymentForm(false)
    setShowWireInstructions(false)
    setShowBankTransfer(false)
    setShowCryptoPayment(false)
    setShowEmptyState(true)
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      setInvestmentAmount(parseInt(value).toLocaleString());
    } else {
      setInvestmentAmount('');
    }
  };

  const handlePresetAmountSelect = (amount: number) => {
    setInvestmentAmount(amount.toLocaleString());
    setAmount(amount);
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
  };

  const handleProceedWithPayment = () => {
    if (investmentAmount && selectedPaymentMethod) {
      const numericAmount = parseInt(investmentAmount.replace(/,/g, ''));
      setAmount(numericAmount);
      
      // Route to different payment flows based on method
      if (selectedPaymentMethod === 'card') {
        setShowFundingPage(false);
        setShowPaymentForm(true);
      } else if (selectedPaymentMethod === 'wire') {
        generateWireInstructions(numericAmount);
        setShowFundingPage(false);
        setShowWireInstructions(true);
      } else if (selectedPaymentMethod === 'bank') {
        setShowFundingPage(false);
        setShowBankTransfer(true);
      } else if (selectedPaymentMethod === 'crypto') {
        setShowFundingPage(false);
        setShowCryptoPayment(true);
      }
    }
  };

  const generateWireInstructions = (amount: number) => {
    // Generate random reference code
    const referenceCode = 'GMC' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    setWireInstructions({
      amount: amount,
      referenceCode: referenceCode,
      bankName: 'Bank of America, N.A.',
      routingNumber: '026009593',
      accountNumber: '898163803149',
      accountName: 'Global Markets Consulting',
      swiftCode: 'BOFAUS3N',
      bankAddress: '222 Broadway, New York, NY 10038',
      beneficiaryAddress: '200 South Biscayne Boulevard, Suite 2800, Miami, FL 33131'
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleBackToFunding = () => {
    setShowPaymentForm(false);
    setShowWireInstructions(false);
    setShowBankTransfer(false);
    setShowCryptoPayment(false);
    setShowFundingPage(true);
    setError('');
  };

  const handlePaymentSuccess = (result: any) => {
    console.log('✅ Payment successful:', result);
    setShowPaymentForm(false);
    setError('');
    
    // Process the funding in the database
    processFunding(amount, 'stripe', 'Credit card payment').then(() => {
      console.log('✅ Account balance updated');
      // Refresh account data without page reload
      refreshAccount();
      onClose();
    }).catch(error => {
      console.error('❌ Failed to update account balance:', error);
      // Still close modal but show error
      onClose();
    });
  };

  const handlePaymentError = (error: string) => {
    console.error('❌ Payment error:', error);
    setError(error);
  };

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Instant processing',
      fee: 'No fees'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Building,
      description: '1-3 business days',
      fee: 'No fees'
    },
    {
      id: 'wire',
      name: 'Wire Transfer',
      icon: Zap,
      description: 'Same day processing',
      fee: '$25 fee'
    },
    {
      id: 'crypto',
      name: 'Cryptocurrency',
      icon: Coins,
      description: 'Bitcoin, Ethereum',
      fee: 'Network fees apply'
    }
  ];

  const presetAmounts = [5000, 10000, 25000, 50000];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto mobile-card">
        <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between safe-area-top">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900">
            {showEmptyState ? 'Fund Your Account' : 
             showDocumentSigning ? 'Complete Onboarding Documents' : 
             showCongratulations ? 'Welcome to Global Markets!' :
             showKYCVerification ? 'Identity Verification Required' :
             showFundingPage ? 'Capital Contribution' :
             showPaymentForm ? 'Secure Payment' :
             'Capital Contribution'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors mobile-button"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="p-4 md:p-6 safe-area-bottom">
          {showEmptyState ? (
            <EmptyPortfolioState 
              onFundAccount={handleProceedToPayment}
              onAmountSelect={handleAmountSelect}
            />
          ) : showDocumentSigning ? (
            <DocumentSigningFlow 
              onComplete={handleDocumentComplete}
              onBack={handleBackToPortfolio}
            />
          ) : showCongratulations ? (
            <CongratulationsPage 
              onContinueToPayment={handleContinueToPayment}
            />
          ) : showKYCVerification ? (
            <DiditKYCVerification 
              onVerificationComplete={handleKYCComplete}
              onClose={() => {
                setShowKYCVerification(false);
                setShowCongratulations(true);
              }}
            />
          ) : showPaymentForm ? (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBackToFunding}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  ← Back to Payment Methods
                </button>
              </div>
              
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-blue-900">Capital Contribution</h3>
                    <p className="text-sm sm:text-base text-blue-700">${amount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <Elements stripe={stripePromise}>
                <StripeCardForm 
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </div>
          ) : showFundingPage ? (
            <div>
              {/* Back Button */}
              <div className="mb-6">
                <button
                  onClick={() => {
                    if (user?.documents_completed && user?.kyc_status === 'verified') {
                      setShowFundingPage(false)
                      setShowEmptyState(true)
                    } else if (user?.documents_completed) {
                      setShowFundingPage(false)
                      setShowKYCVerification(true)
                    } else {
                      setShowFundingPage(false)
                      setShowCongratulations(true)
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  {user?.documents_completed ? '← Back to Portfolio' : '← Back to Portfolio Setup'}
                </button>
              </div>

              {/* Account Status Header */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 rounded-lg sm:rounded-xl">
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 sm:mb-2">
                    Current Capital
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    ${(account?.balance || 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 sm:mb-2">
                    Available Capital
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    ${(account?.available_balance || 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 sm:mb-2">
                    Account Status
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">
                    Active
                  </div>
                </div>
              </div>

              {/* Capital Contribution Section */}
              <div className="mb-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Capital Contribution</h3>
                
                {/* Amount Input */}
                <div className="relative mb-6">
                  <div className="absolute left-4 sm:left-6 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg sm:text-xl font-semibold">
                    USD
                  </div>
                  <input
                    type="text"
                    value={investmentAmount}
                    onChange={handleAmountChange}
                    placeholder="0.00"
                    className="w-full pl-16 sm:pl-20 pr-4 sm:pr-6 py-4 sm:py-6 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Preset Amount Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handlePresetAmountSelect(preset)}
                      className="py-3 sm:py-4 px-2 sm:px-4 border-2 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-700 font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                      <span className="hidden sm:inline">${preset.toLocaleString()}</span>
                      <span className="sm:hidden">${preset >= 1000 ? (preset/1000) + 'K' : preset}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const customAmount = prompt('Enter custom amount:');
                      if (customAmount && !isNaN(parseInt(customAmount))) {
                        handlePresetAmountSelect(parseInt(customAmount));
                      }
                    }}
                    className="py-3 sm:py-4 px-2 sm:px-4 border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-500 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all"
                  >
                    Custom
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-8">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                      className={`p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl text-left transition-all ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                        <method.icon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                        <span className="text-sm sm:text-base font-semibold text-gray-900">{method.name}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">{method.description}</div>
                      <div className="text-xs text-green-600 font-medium mt-1">{method.fee}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Features */}
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span>SIPC Protected up to $500,000</span>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-600">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                  <span>SEC Registered Investment Advisor</span>
                </div>
              </div>

              {/* Proceed Button */}
              {error && (
                <Card className="bg-red-50 border-red-200 mb-6">
                  <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-900 font-medium">{error}</span>
                  </div>
                  </CardContent>
                </Card>
              )}

              <Button
                onClick={handleProceedWithPayment}
                disabled={!investmentAmount || !selectedPaymentMethod || creatingPayment}
                variant="default"
                size="lg"
                className="w-full bg-navy-600 hover:bg-navy-700"
              >
                {creatingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    <span className="text-sm sm:text-base">Processing...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm sm:text-base">Proceed to Payment</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          ) : showWireInstructions ? (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBackToFunding}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  ← Back to Payment Methods
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Important Instructions</span>
                </div>
                <p className="text-sm text-blue-700">
                  Please include the reference code in your wire transfer. Processing typically takes 1-2 business days.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-700">Investment Amount</div>
                      <div className="text-2xl font-bold text-gray-900">${wireInstructions?.amount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700">Reference Code</div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-lg font-bold text-blue-600">{wireInstructions?.referenceCode}</span>
                        <button
                          onClick={() => copyToClipboard(wireInstructions?.referenceCode, 'reference')}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {copiedField === 'reference' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Bank Name</label>
                      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                        <span className="font-medium">{wireInstructions?.bankName}</span>
                        <button
                          onClick={() => copyToClipboard(wireInstructions?.bankName, 'bankName')}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedField === 'bankName' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Routing Number</label>
                      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                        <span className="font-mono">{wireInstructions?.routingNumber}</span>
                        <button
                          onClick={() => copyToClipboard(wireInstructions?.routingNumber, 'routing')}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedField === 'routing' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Account Number</label>
                      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                        <span className="font-mono">{wireInstructions?.accountNumber}</span>
                        <button
                          onClick={() => copyToClipboard(wireInstructions?.accountNumber, 'account')}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedField === 'account' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Account Name</label>
                      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                        <span className="font-medium">{wireInstructions?.accountName}</span>
                        <button
                          onClick={() => copyToClipboard(wireInstructions?.accountName, 'accountName')}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedField === 'accountName' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">SWIFT Code</label>
                      <div className="flex items-center justify-between bg-white border rounded-lg p-3">
                        <span className="font-mono">{wireInstructions?.swiftCode}</span>
                        <button
                          onClick={() => copyToClipboard(wireInstructions?.swiftCode, 'swift')}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedField === 'swift' ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-700">Bank Address</label>
                      <div className="bg-white border rounded-lg p-3">
                        <span className="text-sm">{wireInstructions?.bankAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="font-medium text-yellow-900">Wire Transfer Notes</span>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Include reference code: <strong>{wireInstructions?.referenceCode}</strong></li>
                    <li>• Processing time: 1-2 business days</li>
                    <li>• Wire fee: $25 (charged by your bank)</li>
                    <li>• International wires may take 3-5 business days</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    // Process wire transfer funding
                    const wireAmount = parseInt(investmentAmount.replace(/,/g, ''));
                    processFunding(wireAmount, 'wire', `Wire transfer - ${wireInstructions?.referenceCode}`).then(() => {
                      console.log('✅ Wire transfer recorded');
                      onClose();
                      // Refresh the page to show updated balance
                      setTimeout(() => window.location.reload(), 1000)
                    }).catch(error => {
                      console.error('❌ Failed to record wire transfer:', error);
                      setError('Failed to record wire transfer. Please try again.')
                    });
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors mt-6"
                >
                  I've Sent the Wire Transfer
                </button>
              </div>
            </div>
          ) : showBankTransfer ? (
            <div>
              <div className="mb-6">
                <button
                  onClick={handleBackToFunding}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  ← Back to Payment Methods
                </button>
              </div>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Bank Transfer Setup</h3>
                <p className="text-gray-600">
                  Connect your bank account for ${investmentAmount} investment
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Secure Bank Connection</span>
                </div>
                <p className="text-sm text-green-700 mb-4">
                  We use Plaid to securely connect to your bank account. Your login credentials are encrypted and never stored.
                </p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Bank-level security (256-bit encryption)</li>
                  <li>• No fees for ACH transfers</li>
                  <li>• Processing time: 1-3 business days</li>
                  <li>• Supports 11,000+ financial institutions</li>
                </ul>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    // In production, this would open Plaid Link
                    const bankAmount = parseInt(investmentAmount.replace(/,/g, ''))
                    processFunding(bankAmount, 'bank', 'Bank transfer via Plaid').then(() => {
                      console.log('✅ Bank transfer recorded')
                      onClose()
                      setTimeout(() => window.location.reload(), 1000)
                    }).catch(error => {
                      console.error('❌ Failed to record bank transfer:', error)
                      setError('Failed to record bank transfer. Please try again.')
                    })
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center"
                >
                  <Building className="h-5 w-5 mr-2" />
                  Complete Bank Transfer
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Powered by Plaid • Used by millions of Americans
                  </p>
                </div>
              </div>
            </div>
          ) : showCryptoPayment ? (
            <div>
              {user?.id ? (
                <NOWPaymentsCrypto 
                  amount={parseInt(investmentAmount.replace(/,/g, '') || '0')}
                  userId={user.id}
                  onSuccess={(payment) => {
                    console.log('✅ NOWPayments payment initiated:', payment)
                    // Payment will be confirmed via webhook, close modal
                    onClose()
                    // Show success message
                    setTimeout(() => {
                      alert('Crypto payment initiated! Your account will be updated when the payment is confirmed on the blockchain.')
                    }, 500)
                  }}
                  onError={(error) => {
                    console.error('❌ NOWPayments payment error:', error)
                    setError(error)
                  }}
                  onBack={handleBackToFunding}
                />
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
                  <p className="text-gray-600 mb-4">Please sign in to continue with crypto payment</p>
                  <button
                    onClick={onClose}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
                  >
                    Close and Sign In
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}