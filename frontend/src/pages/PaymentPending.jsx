import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState('pending'); // 'pending', 'completed', 'failed'
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const transactionId = location.state?.transactionId;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!transactionId) {
      navigate('/pricing');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setStatus('expired');
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Poll for payment status (in a real app, you'd use websockets or server-sent events)
    const pollTimer = setInterval(async () => {
      try {
        const response = await fetch('/api/subscription/payment-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ transactionId })
        });

        const data = await response.json();

        if (response.ok && data.status === 'completed') {
          setStatus('completed');
          clearInterval(pollTimer);
          clearInterval(timer);
          toast.success('Payment completed successfully!');
          setTimeout(() => navigate('/dashboard'), 3000);
        } else if (data.status === 'failed') {
          setStatus('failed');
          clearInterval(pollTimer);
          clearInterval(timer);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 5000); // Check every 5 seconds

    return () => {
      clearInterval(timer);
      clearInterval(pollTimer);
    };
  }, [isAuthenticated, transactionId, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!transactionId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          {status === 'completed' ? (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your subscription has been activated. Redirecting to dashboard...
              </p>
            </>
          ) : status === 'failed' ? (
            <>
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your payment could not be processed. Please try again.
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </>
          ) : status === 'expired' ? (
            <>
              <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Timeout
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                The payment session has expired. Please initiate a new payment.
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Start Over
              </button>
            </>
          ) : (
            <>
              <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Payment Pending
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Please check your phone and complete the M-Pesa payment.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Transaction ID:</strong> {transactionId}
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                  Time remaining: <strong>{formatTime(timeLeft)}</strong>
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Do not close this page until payment is complete.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;