import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Smartphone, Loader, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [mpesaNumber, setMpesaNumber] = useState('');

  // Get plan details from location state
  const planDetails = location.state?.planDetails;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!planDetails) {
      navigate('/pricing');
      return;
    }
  }, [isAuthenticated, planDetails, navigate]);

  const handleCardPayment = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planType: planDetails.planType,
          interval: planDetails.interval
        })
      });

      const data = await response.json();

      if (response.ok) {
        window.location.href = data.url;
      } else {
        toast.error(data.message || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleMpesaPayment = async () => {
    if (!mpesaNumber || !mpesaNumber.match(/^(\+254|254|0)[17]\d{8}$/)) {
      toast.error('Please enter a valid M-Pesa number');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/subscription/mpesa-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planType: planDetails.planType,
          interval: planDetails.interval,
          phoneNumber: mpesaNumber
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('M-Pesa payment initiated. Please check your phone for the STK push.');
        // You might want to poll for payment status or redirect to a confirmation page
        navigate('/subscription/pending', { state: { transactionId: data.checkoutRequestId } });
      } else {
        toast.error(data.message || 'Failed to initiate M-Pesa payment');
      }
    } catch (error) {
      console.error('M-Pesa payment error:', error);
      toast.error('Failed to process M-Pesa payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'card') {
      handleCardPayment();
    } else {
      handleMpesaPayment();
    }
  };

  if (!planDetails) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/pricing')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pricing
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Complete Your Payment
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {planDetails.planType === 'job_seeker' ? 'Job Seeker' : 'Employer'} Pro Plan - {planDetails.interval}
            </p>
            <div className="mt-4">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                ${planDetails.interval === 'yearly' ? (planDetails.planType === 'job_seeker' ? '100' : '500') : (planDetails.planType === 'job_seeker' ? '10' : '50')}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                /{planDetails.interval === 'yearly' ? 'year' : 'month'}
              </span>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="card"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="card" className="flex items-center cursor-pointer">
                <CreditCard className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">Credit Card</span>
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="mpesa"
                name="paymentMethod"
                value="mpesa"
                checked={paymentMethod === 'mpesa'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-blue-600"
              />
              <label htmlFor="mpesa" className="flex items-center cursor-pointer">
                <Smartphone className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">M-Pesa</span>
              </label>
            </div>
          </div>

          {paymentMethod === 'mpesa' && (
            <div className="mb-6">
              <label htmlFor="mpesaNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                M-Pesa Phone Number
              </label>
              <input
                type="tel"
                id="mpesaNumber"
                value={mpesaNumber}
                onChange={(e) => setMpesaNumber(e.target.value)}
                placeholder="0712345678 or +254712345678"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Enter your M-Pesa registered phone number
              </p>
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading || (paymentMethod === 'mpesa' && !mpesaNumber)}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay with ${paymentMethod === 'card' ? 'Card' : 'M-Pesa'}`
            )}
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            Your payment is secure and encrypted. You can cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;