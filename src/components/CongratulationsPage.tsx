import React, { useState, useEffect } from 'react';
import { CheckCircle, ArrowRight, DollarSign } from 'lucide-react';

interface CongratulationsPageProps {
  onContinueToPayment: () => void;
}

export function CongratulationsPage({ onContinueToPayment }: CongratulationsPageProps) {
  const [showContent, setShowContent] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    try {
      setTimeout(() => setShowContent(true), 300);
      setTimeout(() => setShowButton(true), 800);
    } catch (err) {
      console.error('❌ Congratulations page initialization error:', err);
      setError('Page initialization failed');
    }
  }, []);

  const handleContinueClick = () => {
    console.log('🎉 Continue to payment clicked from congratulations page');
    
    if (!onContinueToPayment) {
      console.error('❌ onContinueToPayment function not provided');
      setError('Navigation function not available');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      console.log('🚀 Calling onContinueToPayment...');
      onContinueToPayment();
    } catch (error) {
      console.error('❌ Error continuing to payment:', error);
      setError('Failed to continue to payment. Please try again.');
      setIsProcessing(false);
    }
  };
  
  // Error boundary fallback
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-red-900 mb-4">
          Something went wrong
        </h3>
        <p className="text-gray-600 mb-6">
          {error}
        </p>
        <button
          onClick={() => {
            setError('');
            setIsProcessing(false);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="relative bg-white min-h-screen overflow-hidden">
      {/* Floating Balloons */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 text-4xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>🎈</div>
        <div className="absolute top-32 right-16 text-3xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}>🎉</div>
        <div className="absolute top-16 right-32 text-2xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}>🎊</div>
        <div className="absolute bottom-32 left-20 text-3xl animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4.5s' }}>🎈</div>
        <div className="absolute bottom-20 right-20 text-2xl animate-bounce" style={{ animationDelay: '1.5s', animationDuration: '3s' }}>🎉</div>
        <div className="absolute top-1/2 left-8 text-2xl animate-bounce" style={{ animationDelay: '2.5s', animationDuration: '4s' }}>🎊</div>
        <div className="absolute top-1/3 right-8 text-3xl animate-bounce" style={{ animationDelay: '0.8s', animationDuration: '3.8s' }}>🎈</div>
      </div>

      {/* Confetti Animation */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
              animation: `confetti ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes confetti {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 1;
          }
        }
      `}</style>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-2xl w-full text-center">
          {/* Main Success Icon */}
          <div className={`transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4 leading-tight">
              Congratulations!
            </h1>
            
            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 mb-6">
              Welcome to Global Markets Consulting
            </h2>
          </div>

          {/* Success Message */}
          <div className={`transition-all duration-1000 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-white rounded-2xl p-8 border border-gray-200 mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold text-black mb-4">
                Your Documents Are Complete!
              </h3>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                You're now ready to activate your account and complete your investment.
              </p>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className={`transition-all duration-1000 transform ${showButton ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
            <button
              onClick={handleContinueClick}
              disabled={isProcessing}
              className="group bg-black hover:bg-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              {isProcessing ? (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-6 w-6" />
                  <span>Complete Your Investment</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}