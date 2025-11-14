import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export default stripe;

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  job_seeker: {
    monthly: {
      priceId: 'price_job_seeker_monthly', // Replace with actual Stripe price ID
      amount: 10,
      currency: 'usd',
      interval: 'month'
    },
    yearly: {
      priceId: 'price_job_seeker_yearly', // Replace with actual Stripe price ID
      amount: 100,
      currency: 'usd',
      interval: 'year'
    }
  },
  employer: {
    monthly: {
      priceId: 'price_employer_monthly', // Replace with actual Stripe price ID
      amount: 50,
      currency: 'usd',
      interval: 'month'
    },
    yearly: {
      priceId: 'price_employer_yearly', // Replace with actual Stripe price ID
      amount: 500,
      currency: 'usd',
      interval: 'year'
    }
  }
};

export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
};