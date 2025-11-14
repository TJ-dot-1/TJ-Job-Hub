import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check, Star, CreditCard, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const Pricing = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isPro } = useAuth();
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individuals getting started',
      popular: false,
      features: [
        'Apply to 5 jobs per month',
        'View career advice 2 times per month',
        'Basic candidate matching',
        'Standard support',
        '30-day job listings',
        'Basic analytics'
      ],
      cta: 'Get Started',
      action: () => navigate('/register')
    },
    {
      name: 'Pro',
      price: user?.role === 'job_seeker' ? '$10' : '$50',
      period: 'per month',
      description: user?.role === 'job_seeker' ? 'Unlimited job applications and career resources' : 'Unlimited job postings and premium features',
      popular: true,
      features: user?.role === 'job_seeker' ? [
        'Unlimited job applications',
        'Unlimited career advice access',
        'Advanced AI matching',
        'Priority support',
        '90-day job listings',
        'Advanced analytics',
        'Resume optimization',
        'Interview preparation'
      ] : [
        'Unlimited job postings',
        'Advanced AI matching',
        'Priority support',
        '90-day job listings',
        'Advanced analytics',
        'Candidate messaging',
        'Custom branding',
        'API access'
      ],
      cta: isPro ? 'Current Plan' : 'Upgrade Now',
      action: () => handleSubscribe(user?.role === 'job_seeker' ? 'job_seeker' : 'employer', 'monthly')
    },
    {
      name: 'Pro Yearly',
      price: user?.role === 'job_seeker' ? '$100' : '$500',
      period: 'per year',
      description: user?.role === 'job_seeker' ? 'Save 17% with annual billing' : 'Save 17% with annual billing',
      popular: false,
      features: user?.role === 'job_seeker' ? [
        'Unlimited job applications',
        'Unlimited career advice access',
        'Advanced AI matching',
        'Priority support',
        '90-day job listings',
        'Advanced analytics',
        'Resume optimization',
        'Interview preparation',
        '17% savings'
      ] : [
        'Unlimited job postings',
        'Advanced AI matching',
        'Priority support',
        '90-day job listings',
        'Advanced analytics',
        'Candidate messaging',
        'Custom branding',
        'API access',
        '17% savings'
      ],
      cta: isPro ? 'Current Plan' : 'Upgrade Now',
      action: () => handleSubscribe(user?.role === 'job_seeker' ? 'job_seeker' : 'employer', 'yearly')
    }
  ];

  const handleSubscribe = async (planType, interval) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isPro) {
      toast.success('You are already on the Pro plan!');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/subscription/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ planType, interval })
      });

      const data = await response.json();

      if (response.ok) {
        // Redirect to Stripe Checkout
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

  const handleContactSales = () => {
    window.location.href = 'mailto:sales@yourcompany.com?subject=Pricing Inquiry';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the plan that works best for your hiring needs. All plans include our core features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl shadow-lg ${
                plan.popular
                  ? 'ring-2 ring-blue-600 bg-white dark:bg-gray-800 transform scale-105'
                  : 'bg-white dark:bg-gray-800'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                    <Star className="w-4 h-4 mr-1 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.period !== 'forever' && plan.period !== 'tailored' && (
                      <span className="text-gray-500 dark:text-gray-400 ml-2">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button
                  onClick={plan.action}
                  disabled={loading || (isPro && plan.name !== 'Free')}
                  className={`w-full py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    plan.popular && !isPro
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : isPro && plan.name !== 'Free'
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : isPro && plan.name !== 'Free' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {plan.cta}
                    </>
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            All plans include a 14-day free trial. No credit card required.
          </p>
          <button 
            onClick={handleContactSales}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Need a custom plan? Contact our sales team →
          </button>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                question: "Can I change plans later?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately."
              },
              {
                question: "Is there a free trial?",
                answer: "Yes, the Professional plan includes a 14-day free trial. No credit card required."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers for annual plans."
              },
              {
                question: "Do you offer discounts for non-profits?",
                answer: "Yes, we offer special pricing for registered non-profit organizations. Contact our sales team for details."
              },
              {
                question: "Can I cancel anytime?",
                answer: "Yes, you can cancel your subscription at any time. You'll have access until the end of your billing period."
              },
              {
                question: "Do you offer annual billing?",
                answer: "Yes, we offer 20% discount for annual billing on the Professional plan."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;